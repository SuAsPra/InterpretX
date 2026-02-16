const Achievement = require('../models/Achievement');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { buildNarrative } = require('./narrativeController');

const getPublicAchievements = async (_req, res) => {
  try {
    const achievements = await Achievement.find({}).sort({ date: 1, createdAt: 1 }).limit(250);
    return res.json(achievements);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch public achievements', error: error.message });
  }
};

const getPublicConnections = async (_req, res) => {
  try {
    const connections = await Connection.find({}).sort({ createdAt: 1 }).limit(500);
    return res.json(connections);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch public connections', error: error.message });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select(
      'name username bio profilePhoto createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch public profile', error: error.message });
  }
};

const getPublicAchievementsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const achievements = await Achievement.find({ userId: user._id }).sort({ date: 1, createdAt: 1 }).limit(500);
    return res.json(achievements);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile achievements', error: error.message });
  }
};

const getPublicConnectionsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('_id');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const connections = await Connection.find({ userId: user._id }).sort({ createdAt: 1 }).limit(800);
    return res.json(connections);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile connections', error: error.message });
  }
};

const generatePublicNarrativeByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('_id customNarrative');
    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const narrative = await buildNarrative(
      { userId: user._id },
      { customStory: user.customNarrative || '' }
    );
    return res.json(narrative);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate profile narrative', error: error.message });
  }
};

module.exports = {
  getPublicAchievements,
  getPublicConnections,
  getPublicProfile,
  getPublicAchievementsByUsername,
  getPublicConnectionsByUsername,
  generatePublicNarrativeByUsername
};
