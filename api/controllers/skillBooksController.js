const express = require('express');
const User = require('../models/users');
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

router.get('/:skillBookId', async (req, res) => {
  const userId = req.userId;
  const {skillBookId} = req.params

  try {
    const skillBook = await SkillBook.findOne({ userId, _id: skillBookId });

    res.status(200).json(skillBook);
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

router.put('/update-skillbook/:skillBookId', async (req, res) => {
  const { skillBookId } = req.params;
  const { title, focus, parameters } = req.body;

  try {
    const updatedSkillBook = await SkillBook.findOneAndUpdate(
      {_id: skillBookId},
      { title, focus, parameters },
      { new: true, runValidators: true }
    );

    if (!updatedSkillBook) {
      return res.status(404).json({ message: 'Skill Book not found' });
    }

    res.status(200).json({ message: 'Skill Book updated successfully', updatedSkillBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update Skill Book' });
  }
});

router.delete('/remove/:skillBookId', async (req, res) => {
  const userId = req.userId;
  const { skillBookId } = req.params;

  if (!userId || !skillBookId) {
    return res.status(400).json({
      success: false,
      message: 'Parâmetros insuficientes. Certifique-se de enviar userId e skillBookId.',
    });
  }

  try {
    const result = await SkillBook.deleteOne({ userId, _id: skillBookId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'SkillBook não encontrado ou já removido.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'SkillBook removido com sucesso.',
    });
  } catch (error) {
    console.error('Erro ao remover SkillBook:', error);

    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro ao tentar remover o SkillBook.',
    });
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
  - Dificuldade: ${skillBook.parameters.difficulty}, isso representa o nivel de compromentimento que o usuario tem com o objetivo, se for facil, ele não tem pressa pra aprender então os desafios podem ser menores.
  - Habilidade atual do usuário nessa skill: ${skillBook.parameters.level}, as tarefas devem condizir com a habilidade atual do player, se ele for expert, devem ser tarefas avançadas, se for intermediario, e assim por diante.
  - Frequência: ${skillBook.parameters.frequency}, se for diaria, devem ser tarefas rapidas e simples, capazes de serem concluidas em um unico dia, se for semanal, devem ser tarefas mais complicadas e demoradas.

  As tarefas devem ser detalhadas e especificas, nada genérico, devem ser realmente passos afim de concluir aquele objetivo. que é ${skillBook.focus}, cada tarefa deve ser um passo importante em direção aquele objetivo.

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
