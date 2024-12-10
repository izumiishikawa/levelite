const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Profile = require("../models/profiles")
const authConfig = require("../config/auth.json");

const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
      expiresIn: 90000,
    });
  }

// Rota para cadastro de usuário
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
    console.log(username);

  try {
    if (!username || !email || !password) {
        return res.status(400).send({ error: "All fields are required" });
      }

    // Verifica se o e-mail já está cadastrado
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: "User already exists!" });
    }

    // Criptografa a senha antes de salvar
    const passwordHash = await bcrypt.hash(password, 10);

    // Cria o novo usuário com os atributos iniciais e o nível 1
    const user = await User.create({
      username,
      email,
      passwordHash,
      level: 1,
      currentXP: 0,
      xpForNextLevel: 100,
      pointsToDistribute: 0,
      attributes: {
        vitality: 1,
        aura: 1,
        focus: 1,
      },
      tasksCompleted: 0,
      streak: 0,
    });

    // Remove o campo de senha para não ser enviado na resposta
    user.password = undefined;

    // Retorna o usuário e o token de autenticação
    return res.status(201).send({
      user,
      token: generateToken({ id: user.id }),
    });
  } catch (err) {
    console.error(err); // Log do erro para depuração
    return res.status(400).send({ error: "Registration failed" });
  }
});

router.post("/profile", async (req, res) => {
  const {
    userId,
    mainGoal,
    height,
    weight,
    exerciseFrequency,
    exerciseIntensity = "low",
    cognitiveChallengePreference,
    selfDisciplineLevel,
    studyFrequency,
    vitality = 0,
    aura = 0,
    focus = 0,
  } = req.body;

  console.log(req.body)

  try {
    // Valida se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Atualiza os atributos no schema User
    user.attributes.vitality += vitality;
    user.attributes.aura += discipline;
    user.attributes.focus += perspicacity;

    // Salva as atualizações no banco de dados para o User
    await user.save();

    // Atualiza ou cria o perfil do usuário no schema Profile
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId }); // Cria um novo perfil se não existir
    }

    profile.mainGoal = mainGoal;
    profile.height = height;
    profile.weight = weight;
    profile.exerciseFrequency = exerciseFrequency;
    profile.exerciseIntensity = exerciseIntensity ? exerciseIntensity : "low";
    profile.cognitiveChallengePreference = cognitiveChallengePreference;
    profile.selfDisciplineLevel = selfDisciplineLevel;
    profile.studyFrequency = studyFrequency;

    // Salva as atualizações no banco de dados para o Profile
    await profile.save();

    return res.status(200).send({
      message: "Profile and attributes updated successfully",
      user,
      profile
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: "Failed to update profile and attributes" });
  }
});

module.exports = (app) => app.use("/auth", router);
