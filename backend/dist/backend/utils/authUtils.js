"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable not set.');
}
/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {string} username - The username of the user
 * @param {string} role - The role of the user
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData) => {
    return jsonwebtoken_1.default.sign({
        username: userData.username,
        role: userData.role,
    }, JWT_SECRET, { expiresIn: '24h' });
};
exports.generateToken = generateToken;
/**
 * Verifies a JSON Web Token (JWT)
 * @param {string} token - The JWT token to verify
 * @returns {JwtPayload | null} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
/**
 * Extract user information from a JWT token
 */
const getUserFromToken = (token) => {
    try {
        // Verify and decode the token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!decoded)
            return null;
        return {
            username: decoded.username,
            role: decoded.role
        };
    }
    catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};
exports.getUserFromToken = getUserFromToken;
