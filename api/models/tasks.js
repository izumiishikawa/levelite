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
  attribute: {
    type: String,
    enum: ['aura', 'vitality', 'focus'],
  },
  type: {
    type: String,
    enum: ["userTask", "aiTask", "dailyQuests"]
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
    enum: ['one-time', 'daily', 'weekly', 'monthly'],
    default: 'one-time',
  },
  skillBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillBook', default: null },
});

module.exports = mongoose.model('Task', tasksSchema);
