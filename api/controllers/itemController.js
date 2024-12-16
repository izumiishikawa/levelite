const express = require('express');
const ItemData = require('../models/itemData'); // Modelo dos dados dos itens
const multer = require('multer');
const multerConfig = require('../config/multer');

const router = express.Router();

// Criar um novo item
router.post(
  '/create',
  multer(multerConfig).single('file'), // Middleware para upload de arquivo
  async (req, res) => {
    try {
      const { name, description, rarity, type, effect, baseValue } = req.body;

      // Verificar se o arquivo foi enviado
      if (!req.file) {
        return res.status(400).json({ message: 'Imagem é obrigatória!' });
      }

      // Extrair informações do arquivo enviado
      const { filename: icon } = req.file;

      // Verificar se o item já existe no banco de dados
      const existingItem = await ItemData.findOne({ name });
      if (existingItem) {
        return res.status(400).json({ message: 'Item já existe.' });
      }

      // Criar um novo item
      const newItem = new ItemData({
        name,
        icon, // Salvar o nome do arquivo como o ícone do item
        description,
        rarity,
        type,
        effect,
        baseValue,
      });

      // Salvar o item no banco de dados
      await newItem.save();

      // Retornar o item criado
      res.status(201).json(newItem);
    } catch (error) {
      // Retornar erro caso algo dê errado
      res.status(500).json({ message: error.message });
    }
  }
);

// Listar todos os itens
router.get('/', async (req, res) => {
  try {
    const items = await ItemData.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listar todos os itens disponíveis na loja
router.get('/shop', async (req, res) => {
    try {
      const shopItems = await ItemData.find({ inShop: true }); // Filtrar itens com inShop: true
      res.json(shopItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// Obter um item específico pelo `_id`
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar o item pelo `_id` diretamente
    const item = await ItemData.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atualizar um item existente pelo `_id`
router.put('/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Atualizar o item usando o `_id`
    const item = await ItemData.findByIdAndUpdate(id, updates, { new: true });
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado.' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remover um item pelo `_id`
router.delete('/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;

    // Remover o item pelo `_id`
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
