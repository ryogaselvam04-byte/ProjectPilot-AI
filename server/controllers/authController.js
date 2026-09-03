const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Basic strength check: 6+ chars is enforced by the schema; this adds a
// "not obviously weak" check so /register rejects things like "123456".
const isPasswordTooWeak = (password) => {
  const commonWeak = ['123456', 'password', 'qwerty', '111111', 'abc123'];
  return commonWeak.includes(password.toLowerCase());
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (isPasswordTooWeak(password)) {
      return res.status(400).json({ message: 'Please choose a stronger password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

    // Don't reveal whether the account exists - same generic message throughout
    const genericFail = () => res.status(401).json({ message: 'Invalid email or password' });

    if (!user) return genericFail();

    if (user.isLocked) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.registerFailedLogin();
      return genericFail();
    }

    await user.registerSuccessfulLogin();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
