const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  type: { type: String, required: true }, // Tipo de requisito (task-streak, xp, etc.)
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Valor do requisito
  description: { type: String, required: true }, // Descrição amigável do requisito
});

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  requirements: [RequirementSchema], 
});

const DungeonSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  enemies: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      health: { type: Number, default: 100 },
      tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], 
      rewards: {
        xp: { type: Number, required: true },
        items: [{ type: String }],
      },
    },
  ],
  boss: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    health: { type: Number, default: 300 },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], 
    rewards: {
      xp: { type: Number, required: true },
      items: [{ type: String }],
    },
  },
});

const TreasureSchema = new mongoose.Schema({
  id: { type: String, required: true },
  rewards: {
    xp: { type: Number, required: false },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "ItemData" }], 
  },
});

const RoadmapElementSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['node', 'dungeon', 'treasure'] },
  element: {
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
});

const RoadmapSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  elements: [RoadmapElementSchema], 
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
