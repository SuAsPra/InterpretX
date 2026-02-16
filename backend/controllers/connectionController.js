const Connection = require('../models/Connection');
const Achievement = require('../models/Achievement');

const createConnection = async (req, res) => {
  try {
    const { fromAchievementId, toAchievementId } = req.body;

    if (!fromAchievementId || !toAchievementId) {
      return res.status(400).json({ message: 'Both achievement IDs are required' });
    }

    if (fromAchievementId === toAchievementId) {
      return res.status(400).json({ message: 'Cannot connect an achievement to itself' });
    }

    const ownedCount = await Achievement.countDocuments({
      userId: req.user.id,
      _id: { $in: [fromAchievementId, toAchievementId] }
    });

    if (ownedCount !== 2) {
      return res.status(403).json({ message: 'One or more achievements do not belong to current user' });
    }

    const connection = await Connection.create({
      ...req.body,
      userId: req.user.id
    });

    return res.status(201).json(connection);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This connection with the same relation type already exists.'
      });
    }

    return res.status(500).json({ message: 'Failed to create connection', error: error.message });
  }
};

const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({ userId: req.user.id }).sort({ createdAt: 1 });
    return res.json(connections);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch connections', error: error.message });
  }
};

const deleteConnection = async (req, res) => {
  try {
    const connection = await Connection.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }

    return res.json({ message: 'Connection deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete connection', error: error.message });
  }
};

module.exports = {
  createConnection,
  getConnections,
  deleteConnection
};
