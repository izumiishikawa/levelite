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
    default: "default.jpg"
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

  friendId: {
    type: String,
    default: () => uuidv4(),
  },

  friends: {
    type: [
      {
        friendId: { type: String, ref: 'User' },
      }
    ],  
    default: []
  },

  friendRequests: {
    type: [
      {
        from: { type: String, ref: 'User', required: true, unique: true },
        name: { type: String },
        icon: { type: String },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model('User', usersSchema);
