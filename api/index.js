const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const axios = require('axios');
const Task = require('./models/tasks');
const User = require('./models/users'); // Certifique-se de ajustar o caminho do modelo User

const app = express();

// Middleware para permitir CORS e parsing de JSON
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com o banco de dados MongoDB
mongoose.connect('mongodb://localhost:27017/levelite', {});

const connection = mongoose.connection;

connection.on('connected', () => {
  console.log('MongoDB database connection established successfully');
});

mongoose.Promise = global.Promise;

// Importa as rotas do controlador
require('./controllers/index')(app);

const PORT = 3000 || 3001;

const GROWTH_FACTOR = 1.5; // Fator de crescimento maior para aumentar drasticamente o XP necessário por nível

// Função para calcular o XP necessário para o próximo nível
function calculateXpForNextLevel(level, base_exp) {
  return Math.floor(base_exp * Math.pow(GROWTH_FACTOR, level - 1));
}

// Função para calcular o XP de recompensa com base na dificuldade e nível do jogador
function calculateTaskXpReward(level, difficulty, base_exp) {
  const XP_next_level = calculateXpForNextLevel(level, base_exp);

  // Percentual ajustado para atingir ~16 tarefas
  let xpPercentage;

  switch (difficulty) {
    case 'low':
      xpPercentage = 0.005; // 5% do XP necessário para o próximo nível
      break;
    case 'medium':
      xpPercentage = 0.007; // 7.5% do XP necessário para o próximo nível
      break;
    case 'high':
      xpPercentage = 0.010; // 10% do XP necessário para o próximo nível
      break;
    default:
      xpPercentage = 0.005;
  }

  return Math.floor(XP_next_level * xpPercentage);
}

/**
 * Função utilitária para calcular o início e fim do dia atual.
 * Necessário para filtrar tarefas específicas do dia.
 */
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

  // 1. Verificação de progresso diário
  console.log('Verificação de progresso diário iniciada...');
  for (const user of users) {
    try {
      if (user.inPenaltyZone) {
        user.health = user.health - 35
        user.inPenaltyZone = false;
      }

      const pendingTasks = await Task.find({
        userId: user._id,
        status: 'pending',
        dateAssigned: { $gte: startOfToday(), $lt: endOfToday() },
      });

      // Verifica se existem tarefas pendentes ou incompletas
      const hasIncompleteTasks = await Task.exists({
        userId: user._id,
        dateAssigned: { $gte: startOfToday(), $lt: endOfToday() },
        status: { $in: ['pending'] },
      });

      
      // Marca todas as tarefas pendentes como incompletas
      for (const task of pendingTasks) {
        task.status = 'incomplete';
        await task.save();
      }

      // Zera a streak e gera penalidades se houver tarefas não concluídas
      if (hasIncompleteTasks) {
        user.streak = 0;
        user.inPenaltyZone = true;
        console.log(`Streak do usuário ${user._id} foi zerada e penalidades serão geradas.`);

        // Cria tarefas de penalidade fixas
        const penaltyTasks = [
          { title: '100 flexões', attribute: 'vitality', intensityLevel: 'high', xpReward: 50 },
          { title: '100 abdominais', attribute: 'vitality', intensityLevel: 'high', xpReward: 50 },
          { title: '100 agachamentos', attribute: 'vitality', intensityLevel: 'high', xpReward: 50 },
          { title: '5 km de corrida', attribute: 'vitality', intensityLevel: 'high', xpReward: 100 },
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
            dateAssigned: new Date(), // Data de penalidade é o momento atual
          });
          savedTasks.push(savedTask);
        }
        console.log(`Tarefas de penalidade criadas para o usuário ${user._id}`);
      }

      user.generatedToday = false;

      await user.save();
    } catch (error) {
      console.error(`Erro ao verificar tarefas para o usuário ${user._id}:`, error.message);
    }
  }
  console.log('Verificação de progresso diário concluída.');

  // 2. Geração de tarefas diárias
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

  console.log('Cron job consolidado finalizado.');
});

/**
 * Inicia o servidor Express
 */
app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});
