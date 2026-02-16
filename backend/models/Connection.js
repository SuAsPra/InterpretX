const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    fromAchievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    },
    toAchievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement',
      required: true
    },
    relationType: {
      type: String,
      enum: ['led_to', 'enabled', 'applied_in', 'resulted_in'],
      required: true
    },
    storyText: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

connectionSchema.index(
  { userId: 1, fromAchievementId: 1, toAchievementId: 1, relationType: 1 },
  { unique: true }
);

module.exports = mongoose.model('Connection', connectionSchema);
