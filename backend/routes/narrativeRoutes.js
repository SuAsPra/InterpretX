const express = require('express');
const {
  generateNarrative,
  saveCustomNarrative,
  clearCustomNarrative
} = require('../controllers/narrativeController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/generate', auth, generateNarrative);
router.put('/custom', auth, saveCustomNarrative);
router.delete('/custom', auth, clearCustomNarrative);

module.exports = router;
