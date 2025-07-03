"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasMinimumRole = exports.isAuthenticated = exports.managerMiddleware = exports.adminMiddleware = exports.authMiddleware = void 0;
const authUtils_1 = require("@utils/authUtils");
const constants_1 = require("@common/constants");
/**
 * @description Middleware to authenticate user based on JWT token.
 */
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Use session cookie for authentication
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.session;
    if (!token) {
        res.status(401).json({
            message: 'Authentication required',
            details: 'Valid session cookie is required'
        });
        return;
    }
    try {
        const userData = yield (0, authUtils_1.getUserFromToken)(token);
        if (!userData) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        req.user = userData;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            const message = error.message.includes('expired')
                ? 'Token has expired'
                : 'Invalid token';
            res.status(401).json({ message, details: error.message });
            return;
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
});
exports.authMiddleware = authMiddleware;
/**
 * @description Middleware to authorize user with admin role.
 */
const adminMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.session;
    if (!token) {
        res.status(401).json({
            message: 'Authentication required',
            details: 'Valid session cookie is required'
        });
        return;
    }
    try {
        const userData = yield (0, authUtils_1.getUserFromToken)(token);
        if (!userData) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        if (userData.role < constants_1.Role.ADMIN) {
            res.status(403).json({
                message: 'Access denied',
                details: 'This action requires administrator privileges'
            });
            return;
        }
        req.user = userData;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            const message = error.message.includes('expired')
                ? 'Token has expired'
                : 'Invalid token';
            res.status(401).json({ message, details: error.message });
            return;
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
});
exports.adminMiddleware = adminMiddleware;
/**
 * @description Middleware to authorize user with manager or higher role.
 */
const managerMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.session;
    if (!token) {
        res.status(401).json({
            message: 'Authentication required',
            details: 'Valid session cookie is required'
        });
        return;
    }
    try {
        const userData = yield (0, authUtils_1.getUserFromToken)(token);
        if (!userData) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        if (userData.role < constants_1.Role.MANAGER) {
            res.status(403).json({
                message: 'Access denied',
                details: 'This action requires manager privileges'
            });
            return;
        }
        req.user = userData;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            const message = error.message.includes('expired')
                ? 'Token has expired'
                : 'Invalid token';
            res.status(401).json({ message, details: error.message });
            return;
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
});
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
