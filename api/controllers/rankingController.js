// Ranking Global
const express = require('express');
const User = require('../models/users');
const Profile = require('../models/profiles');
const Task = require('../models/tasks');
const OpenAI = require('openai');
const secret = require('../data/secret.json');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const multerConfig = require('../config/multer');

router = express.Router();

router.use(authMiddleware);

router.get('/global', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Busca todos os usuários e ordena
    const users = await User.find({})
      .sort({ totalExp: -1, currentRank: -1 })
      .select('username friendId totalExp currentRank level icon')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const rankedUsers = users.map((user, index) => ({
      position: (page - 1) * limit + index + 1,
      username: user.username,
      friendId: user.friendId,
      totalExp: user.totalExp,
      currentRank: user.currentRank,
      level: user.level,
      icon: user.icon,
    }));

    res.status(200).send({ ranking: rankedUsers });
  } catch (error) {
    handleError(res, error, 'Erro ao gerar ranking global.');
  }
});

// Ranking Entre Amigos
router.get('/friends', async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    // Busca o usuário autenticado
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    // Filtra apenas os amigos do usuário
    const friendIds = currentUser.friends.map((friend) => friend.friendId);

    const friends = await User.find({ friendId: { $in: friendIds } })
      .sort({ totalExp: -1, currentRank: -1 })
      .select('username friendId totalExp currentRank level icon')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const rankedFriends = friends.map((user, index) => ({
      position: (page - 1) * limit + index + 1,
      username: user.username,
      friendId: user.friendId,
      totalExp: user.totalExp,
      currentRank: user.currentRank,
      level: user.level,
      icon: user.icon,
    }));

    res.status(200).send({ ranking: rankedFriends });
  } catch (error) {
    handleError(res, error, 'Erro ao gerar ranking entre amigos.');
  }
});

module.exports = (app) => app.use('/ranking', router);
