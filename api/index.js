const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Task = require('./models/tasks');
const path = require('path');
const User = require('./models/users');

const app = express();

app.use('/files', express.static(path.join(__dirname, 'tmp', 'uploads')));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/levelite', {});

const connection = mongoose.connection;

connection.on('connected', () => {
  console.log('MongoDB database connection established successfully');
});

mongoose.Promise = global.Promise;

require('./controllers/index')(app);

const PORT = 3000 || 3001;

const GROWTH_FACTOR = 1.03;

function calculateXpForNextLevel(level, base_exp) {
  return Math.floor(base_exp * Math.pow(GROWTH_FACTOR, level - 1));
}

function calculateTaskXpReward(level, difficulty, base_exp) {
  const XP_next_level = calculateXpForNextLevel(level, base_exp);

  let xpPercentage;

  switch (difficulty) {
    case 'low':
      xpPercentage = 0.025;
      break;
    case 'medium':
      xpPercentage = 0.035;
      break;
    case 'high':
      xpPercentage = 0.045;
      break;
    default:
      xpPercentage = 0.005;
  }

  return Math.floor(XP_next_level * xpPercentage);
}

cron.schedule('59 23 * * *', async () => {
  console.log('Iniciando tarefas do cron job consolidado...');
  var startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const users = await User.find();

  for (const user of users) {
    try {
      // se o usuario ainda estiver na zona de penalidade, quer dizer que ele não fez as tarefas de penalidade, logo, ele toma dano e sai da zona de penalidade
      if (user.inPenaltyZone) {
        user.health -= 35;
        user.inPenaltyZone = false;

        await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { penalityDates: startOfToday.toISOString().split('T')[0] } },
          { new: true }
        );
      }

      await Task.deleteMany({
        userId: user._id,
        type: 'penaltyTask',
      });

      // busca todas as tarefas diárias do usuário
      const dailyQuests = await Task.find({
        userId: user._id,
        type: 'dailyQuests',
      });

      // se tiver tarefas
      if (dailyQuests.length > 0) {
        const allCompleted = dailyQuests.every((task) => task.status === 'completed'); // verifica se todas estão completas

        if (allCompleted) {
          await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { completedDates: startOfToday.toISOString().split('T')[0] } },
            { new: true }
          );
        } else {
          user.inPenaltyZone = true;
          user.streak = 0;

          const penaltyTasks = [
            { title: '100 push-ups', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
            { title: '100 sit-ups', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
            { title: '100 squats', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
            { title: '5 km run', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
          ];

          const savedTasks = [];
          for (const task of penaltyTasks) {
            const savedTask = await Task.create({
              userId: user._id,
              title: task.title,
              attribute: task.attribute,
              intensityLevel: task.intensityLevel,
              xpReward: task.xpReward,
              type: 'penaltyTask',
              status: 'pending',
              dateAssigned: new Date(),
            });
            savedTasks.push(savedTask);
          }
        }

        await Task.deleteMany({
          userId: user._id,
          type: 'dailyQuests',
        });
      } else {
        console.log('o usuario', user.username, 'não tem tarefas hoje');
      }

      user.allDone = false;
      user.generatedToday = false;

      await user.save();
    } catch (err) {
      console.log(err);
    }
  }

  console.log('Processamento de tarefas personalizadas iniciado...');
  for (const user of users) {
    try {
      const today = new Date().getDay();

      const customTasks = await Task.find({
        userId: user._id,
        recurrence: 'custom',
        specificDays: today,
      });

      for (const task of customTasks) {
        if (task.status === 'completed') {
          const todayDate = new Date().toISOString().split('T')[0];

          if (!task.completedDates.includes(todayDate)) {
            task.completedDates.push(todayDate);
          }

          task.status = 'pending';
          await task.save();

          console.log(`Tarefa personalizada atualizada: ${task.title} para o usuário ${user._id}`);
        } else {
          console.log(`Tarefa personalizada pendente: ${task.title} para o usuário ${user._id}`);
        }
      }
    } catch (error) {
      console.error(
        `Erro ao processar tarefas personalizadas para o usuário ${user._id}:`,
        error.message
      );
    }
  }
  console.log('Processamento de tarefas personalizadas concluído.');

  console.log('Verificação de tarefas semanais do usuário iniciada...');
  try {
    const weeklyUserTasks = await Task.find({
      recurrence: 'weekly',
      type: 'userTask',
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const task of weeklyUserTasks) {
      if (task.dateAssigned < oneWeekAgo) {
        if (task.status === 'completed') {
          const todayDate = new Date().toISOString().split('T')[0];
          if (!task.completedDates.includes(todayDate)) {
            task.completedDates.push(todayDate);
          }

          task.status = 'pending';
          task.dateAssigned = new Date();
          await task.save();

          console.log(
            `Tarefa semanal do usuário concluída e resetada: ${task.title} para o usuário ${task.userId}`
          );
        } else if (task.status === 'pending') {
          task.dateAssigned = new Date();
          await task.save();

          console.log(
            `Tarefa semanal do usuário pendente mantida e data atualizada: ${task.title} para o usuário ${task.userId}`
          );
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar tarefas semanais do usuário:', error.message);
  }
  console.log('Verificação de tarefas semanais do usuário concluída.');

  console.log('Geração de tarefas diárias iniciada...');
  for (const user of users) {
    try {
      const dailyTasks = await Task.find({
        userId: user._id,
        recurrence: 'daily',
        dateAssigned: { $lt: startOfToday() },
      });

      for (const task of dailyTasks) {
        if (task.status === 'completed') {
          const today = new Date().toISOString().split('T')[0];

          if (!task.completedDates.includes(today)) {
            task.completedDates.push(today);
          }

          task.status = 'pending';
          await task.save();

          console.log(`Tarefa diária atualizada: ${task.title} para o usuário ${user._id}`);
        } else {
          console.log(`Tarefa pendente: ${task.title} para o usuário ${user._id}`);
        }
      }
    } catch (error) {
      console.error(`Erro ao processar tarefas diárias para o usuário ${user._id}:`, error.message);
    }
  }

  console.log('Verificação de tarefas semanais de classe iniciada...');
  try {
    const weeklyTasks = await Task.find({
      recurrence: 'weekly',
      type: 'classQuests',
      status: 'pending',
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const task of weeklyTasks) {
      if (task.dateAssigned < oneWeekAgo) {
        task.status = 'incomplete';
        await task.save();

        const user = await User.findById(task.userId);
        if (user) {
          user.classGeneratedWeek = false;
          await user.save();
          console.log(`classGeneratedWeek resetado para o usuário ${user._id}`);
        }
      }
    }
  } catch (error) {
    console.error('Erro ao verificar tarefas semanais:', error.message);
  }
  console.log('Verificação de tarefas semanais concluída.');

  console.log('Cron job consolidado finalizado.');
});

app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});
