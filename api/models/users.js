const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  inPenaltyZone: {
    type: Boolean,
    required: true,
    default: false
  },

  // Nível e XP
  level: {
    type: Number,
    default: 1,
  },
  currentXP: {
    type: Number,
    default: 0,
  },
  xpForNextLevel: {
    type: Number,
    default: 234,
    required: true,
  },
  pointsToDistribute: {
    type: Number,
    default: 0,
  },

  generatedToday: {
    type: Boolean,
    default: false,
  },

  classGeneratedToday: {
    type: Boolean,
    default: false,
  },

  selectedClass: {
    type: String,
    enum: ['shadow', 'guardian', 'visionary', 'titan', 'mindbreaker'],
    default: null,
  },

  onboarded: {
    type: Boolean,
    default: false,
  },

  // Atributos
  attributes: {
    aura: { type: Number, default: 1 },
    vitality: { type: Number, default: 1 },
    focus: { type: Number, default: 1 },
  },

  // Histórico e Progresso
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  health: {
    type: Number,
    default: 100,
  },
  maxHealth: {
    type: Number,
    default: 100,
  },
  mana: {
    type: Number,
    default: 100,
  },
  maxMana: {
    type: Number,
    default: 100,
  },
  coins: {
    type: Number,
    default: 0,
  },
  lastTaskCompletedAt: {
    type: Date,
    default: null, // Armazena a última data de conclusão de uma tarefa
  },
  lastLogin: {
    type: Date,
  },
});

module.exports = mongoose.model("User", usersSchema);
