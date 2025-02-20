const { ROLE } = require('../../common/constants');

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {Object} userData - The user data object containing the username
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData, role) => {
  return jwt.sign(
    { 
      username: userData.username,
      role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verifies a JSON Web Token (JWT)
 * @param {string} token - The JWT token to verify
 * @returns {jwt.Jwt} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };