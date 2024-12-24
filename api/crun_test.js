const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Task = require('./models/tasks');
const path = require('path');
const User = require('./models/users');

mongoose.connect('mongodb://localhost:27017/levelite', {});

const cruntest = async () => {
  var startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const users = await User.find();

  for (const user of users) {
    try {
      // se o usuario ainda estiver na zona de penalidade, quer dizer que ele não fez as tarefas de penalidade, logo, ele toma dano e sai da zona de penalidade
      if (user.inPenaltyZone) {
        user.health -= 35;
        user.inPenaltyZone = false;

        await User.findByIdAndUpdate(
          user._id,
          { $addToSet: { penalityDates: startOfToday.toISOString().split('T')[0] } },
          { new: true }
        );
      }

      await Task.deleteMany({
        userId: user._id,
        type: 'penaltyTask',
      });

      // busca todas as tarefas diárias do usuário
      const dailyQuests = await Task.find({
        userId: user._id,
        type: 'dailyQuests',
      });

      // se tiver tarefas
      if (dailyQuests.length > 0) {
        const allCompleted = dailyQuests.every((task) => task.status === 'completed'); // verifica se todas estão completas

        if (allCompleted) {
          await User.findByIdAndUpdate(
            user._id,
            { $addToSet: { completedDates: startOfToday.toISOString().split('T')[0] } },
            { new: true }
          );
        } else {
          user.inPenaltyZone = true;
          user.streak = 0;

          const penaltyTasks = [
            { title: '100 push-ups', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
            { title: '100 sit-ups', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
            { title: '100 squats', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
            { title: '5 km run', attribute: 'vitality', intensityLevel: 'high', xpReward: 10 },
          ];

          const savedTasks = [];
          for (const task of penaltyTasks) {
            const savedTask = await Task.create({
              userId: user._id,
              title: task.title,
              attribute: task.attribute,
              intensityLevel: task.intensityLevel,
              xpReward: task.xpReward,
              type: 'penaltyTask',
              status: 'pending',
              dateAssigned: new Date(),
            });
            savedTasks.push(savedTask);
          }
        }

        await Task.deleteMany({
          userId: user._id,
          type: 'dailyQuests',
        });
      } else {
        console.log('o usuario', user.username, 'não tem tarefas hoje');
      }

      user.allDone = false;
      user.generatedToday = false;

      await user.save();
    } catch (err) {
      console.log(err);
    }
  }
};

cruntest();
