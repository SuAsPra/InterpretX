const Achievement = require('../models/Achievement');
const Connection = require('../models/Connection');

const createAchievement = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      userId: req.user.id
    };

    const achievement = await Achievement.create(payload);
    return res.status(201).json(achievement);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create achievement', error: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id }).sort({ date: 1, createdAt: 1 });
    return res.json(achievements);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch achievements', error: error.message });
  }
};

const updateAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    return res.json(achievement);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update achievement', error: error.message });
  }
};

const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    await Connection.deleteMany({
      userId: req.user.id,
      $or: [{ fromAchievementId: achievement._id }, { toAchievementId: achievement._id }]
    });

    return res.json({ message: 'Achievement deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete achievement', error: error.message });
  }
};

module.exports = {
  createAchievement,
  getAchievements,
  updateAchievement,
  deleteAchievement
};
