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

// Rota para buscar o perfil completo do usuário
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    const profile = await Profile.findOne({ userId: req.query.userId }); // Supondo que o Profile tenha um campo `userId`

    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    if (!profile) {
      return res.status(404).send({ error: 'Profile not found' });
    }

    // Converte os objetos Mongoose para objetos planos
    const userObject = user.toObject();
    const profileObject = profile.toObject();

    // Remove campos indesejados do profile
    delete profileObject._id;
    delete profileObject.userId;

    // Mescla os dois objetos
    const mergedData = {
      ...userObject,
      ...profileObject,
    };

    return res.status(200).json(mergedData);
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to retrieve profile' });
  }
});

// Rota para distribuir pontos em atributos do usuário
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

    // Atualiza os atributos e subtrai os pontos utilizados
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

// Rota para atualizar o progresso de XP e verificar o nível
router.put('/progress', async (req, res) => {
  const { xpGained } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Adiciona o XP ganho ao XP atual
    user.currentXP += xpGained;

    // Verifica se o usuário atingiu o XP necessário para o próximo nível
    while (user.currentXP >= user.xpForNextLevel) {
      user.currentXP -= user.xpForNextLevel; // Remove o XP necessário do atual
      user.level += 1; // Incrementa o nível
      user.pointsToDistribute += 3; // Dá pontos para distribuir
      user.xpForNextLevel += 50; // Incrementa o XP necessário para o próximo nível
    }

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to update progress' });
  }
});

// Rota para consultar as conquistas do usuário
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.userId });

    if (!achievements) {
      return res.status(404).send({ error: 'No achievements found' });
    }

    return res.status(200).json(achievements);
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to retrieve achievements' });
  }
});

// Rota para consultar tarefas pendentes do usuário
router.get('/tasks', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const tasks = await Task.find({
      userId: req.query.userId,
      $or: [
        { status: 'pending', skillBookId: null },
        { status: 'completed', dateCompleted: { $gte: startOfDay, $lt: endOfDay } } // completed hoje
      ]
    });

    if (!tasks || tasks.length === 0) {
      return res.status(404).send({ error: 'No tasks found' });
    }

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to retrieve tasks' });
  }
});

router.patch('/tasks/restore', async (req, res) => {
  try {
    const taskId = req.query.taskId;

    // Encontra a tarefa pelo ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    // Verifica se a tarefa já está com o status "pending"
    if (task.status === 'pending') {
      return res.status(400).send({ error: 'Task is already in pending status' });
    }

    // Atualiza o status da tarefa para "pending"
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status: 'pending' },
      { new: true } // Retorna o documento atualizado
    );

    // Reduz o XP do usuário
    const userId = task.userId; // Certifique-se de que `userId` está na estrutura da tarefa
    const xpPenalty = task.xpReward || 0;

    const user = await User.findById(userId);
    if (user) {
      user.currentXP -= xpPenalty;

      // Se o XP for menor que 0, reduz o nível do jogador
      while (user.xp < 0 && user.level > 1) {
        user.level -= 1; // Reduz o nível
        const xpRequiredForLevel = calculateXpForNextLevel(user.level); // Calcula o XP necessário para o novo nível
        user.currentXP += xpRequiredForLevel; // Ajusta o XP para o novo nível
      }

      // Garante que o XP não seja negativo no nível 1
      if (user.level === 1 && user.xp < 0) {
        user.xp = 0;
      }

      await user.save();
    }

    return res.status(200).json({
      message: 'Task restored successfully',
      task: updatedTask,
      user: user, // Retorna informações atualizadas do usuário
    });
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to restore task' });
  }
});


router.get('/penalty-tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.query.userId, status: 'penalty', skillBookId: null });

    if (!tasks) {
      return res.status(404).send({ error: 'No penalty tasks found' });
    }

    return res.status(200).json(tasks);
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to retrieve penalty tasks' });
  }
});

