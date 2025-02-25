import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@utils/authUtils';
import { Role } from '@common/constants';

interface AuthenticatedRequest extends Request {
  user?: any;
}

/**
 * @description Middleware to authenticate user based on JWT token.
 * @returns {Object} - Returns error response if token is missing or invalid, otherwise calls next middleware.
 */
const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
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
const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export { authMiddleware, adminMiddleware };