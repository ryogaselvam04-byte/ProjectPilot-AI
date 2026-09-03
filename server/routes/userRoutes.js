const express = require('express');
const {
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  updateUserRole,
  deleteUserByAdmin,
  getPlatformStats,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.delete('/me', deleteAccount);

// Admin-only
router.get('/', adminOnly, getAllUsers);
router.get('/stats', adminOnly, getPlatformStats);
router.put('/:id/role', adminOnly, updateUserRole);
router.delete('/:id', adminOnly, deleteUserByAdmin);

module.exports = router;
