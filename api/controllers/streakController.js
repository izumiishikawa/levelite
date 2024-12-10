const express = require('express');
const User = require('../models/users');
const Task = require('../models/tasks');

const router = express.Router();

router.put('/update-streak', async (req, res) => {
    const { userId } = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }
  
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Define o horário para meia-noite
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
  
      // Verifica se o usuário completou todas as tarefas diárias
      const dailyTasks = await Task.find({
        userId,
        recurrence: 'one-time',
        type: 'dailyQuests',
        status: 'pending',
        dateAssigned: { $gte: today, $lt: tomorrow },
      });
  
      if (dailyTasks.length > 0) {
        return res.status(200).json({
          streak: user.streak,
          message: 'Ainda há tarefas pendentes para o dia.',
        });
      }
  
      // Verifica se o streak deve ser incrementado ou resetado
      const lastTaskDate = user.lastTaskCompletedAt;
      if (lastTaskDate) {
        const diffInMs = today - new Date(lastTaskDate);
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
        if (diffInDays === 1) {
          user.streak += 1; // Incrementa streak
        } else if (diffInDays > 1) {
          user.streak = 1; // Reseta streak
        }
      } else {
        user.streak = 1; // Primeiro dia do streak
      }
  
      user.lastTaskCompletedAt = today;
  
      await user.save();
  
      return res.status(200).json({
        streak: user.streak,
        message: 'Streak atualizado com sucesso!',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: 'Failed to update streak' });
    }
  });
  
  module.exports = (app) => app.use('/streak', router);
