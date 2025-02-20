const { verifyToken } = require('../utils/authUtils');
const { ROLE } = require('../../common/constants');

/**
 * @description Middleware to authenticate user based on JWT token.
 * @returns {Object} - Returns error response if token is missing or invalid, otherwise calls next middleware.
 */
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

/**
 * @description Middleware to authorize user with admin role.
 * @returns {Object} - Returns error response if user is not an admin, otherwise calls next middleware.
 */
const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== ROLE.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };