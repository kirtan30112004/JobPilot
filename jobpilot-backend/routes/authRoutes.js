const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidator,
  loginValidator,
} = require('../validators/authValidator');

const router = express.Router();

// @route   POST /api/auth/register
router.post('/register', registerValidator, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginValidator, loginUser);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
router.post('/logout', protect, logoutUser);

module.exports = router;