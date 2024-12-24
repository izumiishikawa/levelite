const express = require('express');
const User = require('../models/users');
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

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const completedDates = new Set(user.completedDates || []);
    const penalityDates = new Set(user.penalityDates || []);

    const daysInMonth = new Date(year, month, 0).getDate();
    const progress = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];

      if (penalityDates.has(dateStr)) {
        return { day, status: 'penalty' };
      } else if (completedDates.has(dateStr)) {
        return { day, status: 'completed' };
      } else {
        return { day, status: 'no-activity' };
      }
    });

    const totalCompletedDays = completedDates.size;
    const totalPenaltyDays = penalityDates.size;

    res.status(200).json({
      progress,
      totalCompletedDays,
      totalPenaltyDays,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch progress calendar' });
  }
});

module.exports = (app) => app.use('/progress', router);
