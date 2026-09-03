const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // "online now" = active in the last 5 minutes

// @desc Update own profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'bio', 'location', 'skills', 'experience', 'socialLinks', 'avatar', 'darkMode'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change password
// @route PUT /api/users/password
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete own account
// @route DELETE /api/users/me
const deleteAccount = async (req, res) => {
  try {
    await Project.deleteMany({ owner: req.user._id });
    await Task.deleteMany({ owner: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===== Admin-only =====

// @desc Get all users, with a live "online now" flag (admin)
// @route GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    const withStatus = users.map((u) => ({
      ...u,
      online: Date.now() - new Date(u.lastActiveAt || 0).getTime() < ONLINE_THRESHOLD_MS,
    }));
    res.json(withStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Change a user's role - promote/demote admin (admin)
// @route PUT /api/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be "user" or "admin"' });
    }
    // Prevent an admin from locking themselves out of the only admin account
    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({ message: "You can't remove your own admin access" });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete any user (admin)
// @route DELETE /api/users/:id
const deleteUserByAdmin = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: "Use Settings to delete your own account" });
    }
    await Project.deleteMany({ owner: req.params.id });
    await Task.deleteMany({ owner: req.params.id });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Platform-wide stats (admin)
// @route GET /api/users/stats
const getPlatformStats = async (req, res) => {
  try {
    const [userCount, projectCount, taskCount, onlineNow] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Task.countDocuments(),
      User.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - ONLINE_THRESHOLD_MS) } }),
    ]);
    res.json({ userCount, projectCount, taskCount, onlineNow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  updateUserRole,
  deleteUserByAdmin,
  getPlatformStats,
};
