const jwt = require('jsonwebtoken');
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const User = require('../models/User');

/**
 * Middleware to protect routes - verifies JWT token
 * Token can come from Authorization header (Bearer token) or cookies
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Fallback: Check cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token payload (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    next();
  } catch (error) {
    res.status(401);
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Not authorized, invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Not authorized, token expired');
    }
    throw new Error('Not authorized, token verification failed');
  }
});

module.exports = { protect };