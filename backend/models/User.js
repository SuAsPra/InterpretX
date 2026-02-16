const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
      match: /^[a-z0-9_]+$/
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'Invalid email format'
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },
    bio: {
      type: String,
      default: ''
    },
    profilePhoto: {
      type: String,
      default: ''
    },
    customNarrative: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

module.exports = mongoose.model('User', userSchema);
