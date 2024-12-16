const mongoose = require("mongoose");

const profilesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  mainGoal: {
    type: String,
    enum: [
      "develop_strength",
      "increase_endurance",
      "improve_focus",
      "gain_discipline",
      "evolve_all",
    ],
  },
  height: {
    type: Number,
  },
  weight: {
    type: Number,
  },
  exerciseFrequency: {
    type: String,
    enum: ["sedentary", "1-2", "3-4", "daily"],
  },
  exerciseIntensity: {
    type: String,
    enum: ["low", "medium", "hard"],
  },
  cognitiveChallengePreference: {
    type: String,
    enum: ["hard", "medium", "low"],
  },
  selfDisciplineLevel: {
    type: String,
    enum: ["high", "medium", "low"],
  },
  studyFrequency: {
    type: String,
    enum: ["daily", "1-2", "3-4", "rarely"],
  },
});

module.exports = mongoose.model("Profile", profilesSchema);
