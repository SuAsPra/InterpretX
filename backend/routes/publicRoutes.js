const express = require('express');
const {
  getPublicAchievements,
  getPublicConnections,
  getPublicProfile,
  getPublicAchievementsByUsername,
  getPublicConnectionsByUsername,
  generatePublicNarrativeByUsername
} = require('../controllers/publicController');
const { generatePublicNarrative } = require('../controllers/narrativeController');

const router = express.Router();

router.get('/achievements', getPublicAchievements);
router.get('/connections', getPublicConnections);
router.post('/narrative/generate', generatePublicNarrative);
router.get('/profile/:username', getPublicProfile);
router.get('/profile/:username/achievements', getPublicAchievementsByUsername);
router.get('/profile/:username/connections', getPublicConnectionsByUsername);
router.post('/profile/:username/narrative/generate', generatePublicNarrativeByUsername);

module.exports = router;
