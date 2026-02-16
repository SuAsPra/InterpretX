const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140
    },
    type: {
      type: String,
      enum: ['course', 'project', 'certificate', 'experience', 'award'],
      required: true
    },
    description: {
      type: String,
      required: true,
      maxlength: 1500
    },
    date: {
      type: Date,
      required: true
    },
    skillsGained: {
      type: [String],
      default: []
    },
    proofLink: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
