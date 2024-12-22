// Ranking Global
const express = require('express');
const User = require('../models/users');
const authMiddleware = require('../middlewares/auth');

router = express.Router();

router.use(authMiddleware);

router.get('/global', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

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

router.get('/friends', async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

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
