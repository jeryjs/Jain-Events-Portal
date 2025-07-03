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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = exports.verifyToken = exports.generateToken = void 0;
const models_1 = require("@common/models");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const constants_1 = require("@common/constants");
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
 * Verifies a Firebase ID token and returns the decoded payload
 * @param {string} token - The Firebase ID token to verify
 * @returns {admin.auth.DecodedIdToken | null} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // First try to verify as a standard JWT
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        console.warn("JWT verification failed, falling back to Firebase ID token verification:", error);
    }
    try {
        return yield firebase_admin_1.default.auth().verifyIdToken(token);
    }
    catch (error) {
        console.error("Failed to verify Firebase ID token:", error);
        return null;
    }
});
exports.verifyToken = verifyToken;
/**
 * Extract UserData from a Firebase ID token
 * @param {string} token - The token to decode
 * @returns {Promise<UserData | null>} UserData object if verification succeeds, null otherwise
 */
const getUserFromToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const decoded = yield verifyToken(token);
        if (!decoded)
            return null;
        // Map Firebase token fields to UserData
        return models_1.UserData.parse({
            name: decoded.name || ((_a = decoded.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || '',
            username: decoded.email || '',
            role: decoded.role || constants_1.Role.USER, // You may want to set custom claims for role
            profilePic: decoded.picture || undefined,
        });
    }
    catch (error) {
        console.error("Failed to extract user from token:", error);
        return null;
    }
});
exports.getUserFromToken = getUserFromToken;
