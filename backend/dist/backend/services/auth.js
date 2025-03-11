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
exports.authenticateUser = authenticateUser;
exports.verifyUserRole = verifyUserRole;
exports.getUserByUsername = getUserByUsername;
const models_1 = require("@common/models");
const firebase_1 = __importDefault(require("@config/firebase"));
const authUtils_1 = require("@utils/authUtils");
// collection reference
const usersCollection = firebase_1.default.collection("users");
/**
 * Authenticate a user with username and password
 * @param username - The username to authenticate
 * @param password - The password to check
 * @returns A promise that resolves to an object containing user data and auth token if authenticated, null otherwise
 */
function authenticateUser(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        // Find user in our "database"
        const userDoc = yield usersCollection.doc(username).get();
        const user = userDoc.exists ? userDoc.data() : null;
        // User not found
        if (!user) {
            return null;
        }
        // Check if incorrect password
        if (user.password !== password) {
            return null;
        }
        // Create user data object from our model
        const userData = models_1.UserData.parse(Object.assign(Object.assign({}, user), { role: user.role }));
        // Generate JWT token with user data
        const token = (0, authUtils_1.generateToken)(userData);
        return { userData, token };
    });
}
/**
 * Verify that user has proper authorization
 * @param username - Username to check
 * @param requiredRole - Role required for access
 * @returns True if user has required role, false otherwise
 */
function verifyUserRole(username, requiredRole) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield getUserByUsername(username);
        if (!user) {
            return false;
        }
        // Check if user's role meets the required role
        return user.role === requiredRole;
    });
}
/**
 * Get user by username
 * @param username - Username to look up
 * @returns UserData object if found, null otherwise
 */
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = (yield usersCollection.doc(username).get()).data();
        if (!user) {
            return null;
        }
        return models_1.UserData.parse(user);
    });
}
