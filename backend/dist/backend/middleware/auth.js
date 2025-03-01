"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const authUtils_1 = require("@utils/authUtils");
const constants_1 = require("@common/constants");
/**
 * @description Middleware to authenticate user based on JWT token.
 * @returns {Object} - Returns error response if token is missing or invalid, otherwise calls next middleware.
 */
const authMiddleware = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = (0, authUtils_1.verifyToken)(token);
    if (!decoded) {
        return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
};
exports.authMiddleware = authMiddleware;
/**
 * @description Middleware to authorize user with admin role.
 * @returns {Object} - Returns error response if user is not an admin, otherwise calls next middleware.
 */
const adminMiddleware = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== constants_1.Role.ADMIN) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
