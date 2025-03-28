"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = exports.verifyToken = exports.generateToken = void 0;
const models_1 = require("@common/models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable not set.");
}
/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {UserData} userData - The user data to encode in the token
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData) => {
    return jsonwebtoken_1.default.sign(userData.toJSON(), JWT_SECRET);
};
exports.generateToken = generateToken;
/**
 * Verifies a token which might be a regular JWT or a base64-encoded JSON string
 * @param {string} token - The token to verify
 * @returns {JwtPayload | null} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = (token) => {
    try {
        // First try to verify as a standard JWT
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        // If the token isn't a valid JWT, try treating it as a base64-encoded JSON string (for Firebase integration)
        try {
            const decodedString = atob(token);
            return JSON.parse(decodedString);
        }
        catch (parseError) {
            console.error("Failed to parse token:", parseError);
            return null;
        }
    }
};
exports.verifyToken = verifyToken;
/**
 * Extract UserData from a token
 * @param {string} token - The token to decode
 * @returns {UserData | null} UserData object if verification succeeds, null otherwise
 */
const getUserFromToken = (token) => {
    try {
        // Get decoded payload
        const decoded = verifyToken(token);
        if (!decoded)
            return null;
        // Parse the decoded token into a UserData object
        return models_1.UserData.parse(decoded);
    }
    catch (error) {
        console.error("Failed to extract user from token:", error);
        return null;
    }
};
exports.getUserFromToken = getUserFromToken;
