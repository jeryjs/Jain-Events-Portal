"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    catch (_a) { }
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
 * Extract UserData from a Firebase ID token and optionally fetch from database
 * @param {string} token - The token to decode
 * @param {boolean} fetchFromDb - Whether to fetch complete user data from database
 * @returns {Promise<UserData | null>} UserData object if verification succeeds, null otherwise
 */
const getUserFromToken = (token_1, ...args_1) => __awaiter(void 0, [token_1, ...args_1], void 0, function* (token, fetchFromDb = false) {
    var _a;
    try {
        const decoded = yield verifyToken(token);
        if (!decoded)
            return null;
        // If we need complete user data, fetch from database using the UID
        if (fetchFromDb && 'uid' in decoded) {
            const { getUserByUID } = yield Promise.resolve().then(() => __importStar(require('@services/auth')));
            const dbUser = yield getUserByUID(decoded.uid);
            if (dbUser)
                return dbUser;
        }
        return models_1.UserData.parse({
            name: decoded.name || ((_a = decoded.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || '',
            username: decoded.email || '',
            role: decoded.role || constants_1.Role.USER,
            profilePic: decoded.picture || undefined,
        });
    }
    catch (error) {
        console.error("Failed to extract user from token:", error);
        return null;
    }
});
exports.getUserFromToken = getUserFromToken;
