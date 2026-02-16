const express = require('express');
const {
  createAchievement,
  getAchievements,
  updateAchievement,
  deleteAchievement
} = require('../controllers/achievementController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.post('/', createAchievement);
router.get('/', getAchievements);
router.put('/:id', updateAchievement);
router.delete('/:id', deleteAchievement);

module.exports = router;
