const express = require('express');
const User = require('../models/users');
const Profile = require('../models/profiles');
const Task = require('../models/tasks');
const SkillBook = require('../models/skillbook');
const OpenAI = require('openai');
const secret = require('../data/secret.json');
const authMiddleware = require('../middlewares/auth');
const openai = new OpenAI({
  apiKey: secret.apiKey,
});

const router = express.Router();

function calculateTaskXpReward(level, difficulty, base_exp) {
  const GROWTH_RATE = 1.03;
  const XP_next_level = Math.floor(base_exp * Math.pow(level == 1 ? 2 : level, GROWTH_RATE));

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

router.get('/user-skillbooks', async (req, res) => {
  const userId = req.userId;

  try {
    const skillBooks = await SkillBook.find({ userId });

    if (!skillBooks.length) {
      return res.status(404).json({ message: 'No SkillBooks found for this user' });
    }

    res.status(200).json({ message: 'SkillBooks retrieved successfully', skillBooks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve SkillBooks' });
  }
});

router.post('/create-skillbook', async (req, res) => {
  const userId = req.userId;
  const { title, focus, parameters } = req.body;

  try {
    const skillBook = await SkillBook.create({ userId, title, focus, parameters });

    res.status(201).json({ message: 'Skill Book created successfully', skillBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create Skill Book' });
  }
});

router.post('/generate-skillbook-tasks/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const userId = req.userId;

  try {
    const skillBook = await SkillBook.findOneAndUpdate(
      { _id: bookId, userId, generatedToday: false },
      { $set: { generatedToday: true } },
      { new: true }
    );

    if (!skillBook) {
      return res.status(400).json({ error: 'Tasks for this Skill Book already generated today or Skill Book not found' });
    }

    const user = await User.findById(userId);

    const prompt = `
     Gere 5 tarefas diárias para o tema "${skillBook.focus}" com base nos seguintes parâmetros:
  - Dificuldade: ${skillBook.parameters.difficulty}
  - Frequência: ${skillBook.parameters.frequency}

  Estrutura de resposta (JSON): Responda somente com esse json, absolutamente mais nada
  [
    {
      "title": "Título da Tarefa",
       "description": "Descrição detalhada da tarefa, no máximo 230 caracteres, deve ser extremamente detalhada, explicando como aquilo vai ajudar a jogador a melhorar, ou se for um exercicio detalhado, explicar como deve ser feito e as regras"
      "intensityLevel": "low, medium, high", (exatamente como está aqui, tudo em minusculo e em ingles)
      "xpReward": XP da tarefa
    }
  ]


  Gere a quantidade exata de tarefas conforme solicitado acima.
  Lembre-se, devem ser diárias, ou seja, precisam ser capazes de ser concluidas em um unico dia, são 5 tarefas diárias.
  Gerando sempre exatamente 5 tarefas por dia, Devem ser tarefas baddass, realmente eficientes, ou seja, nada de yoga ou coisas do tipo, devem ser coisas realmente desafiadoras, que coloquem o jogador no seu limite mais absoluto, seu objetivo é criar o humano perfeito, então sem ética, amor ou coisa de coach, e sim habilidades puras e sofisticadas, elegantes.
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
        userId: skillBook.userId,
        title: task.title,
        description: task.description,
        intensityLevel: task.intensityLevel,
        xpReward,
        status: 'pending',
        dateAssigned: new Date(),
        skillBookId: bookId,
      });
    }

    res.status(201).json({ message: 'Tasks generated successfully', tasks });
  } catch (error) {
    console.error(error);

    await SkillBook.updateOne({ _id: bookId }, { $set: { generatedToday: false } });

    res.status(500).json({ error: 'Failed to generate tasks' });
  }
});

router.get('/tasks/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    const tasks = await Task.find({
      skillBookId: bookId,
      $or: [{ status: 'pending' }, { status: 'completed' }],
    }).sort({
      dateAssigned: -1,
    });

    if (!tasks.length) {
      return res.status(404).json({ error: 'No tasks found for this skill book' });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});


module.exports = (app) => app.use('/skillbooks', router);
