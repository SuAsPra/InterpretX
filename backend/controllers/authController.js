const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const toSlugBase = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);

const generateUniqueUsername = async (name, email) => {
  const emailBase = email.split('@')[0] || 'user';
  const base = toSlugBase(name) || toSlugBase(emailBase) || 'user';
  let candidate = base;
  let count = 0;

  while (count < 50) {
    const exists = await User.exists({ username: candidate });
    if (!exists) return candidate;
    count += 1;
    candidate = `${base}_${count}`;
  }

  return `${base}_${Date.now().toString().slice(-5)}`;
};

const ensureUserHasUsername = async (user) => {
  if (user.username) return user.username;

  const username = await generateUniqueUsername(user.name || 'user', user.email || 'user@example.com');
  user.username = username;
  await user.save();
  return username;
};

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername(name, email.toLowerCase());

    const user = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    const token = signToken(user._id.toString());

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.username) {
      const username = await generateUniqueUsername(user.name, user.email);
      user.username = username;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id.toString());

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await ensureUserHasUsername(user);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  me
};
