const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  attribute: {
    type: String,
    enum: ['aura', 'vitality', 'focus'],
  },
  type: {
    type: String,
    enum: ['userTask', 'aiTask', 'dailyQuests', 'classQuests', 'penaltyTask'],
  },
  intensityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  xpReward: {
    type: Number,
    required: true,
    default: 50,
  },
  coinReward: {
    type: Number,
    default: 12,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'incomplete'],
    default: 'pending',
  },
  dateAssigned: {
    type: Date,
    default: Date.now,
  },
  dateCompleted: {
    type: Date,
    default: null,
  },
  recurrence: {
    type: String,
    enum: ['one-time', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'one-time',
  },
  specificDays: {
    type: [Number], // Array de números representando dias da semana (0-6)
    default: [], // Usado apenas se recurrence for 'custom'
    validate: {
      validator: function (days) {
        // Valida que os valores estão no intervalo correto
        return days.every(day => day >= 0 && day <= 6);
      },
      message: 'Os dias específicos devem estar entre 0 (domingo) e 6 (sábado).',
    },
  },
  skillBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillBook', default: null },
  completedDates: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model('Task', tasksSchema);
