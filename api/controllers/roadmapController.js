const express = require('express');
const User = require('../models/users');
const Inventory = require('../models/inventory');
const ItemData = require('../models/itemData');
const Roadmap = require('../models/roadmap');
const authMiddleware = require('../middlewares/auth');
const checkNodeRequirements = require('../utils/nodeRequirements');

const router = express.Router();

router.use(authMiddleware);

// Rota para listar todos os roadmaps
router.get('/', async (req, res) => {
  try {
    const roadmaps = await Roadmap.find();
    res.status(200).json(roadmaps);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar roadmaps.' });
  }
});

// Rota para buscar um roadmap específico
router.get('/:roadmapId', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const roadmap = await Roadmap.findById(roadmapId);

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap não encontrado.' });
    }

    res.status(200).json(roadmap);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar roadmap.' });
  }
});
router.post('/enter/:roadmapId', async (req, res) => {
  try {
    const { roadmapId } = req.params;
    const userId = req.userId; // ID do usuário autenticado

    // Validações iniciais
    if (!roadmapId || !userId) {
      return res.status(400).json({ error: 'Parâmetros inválidos.' });
    }

    // Busca o roadmap pelo ID
    const roadmap = await Roadmap.findById(roadmapId);

    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap não encontrado.' });
    }

    // Busca o usuário pelo ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Atualiza o progresso do usuário no roadmap
    if (!user.roadmapProgress) {
      user.roadmapProgress = [];
    }

    // Verifica se já existe progresso no roadmap específico
    let progress = user.roadmapProgress.find(
      (progress) => progress.roadmapId.toString() === roadmap._id.toString()
    );

    if (!progress) {
      progress = {
        roadmapId: roadmap._id,
        completedNodes: [],
        completedTreasures: [],
        completedDungeons: [],
      };
      user.roadmapProgress.push(progress);
    }

    // Adiciona o primeiro elemento do roadmap se ainda não estiver em completedNodes
    const firstElement = roadmap.elements[0].element.id;
    if (!progress.completedNodes.includes(firstElement)) {
      progress.completedNodes.push(firstElement);
    }

    // Atualiza o roadmap atual do usuário
    user.currentRoadmap = roadmap._id;

    // Salva as alterações no usuário
    await user.save();

    // Retorna o roadmap atualizado
    res.status(200).json(roadmap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
});

router.post('/:roadmapId/elements/:elementId/enter', async (req, res) => {
  try {
    const { roadmapId, elementId } = req.params;
    const userId = req.userId; // ID do usuário autenticado

    // Buscar roadmap e elemento
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap não encontrado.' });
    }

    const elementIndex = roadmap.elements.findIndex((e) => e.element.id === elementId);
    if (elementIndex === -1) {
      return res.status(404).json({ error: 'Elemento não encontrado no roadmap.' });
    }

    const element = roadmap.elements[elementIndex];

    // Buscar progresso do usuário no roadmap
    const user = await User.findById(userId);
    const roadmapProgress = user.roadmapProgress.find(
      (rp) => rp.roadmapId.toString() === roadmapId
    ) || {
      completedNodes: [],
      completedTreasures: [],
      completedDungeons: [],
    };

    // Verificar se os elementos anteriores foram completados
    const previousElements = roadmap.elements.slice(0, elementIndex);
    const allPreviousCompleted = previousElements.every((prevElement) => {
      const { type, element: prev } = prevElement;
      if (type === 'node') return roadmapProgress.completedNodes.includes(prev.id);
      if (type === 'treasure') return roadmapProgress.completedTreasures.includes(prev.id);
      if (type === 'dungeon') return roadmapProgress.completedDungeons.includes(prev.id);
      return false;
    });

    if (!allPreviousCompleted) {
      return res
        .status(400)
        .json({ error: 'Complete os elementos anteriores antes de acessar este.' });
    }

    // Verificar requisitos do elemento atual
    const checkResult = await checkNodeRequirements(user, element.element.requirements || []);
    if (!checkResult.success) {
      return res.status(400).json({ error: checkResult.message });
    }

    // Atualizar progresso com base no tipo de elemento
    if (element.type === 'node') {
      if (!roadmapProgress.completedNodes.includes(elementId)) {
        roadmapProgress.completedNodes.push(elementId);
        await user.save();
      }
      return res.status(200).json(user.roadmapProgress);
    }

    if (element.type === 'treasure') {
      if (!roadmapProgress.completedTreasures.includes(elementId)) {
        roadmapProgress.completedTreasures.push(elementId);

        const inventory = await Inventory.findOne({ userId });
        if (!inventory) {
          return res.status(404).json({ error: 'Inventário não encontrado.' });
        }

        const rewards = element.element.rewards;

        // Adicionar os itens ao inventário
        for (const itemId of rewards.items) {
          const itemData = await ItemData.findById(itemId);
          if (!itemData) continue;

          const existingItem = inventory.items.find((item) => item.itemId.equals(itemId));
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            inventory.items.push({ itemId: itemData._id, quantity: 1 });
          }
        }

        if (!roadmapProgress.completedTreasures.includes(elementId)) {
          roadmapProgress.completedTreasures.push(elementId);
          await user.save();
        }

        // Salvar as mudanças
        user.currentXP += rewards.xp;
        await inventory.save();
        await user.save();

        // Obter os detalhes dos itens para exibir no frontend
        const itemsDetails = await ItemData.find({ _id: { $in: rewards.items } }).select(
          'name icon'
        );

        return res.status(200).json({
          message: 'Baú aberto com sucesso!',
          rewards: {
            xp: rewards.xp,
            items: itemsDetails,
          },
          progress: user.roadmapProgress,
        });
      }
      return res.status(400).json({ error: 'Baú já foi aberto.' });
    }

    if (element.type === 'dungeon') {
      console.log("morre")

      user.currentDungeon = {
        dungeonId: element.element.id,
        currentEnemy: null,
        defeatedEnemies: [],
        bossDefeated: false,
      };
      await user.save();

      return res.status(200).json({
        message: `Você entrou na dungeon: ${element.element.name}`,
        currentDungeon: user.currentDungeon,
      });
    }

    res.status(400).json({ error: 'Tipo de elemento desconhecido.' });
  } catch (err) {
    console.error('Erro ao acessar elemento:', err);
    res.status(500).json({ error: 'Erro ao acessar elemento.' });
  }
});