router.post('/create-user-task', async (req, res) => {
  const { userId, title, description, attribute, intensityLevel, recurrence, xpReward } = req.body;

  try {
    // Verifica se o usuário existe antes de criar a tarefa
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Cria a nova tarefa com os dados recebidos
    const xpReward = calculateTaskXpReward(user.level, intensityLevel, user.xpForNextLevel);
    const task = await Task.create({
      userId,
      title,
      description,
      attribute, // Ex: 'cognition', 'vitality', etc.
      intensityLevel, // Ex: 'low', 'medium', 'high'
      xpReward, // Ex: quantidade de XP que a tarefa irá conceder
      recurrence,
      type: "userTask",
      status: 'pending',
      dateAssigned: new Date(),
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to create task' });
  }
});

router.delete('/delete-task', async (req, res) => {
  const { taskId } = req.query; // O ID da tarefa a ser deletada

  try {
    // Verifica se a tarefa existe
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: 'Task not found' });
    }

    // Remove a tarefa do banco de dados
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Adiciona o XP da tarefa ao XP atual do usuário
    user.currentXP += task.xpReward;

    // Lógica de progressão de nível
    while (user.currentXP >= user.xpForNextLevel) {
      user.currentXP -= user.xpForNextLevel;
      user.level += 1;
      user.pointsToDistribute += 3;
      user.xpForNextLevel = calculateXpForNextLevel(user.level, user.xpForNextLevel);
    }

    await task.save();

    // Verifica se todas as tarefas do dia foram concluídas
    const remainingTasks = await Task.find({ 
      userId, 
      type: 'dailyQuests', 
      status: 'pending' 
    });

    console.log(remainingTasks)

    if (remainingTasks.length === 0) {
      // Todas as tarefas do dia foram concluídas
      user.coins = (user.coins || 0) + 50; // Adiciona moedas ao usuário (ajuste conforme necessário)

      // Atualiza o campo de última conclusão diária (opcional para reiniciar streaks se necessário)
      user.lastDailyCompletion = new Date();
    }

    await user.save();

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
      },
      task: {
        taskId: task._id,
        title: task.title,
        status: task.status,
        dateCompleted: task.dateCompleted,
      },
      allTasksCompleted: remainingTasks.length === 0, // Informação útil para o frontend
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: 'Failed to complete task' });
  }
});


router.put('/distribute-attributes', async (req, res) => {
  const {
    userId,
    vitality = 0,
    focus = 0,
    aura = 0,
  } = req.body;

  try {
    // Encontra o usuário pelo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Calcula o total de pontos que o usuário deseja distribuir
    const pointsSpent = vitality + focus + aura;

    // Verifica se o usuário possui pontos suficientes para distribuir
    if (pointsSpent > user.pointsToDistribute) {
      return res.status(400).send({ error: 'Not enough points to distribute' });
    }

    // Atualiza os atributos do usuário com os pontos alocados
    user.attributes.vitality += vitality;
    user.attributes.aura += aura;
    user.attributes.focus += focus;

    // Subtrai os pontos gastos do total de pontos disponíveis para distribuição
    user.pointsToDistribute -= pointsSpent;

    // Salva as alterações no usuário
    await user.save();

    // Retorna o perfil atualizado do usuário
    return res.status(200).json({
      message: 'Attributes distributed successfully',
      user: {
        level: user.level,
        pointsToDistribute: user.pointsToDistribute,
        attributes: user.attributes,
      },
    });
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to distribute attributes' });
  }
});

