const express = require('express');
const User = require('../models/users');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.get('/user/:friendId', async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).send({ error: 'O ID do amigo é obrigatório.' });
    }

    const user = await User.findOne({ friendId });

    if (!user) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    res.status(200).send({ user });
  } catch (error) {
    handleError(res, error, 'Erro ao buscar usuário pelo friendId.');
  }
});

// Middleware de autenticação
router.use(authMiddleware);

// Função utilitária para manipular erros
const handleError = (res, error, message = 'Erro no servidor.') => {
  console.error(error);
  res.status(500).send({ error: message });
};

// Buscar usuários com base em uma query
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).send({ error: 'O parâmetro de busca é obrigatório.' });
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
    }).select('username friendId level icon');

    res.status(200).send({ users });
  } catch (error) {
    handleError(res, error, 'Erro ao buscar usuários.');
  }
});

router.post('/request', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).send({ error: 'ID do amigo é obrigatório.' });
    }

    const user = await User.findById(userId);
    const friend = await User.findOne({ friendId });

    if (!user || !friend) {
      return res.status(404).send({ error: 'Usuário ou amigo não encontrado.' });
    }

    if (friend.friendId === user.friendId) {
      return res.status(400).send({ error: 'Você não pode enviar uma solicitação para si mesmo.' });
    }

    // Verificar se o amigo já está na lista de amigos
    const isAlreadyFriend = user.friends.some((f) => f.friendId === friend.friendId);
    if (isAlreadyFriend) {
      return res.status(400).send({ error: 'O usuário já está na sua lista de amigos.' });
    }

    // Verificar se a solicitação já foi enviada
    const existingRequest = friend.friendRequests.find((req) => req.from === user.friendId);
    if (existingRequest) {
      return res.status(400).send({ error: 'Solicitação já enviada.' });
    }

    // Adicionar solicitação de amizade
    friend.friendRequests.push({
      from: user.friendId,
      name: user.username,
      icon: user.icon,
      status: 'pending',
    });

    await friend.save();

    res.status(200).send({ message: 'Solicitação de amizade enviada.' });
  } catch (error) {
    handleError(res, error, 'Erro ao enviar solicitação de amizade.');
  }
});

router.post('/accept', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).send({ error: 'ID do amigo é obrigatório.' });
    }

    const user = await User.findById(userId);
    const friend = await User.findOne({ friendId });

    if (!user || !friend) {
      return res.status(404).send({ error: 'Usuário ou amigo não encontrado.' });
    }

    // Verificar se o amigo já está na lista de amigos
    const isAlreadyFriend = user.friends.some((f) => f.friendId === friend.friendId);
    if (isAlreadyFriend) {
      return res.status(400).send({ error: 'Usuário já está na lista de amigos.' });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req.from === friendId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(400).send({ error: 'Solicitação não encontrada ou já processada.' });
    }

    // Remover solicitação e adicionar à lista de amigos
    user.friendRequests.splice(requestIndex, 1);

    user.friends.push({
      friendId: friend.friendId,
    });

    friend.friends.push({
      friendId: user.friendId,
    });

    await user.save();
    await friend.save();

    res.status(200).send({ message: 'Solicitação de amizade aceita.' });
  } catch (error) {
    handleError(res, error, 'Erro ao aceitar solicitação de amizade.');
  }
});

// Rejeitar solicitação de amizade
router.post('/reject', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).send({ error: 'ID do amigo é obrigatório.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    const requestIndex = user.friendRequests.findIndex(
      (req) => req.from === friendId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(400).send({ error: 'Solicitação não encontrada ou já processada.' });
    }

    user.friendRequests.splice(requestIndex, 1);
    await user.save();

    res.status(200).send({ message: 'Solicitação de amizade rejeitada.' });
  } catch (error) {
    handleError(res, error, 'Erro ao rejeitar solicitação de amizade.');
  }
});

// Listar amigos
router.get('/list', async (req, res) => {
  try {
    const userId = req.userId;

    // Encontrar o usuário autenticado
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    // Buscar detalhes dos amigos usando friendId
    const friends = await User.find(
      { friendId: { $in: user.friends.map((friend) => friend.friendId) } },
      'username level icon friendId'
    );

    res.status(200).send({ friends });
  } catch (error) {
    handleError(res, error, 'Erro ao listar amigos.');
  }
});

// Listar solicitações de amizade
router.get('/requests', async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).populate('friendRequests.from', 'username level icon');

    if (!user) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    res.status(200).send({ friendRequests: user.friendRequests });
  } catch (error) {
    handleError(res, error, 'Erro ao listar solicitações de amizade.');
  }
});

module.exports = (app) => app.use('/friendship', router);
