const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Create new user (password hashing handled by pre-save hook in model)
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Compare entered password with stored hashed password
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
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    },
  });
});

/**
 * @desc    Get current logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
};