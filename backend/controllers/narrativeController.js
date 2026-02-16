const Achievement = require('../models/Achievement');
const Connection = require('../models/Connection');
const User = require('../models/User');

const relationTextMap = {
  led_to: 'led to',
  enabled: 'enabled',
  applied_in: 'was applied in',
  resulted_in: 'resulted in'
};

const buildNarrative = async (query = {}, options = {}) => {
  const achievements = await Achievement.find(query).sort({ date: 1, createdAt: 1 });
  const connections = await Connection.find(query);

  if (!achievements.length) {
    return {
      story: options.customStory?.trim() || 'Start adding achievements to generate your narrative story.',
      timeline: []
    };
  }

  const byId = new Map(achievements.map((a) => [a._id.toString(), a]));
  const outgoing = new Map();

  for (const connection of connections) {
    const fromId = connection.fromAchievementId.toString();
    if (!outgoing.has(fromId)) {
      outgoing.set(fromId, []);
    }
    outgoing.get(fromId).push(connection);
  }

  const timeline = achievements.map((achievement) => {
    const linked = outgoing.get(achievement._id.toString()) || [];
    const next = linked
      .map((c) => byId.get(c.toAchievementId.toString()))
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      achievement,
      connections: linked,
      next
    };
  });

  const intro = achievements[0];
  const parts = [
    `Started with ${intro.title} in ${new Date(intro.date).getFullYear()}.`
  ];

  for (const row of timeline) {
    for (const conn of row.connections) {
      const fromA = byId.get(conn.fromAchievementId.toString());
      const toA = byId.get(conn.toAchievementId.toString());
      if (!fromA || !toA) continue;

      if (conn.storyText && conn.storyText.trim().length > 0) {
        parts.push(conn.storyText.trim().endsWith('.') ? conn.storyText.trim() : `${conn.storyText.trim()}.`);
      } else {
        const relation = relationTextMap[conn.relationType] || 'connected to';
        parts.push(`${fromA.title} ${relation} ${toA.title}.`);
      }
    }
  }

  return {
    story: options.customStory?.trim() || parts.join(' '),
    timeline: timeline.map((row) => ({
      id: row.achievement._id,
      title: row.achievement.title,
      date: row.achievement.date,
      description: row.achievement.description,
      relationOut: row.connections.map((c) => ({
        id: c._id,
        relationType: c.relationType,
        storyText: c.storyText,
        toAchievementId: c.toAchievementId
      })),
      nextSteps: row.next.map((n) => ({
        id: n._id,
        title: n.title,
        date: n.date
      }))
    }))
  };
};

const generateNarrative = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('customNarrative');
    const narrative = await buildNarrative(
      { userId: req.user.id },
      { customStory: user?.customNarrative || '' }
    );
    return res.json(narrative);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate narrative', error: error.message });
  }
};

const generatePublicNarrative = async (_req, res) => {
  try {
    const narrative = await buildNarrative({});
    return res.json(narrative);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to generate public narrative', error: error.message });
  }
};

const saveCustomNarrative = async (req, res) => {
  try {
    const story = typeof req.body?.story === 'string' ? req.body.story.trim() : '';
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { customNarrative: story },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ story: user.customNarrative || '' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save narrative', error: error.message });
  }
};

const clearCustomNarrative = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { customNarrative: '' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ story: '' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to clear custom narrative', error: error.message });
  }
};

module.exports = {
  buildNarrative,
  generateNarrative,
  generatePublicNarrative,
  saveCustomNarrative,
  clearCustomNarrative
};
