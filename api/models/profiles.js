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
    required: true,
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
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  exerciseFrequency: {
    type: String,
    enum: ["sedentary", "1-2", "3-5", "daily"],
    required: true,
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
    enum: ["daily", "1-2", "rarely"],
  },
});

module.exports = mongoose.model("Profile", profilesSchema);
