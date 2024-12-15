const express = require('express');
const User = require('../models/users');
const Profile = require('../models/profiles');
const Task = require('../models/tasks');
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey:
    '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',
});

const router = express.Router();

const GROWTH_FACTOR = 1.03;

function calculateXpForNextLevel(level, base_exp) {
  return Math.floor(base_exp * Math.pow(GROWTH_FACTOR, level - 1));
}

function calculateTaskXpReward(level, difficulty, base_exp) {
  const XP_next_level = calculateXpForNextLevel(level, base_exp);

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

router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    const profile = await Profile.findOne({ userId: req.query.userId });

    console.log(req.query.userId);
    console.log(req.query.user);

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (!profile) {
      return res.status(404).send({ error: 'Profile not found' });
    }

    const userObject = user.toObject();
    const profileObject = profile.toObject();

    delete profileObject._id;
    delete profileObject.userId;

    const mergedData = {
      ...userObject,
      ...profileObject,
    };

    return res.status(200).json(mergedData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to retrieve profile' });
  }
});

router.put('/distribute-points', async (req, res) => {
  const { aura, vitality, focus } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    let pointsSpent = vitality + aura + focus;

    if (pointsSpent > user.pointsToDistribute) {
      return res.status(400).send({ error: 'Not enough points to distribute' });
    }

    user.attributes.vitality += vitality;
    user.attributes.aura += aura;
    user.attributes.focus += focus;

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to distribute points' });
  }
});

router.put('/progress', async (req, res) => {
  const { xpGained } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.currentXP += xpGained;

    while (user.currentXP >= user.xpForNextLevel) {
      user.currentXP -= user.xpForNextLevel;
      user.level += 1;
      user.pointsToDistribute += 3;
      user.xpForNextLevel += 50;
    }

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to update progress' });
  }
});

router.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId });

    if (!achievements) {
      return res.status(404).send({ error: 'No achievements found' });
    }

    return res.status(200).json(achievements);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to retrieve achievements' });
  }
});

router.get('/tasks', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const tasks = await Task.find({
      userId: req.query.userId,
      $or: [
        { status: 'pending', skillBookId: null, type: 'dailyQuests' },
        { status: 'pending', skillBookId: null, type: 'userTask' },
        {
          status: 'completed',
          type: 'dailyQuests',
          dateCompleted: { $gte: startOfDay, $lt: endOfDay },
        },
      ],
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).send({ error: 'Failed to retrieve tasks' });
  }
});

router.patch('/tasks/restore', async (req, res) => {
  try {
    const taskId = req.query.taskId;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    if (task.status === 'pending') {
      return res.status(400).send({ error: 'Task is already in pending status' });
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, { status: 'pending' }, { new: true });

    const userId = task.userId;
    const xpPenalty = task.xpReward || 0;

    const user = await User.findById(userId);
    if (user) {
      user.currentXP -= xpPenalty;

      while (user.xp < 0 && user.level > 1) {
        user.level -= 1;
        const xpRequiredForLevel = calculateXpForNextLevel(user.level);
        user.currentXP += xpRequiredForLevel;
      }

      if (user.level === 1 && user.xp < 0) {
        user.xp = 0;
      }

      await user.save();
    }

    return res.status(200).json({
      message: 'Task restored successfully',
      task: updatedTask,
      user: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to restore task' });
  }
});

router.get('/penalty-tasks', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const tasks = await Task.find({
      userId: req.query.userId,
      type: 'penaltyTask',
      skillBookId: null,
      $or: [
        { status: 'pending' },
        {
          status: 'completed',
          type: 'penaltyTask',
          dateCompleted: { $gte: startOfDay, $lt: endOfDay },
        },
      ],
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).send({ error: 'No penalty tasks found' });
    }

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to retrieve penalty tasks' });
  }
});

router.post('/create-user-task', async (req, res) => {
  const { userId, title, description, attribute, intensityLevel, recurrence, xpReward } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const xpReward = calculateTaskXpReward(user.level, intensityLevel, user.xpForNextLevel);
    const task = await Task.create({
      userId,
      title,
      description,
      attribute,
      intensityLevel,
      xpReward,
      recurrence,
      type: 'userTask',
      status: 'pending',
      dateAssigned: new Date(),
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to create task' });
  }
});

router.delete('/delete-task', async (req, res) => {
  const { taskId } = req.query;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    await Task.deleteOne({ _id: taskId });

    return res.status(200).json({
      message: 'Task deleted successfully',
      taskId,
    });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return res.status(500).send({ error: 'Failed to delete task' });
  }
});

