const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  from: { type: String, required: true }, // `friendId` de quem enviou a solicitação
  to: { type: String, required: true },   // `friendId` de quem recebeu a solicitação
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }, // Estado da solicitação
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
