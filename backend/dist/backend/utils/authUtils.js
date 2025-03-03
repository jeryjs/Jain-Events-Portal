"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {UserData} userData - The user data object containing the username
 * @param {string} role - The role of the user
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData, role) => {
    return jsonwebtoken_1.default.sign({
        username: userData.username,
        role,
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
