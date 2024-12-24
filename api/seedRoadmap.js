const mongoose = require('mongoose');
const Roadmap = require('./models/roadmap');
const ItemData = require('./models/itemData');

// Conectando ao MongoDB
mongoose.connect('mongodb://localhost:27017/levelite', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const getRandomRareItems = async (count) => {
  const rareItems = await ItemData.aggregate([
    { $match: { rarity: 'rare' } },
    { $sample: { size: count } }
  ]);

  return rareItems.map(item => item._id);
};

const createRoadmap = async () => {
  try {
    // Buscar dois itens aleatórios de raridade "rara"
    const treasure1Items = await getRandomRareItems(2);
    const treasure2Items = await getRandomRareItems(2);

    const roadmap = new Roadmap({
      name: "Mystic Quest: Path of the Chosen",
      description: "Embark on a mystical journey through forgotten realms. Overcome trials, unlock ancient treasures, and become a legend.",
      elements: [
        {
          type: "node",
          element: {
            id: "node0",
            name: "The Awakening",
            requirements: [],
            description: "Begin your journey as the chosen one, stepping into the unknown."
          }
        },
        {
          type: "node",
          element: {
            id: "node1",
            name: "The Trial of Courage",
            requirements: [
              {
                type: "task-streak",
                value: 5,
                description: "Complete tasks for 5 consecutive days to prove your bravery."
              }
            ],
            description: "Face the challenges that test your resolve and determination."
          }
        },
        {
          type: "treasure",
          element: {
            id: "treasure1",
            rewards: {
              xp: 200,
              items: treasure1Items // Itens aleatórios de raridade rara
            },
            description: "An ancient chest filled with rare artifacts from a forgotten era."
          }
        },
        {
          type: "node",
          element: {
            id: "node2",
            name: "The Path of Wisdom",
            requirements: [
              {
                type: "xp",
                value: 800,
                description: "Accumulate 800 XP to unlock the secrets of the ancients."
              }
            ],
            description: "Walk the path of enlightenment, gaining insights from ancient knowledge."
          }
        },
        {
          type: "treasure",
          element: {
            id: "treasure2",
            rewards: {
              xp: 300,
              items: treasure2Items // Itens aleatórios de raridade rara
            },
            description: "A treasure trove guarded by the spirits of the wise."
          }
        },
        {
          type: "node",
          element: {
            id: "node3",
            name: "The Final Ascent",
            requirements: [
              {
                type: "level",
                value: 7,
                description: "Reach level 7 to ascend to the pinnacle of your destiny."
              }
            ],
            description: "The summit awaits, where legends are forged and glory is eternal."
          }
        }
      ]
    });

    await roadmap.save();
    console.log("Roadmap created successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error creating roadmap:", err);
    mongoose.disconnect();
  }
};

createRoadmap();
