const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  icon: {
    type: String,
    default: 'default.jpg',
  },
  banner: {
    type: String,
    default: 'default_banner.jpg',
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

  playerTitle: {
    type: String,
    default: 'Novice',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  inPenaltyZone: {
    type: Boolean,
    required: true,
    default: false,
  },

  totalExp: {
    type: Number,
    default: 0,
  },

  allDone: {
    type: Boolean,
    default: false,
  },

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

  classGeneratedWeek: {
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

  attributes: {
    aura: { type: Number, default: 1 },
    vitality: { type: Number, default: 1 },
    focus: { type: Number, default: 1 },
  },

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
  gems: {
    type: Number,
    default: 0,
  },
  lastTaskCompletedAt: {
    type: Date,
    default: null,
  },
  lastLogin: {
    type: Date,
  },

  completedDates: {
    type: [String],
    default: [],
  },

  penalityDates: {
    type: [String],
    default: [],
  },

  friendId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  friends: {
    type: [
      {
        friendId: { type: String },
      },
    ],
    default: [],
  },

  currentRoadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    default: null,
  },

  currentDungeon: {
    dungeonId: { type: String, ref: 'Dungeon', default: null },
    currentEnemy: { id: { type: String }, health: { type: Number } }, // ID do inimigo atual
    defeatedEnemies: { type: [String], default: [] }, // IDs dos inimigos derrotados
    bossDefeated: { type: Boolean, default: false }, // Status do boss
  },

  roadmapProgress: {
    type: [
      {
        roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
        completedNodes: { type: [String], default: [] }, // IDs dos nodes concluídos
        completedTreasures: { type: [String], default: [] }, // IDs dos baús abertos
        completedDungeons: { type: [String], default: [] }, // IDs das dungeons concluídas
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model('User', usersSchema);