router.put('/generated-today', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { generatedToday: true }, { new: true });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).send({ error: 'Failed to update user' });
  }
});

router.put('/class-generated-today', async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, { classGeneratedToday: true }, { new: true });

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).send({ error: 'Failed to update user' });
  }
});

router.put('/complete-task', async (req, res) => {
  const { taskId } = req.query;
  const { userId } = req.body;

  try {
    const task = await Task.findOne({ _id: taskId, userId, status: 'pending' });
    if (!task) {
      return res.status(404).send({ error: 'Task not found or already completed' });
    }

    task.status = 'completed';
    task.dateCompleted = new Date();
    let leveledUp = false;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.currentXP += task.xpReward;

    while (user.currentXP >= user.xpForNextLevel) {
      user.currentXP -= user.xpForNextLevel;
      user.level += 1;
      user.pointsToDistribute += 3;
      user.xpForNextLevel = calculateXpForNextLevel(user.level, user.xpForNextLevel);
      leveledUp = true;
    }

    await task.save();

    if (task.type === 'dailyQuests') {
      const remainingDailyTasks = await Task.find({
        userId,
        type: 'dailyQuests',
        status: 'pending',
      });

      if (remainingDailyTasks.length === 0) {
        user.coins = (user.coins || 0) + 50;
        user.streak = user.streak + 1;
        user.lastDailyCompletion = new Date();
      }
    }

    if (task.type === 'penaltyTask') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const remainingPenaltyTasks = await Task.find({
        userId,
        type: 'penaltyTask',
        status: 'pending',
        dateAssigned: { $gte: todayStart, $lt: todayEnd },
      });

      if (remainingPenaltyTasks.length === 0) {
        user.inPenaltyZone = false;
        console.log(`Usuário ${userId} saiu da penalidade por completar todas as penaltyTasks.`);
      }
    }

    await user.save();

    const allTasksPending = await Task.find({
      userId,
      status: 'pending',
    });

    const allTasksCompleted = allTasksPending.length === 0;

    if (allTasksCompleted) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      await Task.deleteMany({
        userId,
        type: 'dailyQuests',
        dateAssigned: { $gte: todayStart, $lt: todayEnd },
      });

      console.log('Todas as dailyQuests do dia atual foram excluídas.');
    }

    return res.status(200).json({
      message: 'Task completed successfully',
      user: {
        level: user.level,
        currentXP: user.currentXP,
        xpForNextLevel: user.xpForNextLevel,
        pointsToDistribute: user.pointsToDistribute,
        streak: user.streak,
        coins: user.coins,
        attributes: user.attributes,
        inPenaltyZone: user.inPenaltyZone,
      },
      task: {
        taskId: task._id,
        title: task.title,
        status: task.status,
        dateCompleted: task.dateCompleted,
      },
      allTasksCompleted,
      leveledUp,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to complete task' });
  }
});

