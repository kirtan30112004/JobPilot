const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a given user ID
 * @param {String} userId - The MongoDB ObjectId of the user
 * @returns {String} - Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

/**
 * Sets the JWT token as an HTTP-only cookie on the response object
 * @param {Object} res - Express response object
 * @param {String} token - JWT token string
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
};

module.exports = { generateToken, setTokenCookie };