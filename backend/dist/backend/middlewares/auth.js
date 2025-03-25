"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMinimumRole = exports.isAuthenticated = exports.managerMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const authUtils_1 = require("@utils/authUtils");
const constants_1 = require("@common/constants");
const models_1 = require("@common/models");
/**
 * @description Middleware to authenticate user based on JWT token.
 */
const authMiddleware = (req, res, next) => {
    // Check for token in Authorization header
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
        // Verify token and extract user data from token
        const decoded = (0, authUtils_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        // Attach user data to request
        req.user = models_1.UserData.parse(decoded);
        next();
    }
    catch (error) {
        // Handle specific token errors
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
exports.authMiddleware = authMiddleware;
/**
 * @description Middleware to authorize user with admin role.
 */
const adminMiddleware = (req, res, next) => {
    // Check for token in Authorization header
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
        // Verify token and extract user data from token
        const decoded = (0, authUtils_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        const user = decoded;
        if (user.role < constants_1.Role.ADMIN) {
            res.status(403).json({
                message: 'Access denied',
                details: 'This action requires administrator privileges'
            });
            return;
        }
        next();
    }
    catch (error) {
        // Handle specific token errors
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
exports.adminMiddleware = adminMiddleware;
/**
 * @description Middleware to authorize user with manager or higher role.
 */
const managerMiddleware = (req, res, next) => {
    // Check for token in Authorization header
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
        // Verify token and extract user data from token
        const decoded = (0, authUtils_1.verifyToken)(token);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        const user = decoded;
        if (user.role < constants_1.Role.MANAGER) {
            res.status(403).json({
                message: 'Access denied',
                details: 'This action requires manager privileges'
            });
            return;
        }
        next();
    }
    catch (error) {
        // Handle specific token errors
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
exports.managerMiddleware = managerMiddleware;
/**
 * @description Helper function to check if a request is authenticated
 */
const isAuthenticated = (req) => {
    return !!req.user;
};
exports.isAuthenticated = isAuthenticated;
/**
 * @description Helper function to check if a request has minimum role level
 */
const hasMinimumRole = (req, minRole) => {
    var _a;
    return (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || constants_1.Role.GUEST) >= minRole;
};
exports.hasMinimumRole = hasMinimumRole;
