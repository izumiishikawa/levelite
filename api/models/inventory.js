const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemData', required: true },
  quantity: { type: Number, required: true, default: 1 }, 
});

const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [inventoryItemSchema], 
});

module.exports = mongoose.model('Inventory', inventorySchema);
