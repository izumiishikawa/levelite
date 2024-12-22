const express = require('express');
const Task = require('../models/tasks');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/progress-calendar', async (req, res) => {
  const userId = req.userId;
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month are required.' });
  }

  try {
    const startDate = new Date(year, month - 1, 1); 
    const endDate = new Date(year, month, 0); 

    const tasks = await Task.find({
      userId,
      dateAssigned: { $gte: startDate, $lte: endDate },
    });

    const calendar = {};
    let totalCompletedTasks = 0; 
    let totalXpGained = 0; 

    const tasksByDay = tasks.reduce((acc, task) => {
      const day = task.dateAssigned.getDate();
      if (!acc[day]) acc[day] = [];
      acc[day].push(task);
      return acc;
    }, {});

    const daysInMonth = new Date(year, month, 0).getDate();
    const progress = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayTasks = tasksByDay[day] || [];
      const dailyQuests = dayTasks.filter((task) => task.type === 'dailyQuests');
      const allDailyCompleted = dailyQuests.every((task) => task.status === 'completed');
      const penaltyTasks = dayTasks.filter((task) => task.type === 'penaltyTask');

      if (!calendar[day]) {
        calendar[day] = {
          completed: 0,
          incomplete: 0,
          penaltyCompleted: 0,
          penaltyTotal: 0,
        };
      }

      penaltyTasks.forEach((task) => {
        calendar[day].penaltyTotal += 1;
        if (task.status === 'completed') {
          calendar[day].penaltyCompleted += 1;
        }
      });

      dayTasks.forEach((task) => {
        if (task.status === 'completed') {
          calendar[day].completed += 1;
          totalCompletedTasks += 1;
          totalXpGained += task.xpReward || 0;
        } else if (task.status === 'incomplete') {
          calendar[day].incomplete += 1;
        }
      });

      if (calendar[day].penaltyTotal > 0) {
        if (calendar[day].penaltyCompleted === calendar[day].penaltyTotal) {
          return { day, status: 'escaped' };
        } else {
          return { day, status: 'penalty' };
        }
      } else if (dailyQuests.length > 0 && allDailyCompleted) {
        return { day, status: 'completed' };
      } else if (dailyQuests.length > 0 && !allDailyCompleted) {
        return { day, status: 'incomplete' };
      } else {
        return { day, status: 'no-activity' };
      }
    });

    res.status(200).json({
      progress,
      totalCompletedTasks,
      totalXpGained,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress calendar' });
  }
});


module.exports = (app) => app.use('/progress', router);
