import { Request, Response, NextFunction } from 'express';
import { getUserFromToken, verifyToken } from '@utils/authUtils';
import { Role } from '@common/constants';
import { UserData } from '@common/models';

// Define proper type for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: UserData;
}

/**
 * @description Middleware to authenticate user based on JWT token.
 */
const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      message: 'Authentication required', 
      details: 'Valid Bearer token is required in Authorization header'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const userData = await getUserFromToken(token);
    if (!userData) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    req.user = userData;
    next();
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.includes('expired') 
        ? 'Token has expired' 
        : 'Invalid token';
      res.status(401).json({ message, details: error.message });
      return;
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * @description Middleware to authorize user with admin role.
 */
const adminMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      message: 'Authentication required', 
      details: 'Valid Bearer token is required in Authorization header'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const userData = await getUserFromToken(token);
    if (!userData) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    if (userData.role < Role.ADMIN) {
      res.status(403).json({ 
        message: 'Access denied',
        details: 'This action requires administrator privileges'
      });
      return;
    }
    req.user = userData;
    next();
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.includes('expired') 
        ? 'Token has expired' 
        : 'Invalid token';
      res.status(401).json({ message, details: error.message });
      return;
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * @description Middleware to authorize user with manager or higher role.
 */
const managerMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      message: 'Authentication required', 
      details: 'Valid Bearer token is required in Authorization header'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const userData = await getUserFromToken(token);
    if (!userData) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    if (userData.role < Role.MANAGER) {
      res.status(403).json({ 
        message: 'Access denied',
        details: 'This action requires manager privileges'
      });
      return;
    }
    req.user = userData;
    next();
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message.includes('expired') 
        ? 'Token has expired' 
        : 'Invalid token';
      res.status(401).json({ message, details: error.message });
      return;
    }
    res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * @description Helper function to check if a request is authenticated
 */
const isAuthenticated = (req: AuthenticatedRequest): boolean => {
  return !!req.user;
};

/**
 * @description Helper function to check if a request has minimum role level
 */
const hasMinimumRole = (req: AuthenticatedRequest, minRole: Role): boolean => {
  return (req.user?.role || Role.GUEST) >= minRole;
};

export { 
  authMiddleware, 
  adminMiddleware, 
  managerMiddleware, 
  isAuthenticated,
  hasMinimumRole
};