const express = require('express');
const ItemData = require('../models/itemData'); 
const multer = require('multer');
const multerConfig = require('../config/multer');

const router = express.Router();

router.post(
  '/create',
  multer(multerConfig).single('file'), 
  async (req, res) => {
    try {
      const { name, description, rarity, type, effect, baseValue } = req.body;

      if (!req.file) {
        return res.status(400).json({ message: 'Imagem é obrigatória!' });
      }

      const { filename: icon } = req.file;

      const existingItem = await ItemData.findOne({ name });
      if (existingItem) {
        return res.status(400).json({ message: 'Item já existe.' });
      }

      const newItem = new ItemData({
        name,
        icon, 
        description,
        rarity,
        type,
        effect,
        baseValue,
      });

      await newItem.save();

      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get('/', async (req, res) => {
  try {
    const items = await ItemData.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/shop', async (req, res) => {
    try {
      const shopItems = await ItemData.find({ inShop: true }); 
      res.json(shopItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ItemData.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await ItemData.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await ItemData.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json({ message: 'Item removido com sucesso.', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = (app) => app.use('/itemData', router);
