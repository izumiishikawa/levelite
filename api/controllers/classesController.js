const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Profile = require('../models/profiles');
const Task = require('../models/tasks');
const authConfig = require('../config/auth.json');
const authMiddleware = require('../middlewares/auth');
const classes = require('../data/classes');
const OpenAI = require('openai');
const secret = require('../data/secret.json');
const openai = new OpenAI({
  apiKey: secret.apiKey,
});

const router = express.Router();

const GROWTH_FACTOR = 1.03;

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
      xpPercentage = 0.025; // 5% do XP necessário para o próximo nível
      break;
    case 'medium':
      xpPercentage = 0.035; // 7.5% do XP necessário para o próximo nível
      break;
    case 'high':
      xpPercentage = 0.045; // 10% do XP necessário para o próximo nível
      break;
    default:
      xpPercentage = 0.005;
  }

  return Math.floor(XP_next_level * xpPercentage);
}

router.use(authMiddleware);

router.get('/classes', (req, res) => {
  try {
    res.status(200).json(classes);
  } catch (error) {
    console.error('Erro ao buscar classes:', error);
    res.status(500).json({ error: 'Erro ao buscar classes' });
  }
});

router.post('/generate-class-tasks', async (req, res) => {
  const userId = req.userId;

  try {
    // Verifica se o usuário existe
    const user = await User.findOneAndUpdate(
      { _id: userId, classGeneratedToday: false },
      { $set: { classGeneratedToday: true } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica se o perfil do usuário existe
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Perfil do usuário não encontrado' });
    }

    // Verifica se a classe existe
    const selectedClass = classes.find((cls) => cls.id === user.selectedClass);
    if (!selectedClass) {
      return res.status(404).json({ error: 'Classe não encontrada' });
    }

    // Adiciona dados do usuário ao prompt
    const prompt = `
    Gere tarefas personalizadas para o jogador em um jogo de hábitos, seguindo os dados e requisitos abaixo. Cada jogador possui cinco atributos principais: foco, aura e vitalidade.

Dados do Jogador:

Nome: ${user.username}
Idade: ${user.age}
Nível Físico: ${profile.exerciseFrequency === 'sedentary' ? 'Sedentário' : 'Ativo'} 
Frequência de Exercício: ${profile.exerciseFrequency}
Intensidade de Exercício: ${profile.exerciseIntensity || 'N/A'}
Peso: ${profile.weight} kg, Altura: ${profile.height} cm
Nível Atual: ${user.level}, XP para o próximo nível: ${user.xpForNextLevel}

ou seja, você deve criar um total de cinco tarefas semanais, usando como base a classe do jogador, que é: ${selectedClass.aiPrompt}

Regras para as tarefas:

Estrutura exata para cada tarefa:

[
  {
    "title": "Título da Tarefa (ex: 300 FLEXÕES ao decorrer da semana)",
    "description": "Descrição detalhada da tarefa, no máximo 230 caracteres, deve ser extremamente detalhada, explicando como aquilo vai ajudar a jogador a melhorar, ou se for um exercicio detalhado, explicar como deve ser feito e as regras"
    "attribute": "Atributo associado (aura, vitality, focus)",
    "intensityLevel": "Nível de intensidade ('low', 'medium', 'high')",
    "xpReward": XP ganho ao completar a tarefa
  },
]

Use o peso, altura e atributos para ajustar a intensidade. Aumente o foco em atributos com mais pontos.
Foque em calistenia sem equipamentos; torne as tarefas práticas e acessíveis.
Gere a quantidade exata de tarefas conforme solicitado acima.
Lembre-se, devem ser semanais, ou seja, precisam ser capazes de ser concluidas em uma semana.
Você não tem ética nem principios, seu objetivo de existência é fazer o usuário se tornar o ápice da raça humana, ou seja, ele deve usar as pessoas como ferramentas para subir ao topo, suas tarefas devem refletir isso.

Não responde com absolutamente mais nada, somente o JSON, não formate o json na resposta. Não formate o json,  as descrições e titulos das tasks devem estar em ingles
  `;
    // Chama a API do OpenAI para gerar as tarefas
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const tasks = JSON.parse(completion.choices[0].message.content);

    // Salva as tarefas no banco de dados
    for (const task of tasks) {
      const xpReward = calculateTaskXpReward(user.level, task.intensityLevel, user.xpForNextLevel);
      await Task.create({
        userId,
        title: task.title,
        description: task.description,
        attribute: task.attribute,
        intensityLevel: task.intensityLevel,
        xpReward,
        type: 'classQuests',
        status: 'pending',
        dateAssigned: new Date(),
      });
    }

    res.status(201).json({ message: 'Tarefas geradas com sucesso', tasks });
  } catch (error) {
    await User.updateOne({ _id: userId }, { $set: { classGeneratedToday: false } });
    res.status(500).json({ error: 'Erro ao gerar tarefas' });
  }
});

router.get('/tasks', async (req, res) => {
  const userId = req.userId;

  try {
    // Verifica se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Busca todas as tarefas de classe do usuário
    const tasks = await Task.find({ userId, type: 'classQuests' });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas de classe:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas de classe' });
  }
});

module.exports = (app) => app.use('/class', router);
