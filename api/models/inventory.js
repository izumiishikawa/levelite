import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      description: {
        type: String,
      },
      attributes: {
        rarity: {
          type: String,
          enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
          required: true,
          default: 'common',
        },
        actions: [
          {
            type: {
              type: String,
              enum: ['heal', 'recover_mana', 'teleport', 'gain_xp', 'other'],
              required: true,
            },
            value: {
              type: Number, // Valor associado à ação, como quantidade de cura, mana, etc.
              required: true,
            },
          },
        ],
        durability: {
          type: Number,
          default: 100,
        },
      },
    },
  ],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
