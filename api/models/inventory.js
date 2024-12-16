const mongoose = require('mongoose');

// Esquema dos itens dentro do inventário
const inventoryItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ItemData', required: true }, // Referência ao ItemData
  quantity: { type: Number, required: true, default: 1 }, // Quantidade no inventário
});

// Esquema do inventário do usuário
const inventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Cada usuário deve ter apenas um inventário
  },
  items: [inventoryItemSchema], // Lista de itens no inventário
});

// Exporta o modelo Inventory
module.exports = mongoose.model('Inventory', inventorySchema);