router.get('/:roadmapId/dungeons/:dungeonId', async (req, res) => {
  try {
    const { roadmapId, dungeonId } = req.params;

    // Buscar roadmap pelo ID
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap não encontrado.' });
    }

    // Encontrar a dungeon específica no roadmap
    const dungeon = roadmap.elements.find(
      (element) => element.type === 'dungeon' && element.element.id === dungeonId
    );

    if (!dungeon) {
      return res.status(404).json({ error: 'Dungeon não encontrada no roadmap.' });
    }

    // Retornar a dungeon encontrada
    res.status(200).json(dungeon);
  } catch (err) {
    console.error('Erro ao buscar dungeon:', err);
    res.status(500).json({ error: 'Erro ao buscar dungeon.' });
  }
});


router.post('/start-battle/:enemyId', async (req, res) => {
  try {
    const { enemyId } = req.params;
    const userId = req.userId;

    // Buscar o usuário
    const user = await User.findById(userId);
    if (!user || !user.currentDungeon) {
      return res.status(404).json({ error: 'Usuário ou dungeon atual não encontrado.' });
    }

    // Buscar dungeon atual
    const roadmap = await Roadmap.findById(user.currentRoadmap);
    if (!roadmap) {
      return res.status(404).json({ error: 'Roadmap não encontrado.' });
    }

    const dungeon = roadmap.elements.find(
      (element) => element.type === 'dungeon' && element.element.id === user.currentDungeon.dungeonId
    );

    if (!dungeon) {
      return res.status(404).json({ error: 'Dungeon atual não encontrada.' });
    }

    // Encontrar o inimigo na dungeon
    const enemy = dungeon.element.enemies.find((e) => e.id === enemyId);
    if (!enemy) {
      return res.status(404).json({ error: 'Inimigo não encontrado na dungeon.' });
    }

    // Atualizar o inimigo atual na dungeon do usuário
    user.currentDungeon.currentEnemy = { id: enemy.id, health: enemy.health };
    await user.save();

    res.status(200).json({
      message: 'Batalha iniciada com sucesso.',
      currentEnemy: user.currentDungeon.currentEnemy,
    });
  } catch (err) {
    console.error('Erro ao iniciar batalha:', err);
    res.status(500).json({ error: 'Erro ao iniciar batalha.' });
  }
});


// Rota para criar um roadmap (apenas administradores, como exemplo)
router.post('/', async (req, res) => {
  try {
    const { name, description, elements } = req.body;
    const roadmap = new Roadmap({ name, description, elements });
    await roadmap.save();
    res.status(201).json(roadmap);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar roadmap.' });
  }
});

module.exports = (app) => app.use('/roadmaps', router);
