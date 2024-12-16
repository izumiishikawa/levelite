const mongoose = require('mongoose');

const itemDataSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true // Nome único para evitar duplicidades
  },
  description: { 
    type: String 
  },
  rarity: { 
    type: String, 
    enum: ['common', 'rare', 'epic', 'legendary'], 
    default: 'common' 
  },
  type: { 
    type: String, 
    enum: ['consumable', 'equipment', 'misc'], 
    required: true 
  },
  inShop: { 
    type: Boolean,
    default: true,
  },
  buyPrice: {
    type: Number,
    default: 0,
  },
  effect: { 
    type: String, 
    enum: [
      'healing', 
      'mana_recover', 
      'exp_boost', 
      'stamina_boost', 
      'damage_boost', 
      'defense_boost',
      'escape_penalty', // Novo efeito: Escapar da zona de penalidade
      'max_health_increase', // Novo efeito: Aumentar a vida máxima
      'add_gold', // Novo efeito: Adicionar ouro
      'level_up'
    ], 
    required: true 
  },
  baseValue: { 
    type: Number, 
    default: 0 
  },
  icon: { 
    type: String, 
    required: true 
  }
});

// Exporta o modelo
module.exports = mongoose.model('ItemData', itemDataSchema);
