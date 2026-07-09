'use strict';

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/generateToken');
const { seedUser } = require('../seed/seedUser');

/**
 * @desc    Register a new user and seed demo data
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  const user = await User.create({ name, email, password });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  // Seed demo data for the new user.
  // If seeding fails the error propagates to the global error handler
  // and the registration response is not sent, giving the client a
  // clear 500 rather than a partial success. The created User document
  // will persist (it was already committed outside a transaction here),
  // but because the uniqueness constraint on email prevents duplicate
  // registrations, a retry from the client will hit the "already exists"
  // branch and the developer can re-run seedUser manually if needed.
  console.log("========== SEED START ==========");
  await seedUser(user._id);
  console.log("========== SEED END ==========");

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

/**
 * @desc    Authenticate user and return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

/**
 * @desc    Log out the current user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires:  new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = { registerUser, loginUser, getMe, logoutUser };