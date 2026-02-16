const mongoose = require('mongoose');
const Connection = require('../models/Connection');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Connection.syncIndexes();
    await User.syncIndexes();
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