router.post('/generate-tasks', async (req, res) => {
  const { userId } = req.body;

  try {
    // Encontra o usuário pelo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    // Encontra o perfil do usuário pelo ID
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).send({ error: 'Profile not found' });
    }

    // Busca as últimas 5 tarefas concluídas, ordenadas pela data de conclusão
    const recentTasks = await Task.find({ userId, status: 'completed' })
      .sort({ dateCompleted: -1 }) // Ordena pela data de conclusão mais recente
      .limit(5); // Limita a 5 tarefas

    // Converte as tarefas para uma string no formato desejado para incluir no prompt
    const recentTasksString = recentTasks
      .map(
        (task) =>
          `- ${task.title} (Atributo: ${task.attribute}, Intensidade: ${task.intensityLevel})`
      )
      .join('\n');

    const totalPoints =
      user.attributes.vitality +
      user.attributes.focus +
      user.attributes.aura 

    const vitalityTasks = Math.round((user.attributes.vitality / totalPoints) * 5);
    const auraTasks = Math.round((user.attributes.aura / totalPoints) * 5);
    const focusTasks = Math.round((user.attributes.focus / totalPoints) * 5);

    // Define o prompt com base nos dados do jogador e nas tarefas concluídas recentemente
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
      "title": "Título da Tarefa (ex: 50 FLEXÕES)",
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

Não responde com absolutamente mais nada, somente o JSON, não formate o json na resposta. Não formate o json
    `;

    console.log(prompt);

    // Chama a API da OpenAI para gerar as tarefas
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    console.log(completion.choices[0].message.content)

    // Processa a resposta e analisa o JSON das tarefas
    const tasks = JSON.parse(completion.choices[0].message.content);

    // Salva cada tarefa no banco de dados
    for (const task of tasks) {
      const xpReward = calculateTaskXpReward(user.level, task.intensityLevel, user.xpForNextLevel);
      await Task.create({
        userId,
        title: task.title,
        attribute: task.attribute,
        intensityLevel: task.intensityLevel,
        xpReward,
        type: "dailyQuests",
        status: 'pending',
        dateAssigned: new Date(),
      });
    }


    return res.status(201).json({ message: 'Tasks generated and saved successfully', tasks });
  } catch (error) {
    console.error(error); // Log do erro para depuração
    return res.status(500).send({ error: 'Failed to generate or save tasks' });
  }
});

router.post('/generate-penalty-tasks', async (req, res) => {
  const { userId } = req.body;

  try {
    // Define a data de início e fim para o dia atual
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0); // Início do dia atual

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999); // Final do dia atual

    // Busca tarefas incompletas do dia atual
    const incompleteTasks = await Task.find({
      userId,
      status: 'incomplete',
      dateAssigned: { $gte: todayStart, $lt: todayEnd },
    });

    if (!incompleteTasks.length) {
      // Retorna se não houver tarefas incompletas
      return res.status(200).json({
        message: 'Nenhuma tarefa incompleta encontrada para penalidade.',
      });
    }

    // Seleciona até 3 tarefas aleatórias
    const selectedTasks = incompleteTasks
      .sort(() => Math.random() - 0.5) // Embaralha a lista
      .slice(0, 3); // Seleciona as primeiras 3

    // Monta o prompt para o ChatGPT
    const prompt = `
      Crie 3 tarefas de penalidade baseadas nas tarefas abaixo, dobrando a intensidade de cada uma. Use o seguinte formato para as novas tarefas:

      [
        {
          "title": "Título da nova tarefa (ex: DOBRE: 40 FLEXÕES)",
          "attribute": "Atributo associado (aura, vitality, focus)",
          "intensityLevel": "Nível de intensidade ('low', 'medium', 'high')",
          "xpReward": XP ajustado para a nova intensidade
        }
      ]

      Tarefas para basear as penalidades:
      ${selectedTasks
        .map(
          (task) =>
            `- ${task.title} (Atributo: ${task.attribute}, Intensidade: ${task.intensityLevel}, XP: ${task.xpReward})`
        )
        .join('\n')}
    `;

    // Chama a API da OpenAI para gerar as tarefas de penalidade
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    // Processa a resposta do ChatGPT
    const penaltyTasks = JSON.parse(completion.choices[0].message.content);

    // Salva as tarefas geradas no banco de dados
    const savedTasks = [];
    for (const task of penaltyTasks) {
      const savedTask = await Task.create({
        userId,
        title: task.title,
        attribute: task.attribute,
        intensityLevel: task.intensityLevel,
        xpReward: task.xpReward,
        status: 'penalty',
        dateAssigned: new Date(), // Data de penalidade é o momento atual
      });
      savedTasks.push(savedTask);
    }

    return res.status(201).json({
      message: 'Tarefas de penalidade geradas com sucesso.',
      penaltyTasks: savedTasks,
    });
  } catch (error) {
    console.error('Erro ao gerar tarefas de penalidade:', error);
    return res.status(500).json({ error: 'Falha ao gerar tarefas de penalidade.' });
  }
});



module.exports = (app) => app.use('/user', router);
