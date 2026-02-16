const express = require('express');
const {
  createConnection,
  getConnections,
  deleteConnection
} = require('../controllers/connectionController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);
router.post('/', createConnection);
router.get('/', getConnections);
router.delete('/:id', deleteConnection);

module.exports = router;
