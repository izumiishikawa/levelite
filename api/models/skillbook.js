const mongoose = require('mongoose');

const skillBookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  focus: { type: String, required: true },
  parameters: {
    difficulty: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  },
  dateCreated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SkillBook', skillBookSchema);
