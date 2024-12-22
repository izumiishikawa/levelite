const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Task = require('./models/tasks');
const path = require("path");
const User = require('./models/users'); 

const app = express();

app.use("/files", express.static(path.join(__dirname, "tmp", "uploads")));

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


const startOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const endOfToday = () => {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now;
};
cron.schedule('59 23 * * *', async () => {
  console.log('Iniciando tarefas do cron job consolidado...');

  const users = await User.find();

  console.log('Verificação de progresso diário iniciada...');
  for (const user of users) {
    try {
      if (user.inPenaltyZone) {
        user.health -= 35;
        user.inPenaltyZone = false;

        const pendingPenaltyTasks = await Task.find({ userId: user._id, type: "penaltyTask", status: 'pending' });
        for (const task of pendingPenaltyTasks) {
          task.status = "incomplete";
          await task.save();
        }
      }

      const pendingTasks = await Task.find({
        userId: user._id,
        type: "dailyQuests",
        status: 'pending',
        dateAssigned: { $gte: startOfToday(), $lt: endOfToday() },
      });

      const hasIncompleteTasks = pendingTasks.length > 0;

      for (const task of pendingTasks) {
        task.status = 'incomplete';
        await task.save();
      }

      if (hasIncompleteTasks) {
        user.streak = 0;
        user.inPenaltyZone = true;
        console.log(`Streak do usuário ${user._id} foi zerada e penalidades serão geradas.`);

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
            status: "pending",
            dateAssigned: new Date(),
          });
          savedTasks.push(savedTask);
        }
        console.log(`Tarefas de penalidade criadas para o usuário ${user._id}`);
      }

      user.generatedToday = false;
      user.allDone = false;

      await user.save();
    } catch (error) {
      console.error(`Erro ao verificar tarefas para o usuário ${user._id}:`, error.message);
    }
  }
  console.log('Verificação de progresso diário concluída.');

  console.log('Resetando campos generatedToday dos SkillBooks...');
  try {
    await SkillBook.updateMany({}, { $set: { generatedToday: false } });
    console.log('Campos generatedToday resetados para todos os SkillBooks.');
  } catch (error) {
    console.error('Erro ao resetar campos generatedToday nos SkillBooks:', error.message);
  }

  console.log('Geração de tarefas diárias iniciada...');
  for (const user of users) {
    try {
      const dailyTasks = await Task.find({
        userId: user._id,
        recurrence: 'daily',
        dateAssigned: { $lt: startOfToday() },
      });

      for (const task of dailyTasks) {
        const existingTask = await Task.findOne({
          userId: user._id,
          title: task.title,
          recurrence: 'daily',
          dateAssigned: { $gte: startOfToday(), $lt: endOfToday() },
        });

        if (!existingTask) {
          const xpReward = calculateTaskXpReward(user.level, task.intensityLevel, user.xpForNextLevel);

          await Task.create({
            userId: task.userId,
            title: task.title,
            description: task.description,
            attribute: task.attribute,
            type: task.type,
            intensityLevel: task.intensityLevel,
            xpReward,
            status: 'pending',
            dateAssigned: new Date(),
            recurrence: 'daily',
          });
          console.log(`Tarefa diária recriada: ${task.title} para o usuário ${user._id}`);
        }
      }
    } catch (error) {
      console.error(`Erro ao processar tarefas diárias para o usuário ${user._id}:`, error.message);
    }
  }
  console.log('Geração de tarefas diárias concluída.');

  console.log('Verificação de tarefas semanais iniciada...');
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
  
        console.log(`Tarefa semanal marcada como incompleta: ${task.title} para o usuário ${task.userId}`);
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
