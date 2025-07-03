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
exports.getUserByUID = getUserByUID;
exports.verifyUserRole = verifyUserRole;
exports.getUserByUsername = getUserByUsername;
const constants_1 = require("@common/constants");
const models_1 = require("@common/models");
const firebase_1 = __importDefault(require("@config/firebase"));
// collection reference
const usersCollection = firebase_1.default.collection("users");
/**
 * Get user by Firebase UID (from decoded token)
 */
function getUserByUID(uid) {
    return __awaiter(this, void 0, void 0, function* () {
        const userDoc = yield usersCollection.doc(uid).get();
        if (!userDoc.exists)
            return null;
        const userData = models_1.UserData.parse(userDoc.data());
        // Default admin logic
        if (userData.username === 'jery99961@gmail.com' && userData.role < constants_1.Role.ADMIN) {
            userData.role = constants_1.Role.ADMIN;
        }
        return userData;
    });
}
/**
 * Verify that user has proper authorization
 * @param username - Username to check
 * @param requiredRole - Role required for access
 * @returns True if user has required role, false otherwise
 */
function verifyUserRole(uid, requiredRole) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield getUserByUID(uid);
        if (!user)
            return false;
        return user.role >= requiredRole;
    });
}
/**
 * Get user by username
 * @param username - Username to look up
 * @returns UserData object if found, null otherwise
 */
// Deprecated: Use getUserByUID instead
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        // Optionally implement if you want to support lookup by email
        const snapshot = yield usersCollection.where('username', '==', username).limit(1).get();
        if (snapshot.empty)
            return null;
        return models_1.UserData.parse(snapshot.docs[0].data());
    });
}
