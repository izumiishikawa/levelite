const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const Profile = require('../models/profiles');
const authConfig = require('../config/auth.json');
const authMiddleware = require("../middlewares/auth");
const inventory = require('../models/inventory');

const router = express.Router();

function generateToken(params = {}) {
  return jwt.sign(params, authConfig.secret, {
    expiresIn: 90000,
  });
}

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).send({ error: 'All fields are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'User already exists!' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      passwordHash,
      level: 1,
      currentXP: 0,
      xpForNextLevel: 532,
      pointsToDistribute: 0,
      attributes: {
        vitality: 1,
        aura: 1,
        focus: 1,
      },
      tasksCompleted: 0,
      streak: 0,
      onboarded: false,
      coins: 0,
      health: 100,
      maxHealth: 100,
      inPenaltyZone: false,
      mana: 100,
      maxMana: 100,
      generatedToday: false,
      classGeneratedToday: false,
      totalExp: 0,
    });

    await Profile.create({
      userId: user._id,
    });

    await inventory.create({
      userId: user._id,
      items: []
    })

    user.password = undefined;

    return res.status(201).send({
      user,
      token: generateToken({ id: user._id }),
    });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ error: 'Registration failed' });
  }
});


router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body;

  try {
    const check_user = await User.findOne({ email }).select('+passwordHash');

    if (!check_user) {
      return res.status(404).send({ error: `The email "${email}" was not found in our system.` });
    }

    const passwordMatch = await bcrypt.compare(password, check_user.passwordHash);

    if (!passwordMatch) {
      return res.status(403).send({ error: 'Incorrect Password!!' });
    }

    check_user.password = undefined;

    res.send({ check_user, token: generateToken({ id: check_user.id }) });
  } catch (error) {
    console.error(error); // Log do erro para depuração
    res.status(500).send('Internal Server Error');
  }
});


router.use(authMiddleware);

router.post('/profile', async (req, res) => {
  const {
    mainGoal,
    height,
    weight,
    exerciseFrequency,
    exerciseIntensity = 'low',
    cognitiveChallengePreference,
    selfDisciplineLevel,
    studyFrequency,
    selectedClass,
    vitality = 0,
    aura = 0,
    focus = 0,
  } = req.body;

  try {
    const userId = req.userId

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }

    user.attributes.vitality += vitality;
    user.attributes.aura += aura;
    user.attributes.focus += focus;
    user.selectedClass = selectedClass;

    user.onboarded = true;

    await user.save();

    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
    }

    profile.mainGoal = mainGoal;
    profile.height = height;
    profile.weight = weight;
    profile.exerciseFrequency = exerciseFrequency;
    profile.exerciseIntensity = exerciseIntensity ? exerciseIntensity : 'low';
    profile.cognitiveChallengePreference = cognitiveChallengePreference;
    profile.selfDisciplineLevel = selfDisciplineLevel;
    profile.studyFrequency = studyFrequency;

    await profile.save();

    return res.status(200).send({
      message: 'Profile and attributes updated successfully',
      user,
      profile,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: 'Failed to update profile and attributes' });
  }
});

router.get('/consult', async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.json(user);
  } catch (error) {
    console.error(error); 
    res.status(500).send('Internal Server Error');
  }
});

module.exports = (app) => app.use('/auth', router);
