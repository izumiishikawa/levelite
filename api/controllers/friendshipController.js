const express = require('express');
const User = require('../models/users');
const FriendRequest = require('../models/friendRequests');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// Middleware de autenticação
router.use(authMiddleware);

// Função utilitária para manipular erros
const handleError = (res, error, message = 'Erro no servidor.') => {
  console.error(error);
  res.status(500).send({ error: message });
};

// Buscar usuário pelo friendId
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

// Rota de busca
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.userId;

    if (!query) {
      return res.status(400).send({ error: 'O parâmetro de busca é obrigatório.' });
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    const excludedIds = [currentUser.friendId, ...currentUser.friends.map(friend => friend.friendId)];
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      friendId: { $nin: excludedIds },
    }).select('username friendId level icon');

    const usersWithRequestInfo = await Promise.all(
      users.map(async user => {
        const hasPendingRequest = await FriendRequest.exists({
          from: currentUser.friendId,
          to: user.friendId,
          status: 'pending',
        });

        return { ...user.toObject(), hasPendingRequest: !!hasPendingRequest };
      })
    );

    res.status(200).send({ users: usersWithRequestInfo });
  } catch (error) {
    handleError(res, error, 'Erro ao buscar usuários.');
  }
});

// Enviar solicitação de amizade
router.post('/request', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).send({ error: 'ID do amigo é obrigatório.' });
    }

    const currentUser = await User.findById(userId);
    const targetUser = await User.findOne({ friendId });

    if (!currentUser || !targetUser) {
      return res.status(404).send({ error: 'Usuário ou amigo não encontrado.' });
    }

    if (currentUser.friendId === targetUser.friendId) {
      return res.status(400).send({ error: 'Você não pode enviar uma solicitação para si mesmo.' });
    }

    const existingRequest = await FriendRequest.findOne({
      from: currentUser.friendId,
      to: targetUser.friendId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).send({ error: 'Solicitação já enviada.' });
    }

    await FriendRequest.create({
      from: currentUser.friendId,
      to: targetUser.friendId,
      status: 'pending',
    });

    res.status(200).send({ message: 'Solicitação de amizade enviada.' });
  } catch (error) {
    handleError(res, error, 'Erro ao enviar solicitação de amizade.');
  }
});

// Cancelar solicitação de amizade
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).send({ error: 'ID do amigo é obrigatório.' });
    }

    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    const request = await FriendRequest.findOneAndDelete({
      from: currentUser.friendId,
      to: friendId,
      status: 'pending',
    });

    if (!request) {
      return res.status(400).send({ error: 'Solicitação não encontrada ou já processada.' });
    }

    res.status(200).send({ message: 'Solicitação de amizade cancelada com sucesso.' });
  } catch (error) {
    handleError(res, error, 'Erro ao cancelar solicitação de amizade.');
  }
});

// Aceitar solicitação de amizade
router.post('/accept', async (req, res) => {
  try {
    const userId = req.userId;
    const { friendId } = req.body;

    console.log(friendId)

    if (!friendId) {
      return res.status(400).send({ error: 'ID do amigo é obrigatório.' });
    }

    const currentUser = await User.findById(userId);
    const targetUser = await User.findOne({ friendId });

    if (!currentUser || !targetUser) {
      return res.status(404).send({ error: 'Usuário ou amigo não encontrado.' });
    }

    const request = await FriendRequest.findOneAndUpdate(
      { from: friendId, to: currentUser.friendId, status: 'pending' },
      { status: 'accepted' }
    );

    if (!request) {
      return res.status(400).send({ error: 'Solicitação não encontrada ou já processada.' });
    }

    currentUser.friends.push({ friendId });
    targetUser.friends.push({ friendId: currentUser.friendId });

    await currentUser.save();
    await targetUser.save();

    res.status(200).send({ message: 'Solicitação de amizade aceita.' });
  } catch (error) {
    handleError(res, error, 'Erro ao aceitar solicitação de amizade.');
  }
});

// Listar amigos
router.get('/list', async (req, res) => {
  try {
    const userId = req.userId;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    const friends = await User.find(
      { friendId: { $in: currentUser.friends.map(friend => friend.friendId) } },
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
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).send({ error: 'Usuário não encontrado.' });
    }

    // Busca todas as solicitações pendentes direcionadas ao usuário atual
    const friendRequests = await FriendRequest.find({ to: currentUser.friendId, status: 'pending' });

    // Para cada solicitação, busca os dados do remetente no banco de dados
    const formattedRequests = await Promise.all(
      friendRequests.map(async request => {
        const user = await User.findOne({ friendId: request.from }).select('username level icon');
        if (user) {
          return {
            id: request.from,
            username: user.username,
            level: user.level,
            icon: user.icon,
          };
        }
        return null;
      })
    );

    // Remove quaisquer entradas nulas resultantes de usuários inexistentes
    const validRequests = formattedRequests.filter(request => request !== null);

    res.status(200).send({ friendRequests: validRequests });
  } catch (error) {
    handleError(res, error, 'Erro ao listar solicitações de amizade.');
  }
});



module.exports = (app) => app.use('/friendship', router);