router.put('/distribute-attributes', async (req, res) => {
  const { userId, vitality = 0, focus = 0, aura = 0 } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const pointsSpent = vitality + focus + aura;

    if (pointsSpent > user.pointsToDistribute) {
      return res.status(400).send({ error: 'Not enough points to distribute' });
    }

    user.attributes.vitality += vitality;
    user.attributes.aura += aura;
    user.attributes.focus += focus;

    user.pointsToDistribute -= pointsSpent;

    await user.save();

    return res.status(200).json({
      message: 'Attributes distributed successfully',
      user: {
        level: user.level,
        pointsToDistribute: user.pointsToDistribute,
        attributes: user.attributes,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to distribute attributes' });
  }
});

router.post('/generate-tasks', async (req, res) => {
  const { userId } = req.body;

  console.log(userId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).send({ error: 'Profile not found' });
    }

    const recentTasks = await Task.find({ userId, status: 'completed' })
      .sort({ dateCompleted: -1 })
      .limit(5);

    const recentTasksString = recentTasks
      .map(
        (task) =>
          `- ${task.title} (Atributo: ${task.attribute}, Intensidade: ${task.intensityLevel})`
      )
      .join('\n');

    const totalPoints = user.attributes.vitality + user.attributes.focus + user.attributes.aura;

    const vitalityTasks = Math.round((user.attributes.vitality / totalPoints) * 5);
    const auraTasks = Math.round((user.attributes.aura / totalPoints) * 5);
    const focusTasks = Math.round((user.attributes.focus / totalPoints) * 5);

    const prompt = `
      Gere tarefas personalizadas para o jogador em um jogo de hábitos, seguindo os dados e requisitos abaixo. Cada jogador possui cinco atributos principais: cognição, vitalidade, disciplina, perspicácia e resiliência.

Dados do Jogador:

Nome: ${user.username}
Idade: ${user.age}
Nível Físico: ${profile.exerciseFrequency === 'sedentary' ? 'Sedentário' : 'Ativo'} 
Frequência de Exercício: ${profile.exerciseFrequency}
Intensidade de Exercício: ${profile.exerciseIntensity || 'N/A'}
Peso: ${profile.weight} kg, Altura: ${profile.height} cm
Nível Atual: ${user.level}, XP para o próximo nível: ${user.xpForNextLevel}
Dificuldade dos desafios cognitivos: ${profile.cognitiveChallengePreference} (Ou seja, as tarefas de cognição desse usuário devem seguir esse padrão, se for facil, tarefas simples, medio, tarefas um pouco mais complicadas, se for dificil, ele quer treinar seu cerebro ao nivel máximo, lhe dê os desafios mais dificeis que você conseguir pensar.)
Objetivo Principal: ${profile.mainGoal} (ou seja, o foco deve ser aqui, dependendo do que o usuario desejar, ou seja, se ele deseja desenvolver força por exemplo, faça desafios de força que ajudem bastante nesse objetivo)

Quantidade de tarefas a serem criadas:

Tarefas de Focus: ${focusTasks} (Estudos, jogos mentais, xadrez, etc..) Exemplos (crie seus proprios, seja criativo e baseado em dados que permitem que o usuário evolua de verdade): [estudo com pomodoro por 20min, 5 partidas de xadrez, 2 partidas de sudoku]
Tarefas de Vitalidade: ${vitalityTasks} (Força fisica, exercicios, pesos, corridas, caminhadas etc.) EX: [20 FLEXÕES, 20 AGACHAMENTOS, 20 BARRAS AUSTRALIANAS, corrida de 5km, caminhada de 30min, etc.]
Tarefas de Aura: ${auraTasks} (Interações sociais, estilo, alimentação, atividades extracurriculares, hobbies, habilidades novas e diferentes, etc..) [Falar com algum amigo, tentar fazer uma nova amizade, comer algo saudavel, aprender sobre musica, etc.]

se Caso passar de cinco tarefas no total, dê foco nos atributos mais evoluidos, gerando sempre exatamente 5 tarefas por dia

Sempre inclua pelo menos uma tarefa dificil
Acima foram só exemplos, cria suas proprias tarefas, evite repetir as de ontem, que estão a seguir:

${recentTasksString} (evite ao máximo repetir essas tarefas)

ou seja, você deve criar um total de cinco tarefas diárias, respeitando a quantidade de cada descrita acima.
Regras para as tarefas:

Estrutura exata para cada tarefa:

  [
    {
      "title": "Título da Tarefa (ex: 50 Push ups)",
      "description": "Descrição detalhada da tarefa, no máximo 230 caracteres, deve ser extremamente detalhada, explicando como aquilo vai ajudar a jogador a melhorar, ou se for um exercicio detalhado, explicar como deve ser feito e as regras"
      "attribute": "Atributo associado (aura, vitality, focus)",
      "intensityLevel": "Nível de intensidade ('low', 'medium', 'high')",
      "xpReward": XP ganho ao completar a tarefa
    },
  ]

Use o peso, altura e atributos para ajustar a intensidade. Aumente o foco em atributos com mais pontos.
Evite repetir tarefas realizadas ontem, variando áreas e atividades (ex: treino de braço em um dia, perna no outro).
Foque em calistenia sem equipamentos; torne as tarefas práticas e acessíveis.
Gere a quantidade exata de tarefas conforme solicitado acima.
Lembre-se, devem ser diárias, ou seja, precisam ser capazes de ser concluidas em um unico dia.

Não responde com absolutamente mais nada, somente o JSON, não formate o json na resposta. Não formate o json, as descrições e titulos das tasks devem estar em ingles
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const tasks = JSON.parse(completion.choices[0].message.content);

    for (const task of tasks) {
      const xpReward = calculateTaskXpReward(user.level, task.intensityLevel, user.xpForNextLevel);
      await Task.create({
        userId,
        title: task.title,
        description: task.description,
        attribute: task.attribute,
        intensityLevel: task.intensityLevel,
        xpReward,
        type: 'dailyQuests',
        status: 'pending',
        dateAssigned: new Date(),
      });
    }

    return res.status(201).json({ message: 'Tasks generated and saved successfully', tasks });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to generate or save tasks' });
  }
});

module.exports = (app) => app.use('/user', router);
