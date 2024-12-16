const express = require("express");
const mongoose = require("mongoose");
const Inventory = require("../models/inventory"); // Modelo do inventário
const ItemData = require("../models/itemData"); // Modelo dos dados dos itens
const applyItemEffect = require("../utils/applyItemEffect");
const authMiddleware = require("../middlewares/auth")
const User = require("../models/users")

const router = express.Router();
const MAX_SLOTS = 30; // Limite de slots do inventário

router.use(authMiddleware)

// Criar inventário para um usuário
router.post("/create", async (req, res) => {
    try {
        const userId = req.userId;

        // Verifica se o inventário já existe
        const existingInventory = await Inventory.findOne({ userId });
        if (existingInventory) {
            return res.status(400).json({ message: "Inventário já existe para este usuário." });
        }

        const newInventory = new Inventory({ userId, items: [] });
        await newInventory.save();

        res.status(201).json(newInventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Listar inventário de um usuário
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const inventory = await Inventory.findOne({ userId }).populate("items.itemId");
        if (!inventory) {
            return res.status(404).json({ message: "Inventário não encontrado." });
        }

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/:userId/buy", async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId } = req.body;

        // Buscar o usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Buscar o item no banco de dados
        const itemData = await ItemData.findById(itemId);
        if (!itemData || !itemData.buyPrice) {
            return res.status(404).json({ message: "Item não encontrado ou indisponível para compra." });
        }

        // Verificar se o usuário tem moedas suficientes
        if (user.coins < itemData.buyPrice) {
            return res.status(400).json({ message: "Moedas insuficientes para comprar este item." });
        }

        // Buscar ou criar o inventário do usuário
        const inventory = await Inventory.findOne({ userId });
        if (!inventory) {
            return res.status(404).json({ message: "Inventário não encontrado." });
        }

        // Verificar se o item já está no inventário
        const existingItem = inventory.items.find(item => item.itemId.equals(itemData._id));
        if (existingItem) {
            existingItem.quantity += 1; // Incrementa a quantidade existente
        } else {
            inventory.items.push({ itemId: itemData._id, quantity: 1 }); // Adiciona o item ao inventário
        }

        // Deduzir moedas do usuário
        user.coins -= itemData.buyPrice;

        // Salvar mudanças no inventário e no usuário
        await inventory.save();
        await user.save();

        res.status(200).json({ message: "Item comprado com sucesso!", item: itemData });
    } catch (error) {
        console.error("Erro ao comprar item:", error.message);
        res.status(500).json({ message: "Erro interno do servidor.", error: error.message });
    }
});

router.post("/:userId/use", async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId } = req.body;

        // Verificar se o inventário do usuário existe
        const inventory = await Inventory.findOne({ userId });
        if (!inventory) {
            return res.status(404).json({ message: "Inventário não encontrado." });
        }

        // Verificar se o item existe no inventário
        const itemIndex = inventory.items.findIndex(item => item.itemId.equals(itemId));
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Item não encontrado no inventário." });
        }

        const item = inventory.items[itemIndex];
        // Buscar os detalhes do item
        const itemData = await ItemData.findById(itemId);
        if (!itemData) {
            return res.status(404).json({ message: "Item não encontrado no banco de dados." });
        }

        // Validar o tipo do item
        if (itemData.type !== "consumable") {
            return res.status(400).json({ message: "Item não é consumível." });
        }

        // Buscar os detalhes do usuário
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // Aplicar o efeito do item usando o handler
        const effectResult = applyItemEffect(itemData.effect, user, itemData);

        // Reduzir a quantidade do item no inventário
        if (item.quantity > 1) {
            inventory.items[itemIndex].quantity -= 1;
        } else {
            inventory.items.splice(itemIndex, 1); // Remove o item se a quantidade for 1
        }

        // Salvar mudanças no inventário e no usuário
        await inventory.save();
        await user.save();

        res.status(200).json({ message: "Item usado com sucesso.", effect: effectResult });
    } catch (error) {
        console.error("Erro ao usar item:", error.message);
        res.status(500).json({ message: "Erro interno do servidor.", error: error.message });
    }
});


// Adicionar item ao inventário de um usuário
router.post("/:userId/add", async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId, quantity = 1 } = req.body; // Define um valor padrão de 1 para quantity

        const inventory = await Inventory.findOne({ userId });
        if (!inventory) {
            return res.status(404).json({ message: "Inventário não encontrado." });
        }

        // Verificar o total de slots ocupados
        const totalSlotsUsed = inventory.items.length;
        if (totalSlotsUsed >= MAX_SLOTS) {
            return res.status(400).json({ message: "Inventário cheio. Não é possível adicionar mais itens." });
        }

        // Buscar o item no banco de dados
        const itemData = await ItemData.findById(itemId);
        if (!itemData) {
            return res.status(404).json({ message: "Item não encontrado no jogo." });
        }

        // Verificar se o item já está no inventário
        const existingItem = inventory.items.find((item) => item.itemId.equals(itemData._id));
        if (existingItem) {
            // Incrementa a quantidade existente
            existingItem.quantity += quantity;
        } else {
            // Adiciona um novo item ao inventário
            inventory.items.push({ itemId: itemData._id, quantity });
        }

        await inventory.save();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Atualizar quantidade de item no inventário
router.put("/:userId/update", async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId, quantity } = req.body;

        const inventory = await Inventory.findOne({ userId });
        if (!inventory) {
            return res.status(404).json({ message: "Inventário não encontrado." });
        }

        const item = inventory.items.find((i) => i.itemId.equals(mongoose.Types.ObjectId(itemId)));
        if (!item) {
            return res.status(404).json({ message: "Item não encontrado no inventário." });
        }

        item.quantity = quantity;
        await inventory.save();

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remover item do inventário
router.delete("/:userId/remove", async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemId } = req.body;

        const inventory = await Inventory.findOne({ userId });
        if (!inventory) {
            return res.status(404).json({ message: "Inventário não encontrado." });
        }

        inventory.items = inventory.items.filter((item) => !item.itemId.equals(mongoose.Types.ObjectId(itemId)));
        await inventory.save();

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Exporta o controller
module.exports = (app) => app.use("/inventory", router);
