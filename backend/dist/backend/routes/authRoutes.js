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
const express_1 = __importDefault(require("express"));
const authUtils_1 = require("@utils/authUtils");
const auth_1 = require("@middlewares/auth");
// import { authenticateUser } from "@services/auth";
const firebase_1 = require("@config/firebase");
const constants_1 = require("@common/constants");
const router = express_1.default.Router();
// Route to subscribe client to push notifications
router.post("/subscribe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, topic } = req.body;
    try {
        yield firebase_1.messaging.subscribeToTopic(token, topic);
        console.log(`🔔 Subscribed ${req.ip} to '${topic}' topic`);
        res.status(200).json({ message: `Subscribed ${req.ip} to '${topic}' topic successfully` });
    }
    catch (error) {
        console.error("🔔 Error subscribing to topic:", error);
        res.status(500).json({ message: `Error subscribing ${req.ip} to '${topic}' topic`, details: error });
    }
}));
// Route to send push notifications to all users
router.post("/sendNotificationToAll", auth_1.adminMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, message, imageUrl, link, showNotification } = req.body;
    try {
        yield (0, firebase_1.sendPushNotificationToAllUsers)(title, message, imageUrl, {
            link,
            showNotification
        });
        console.log(`🔔 Notification sent to all users: '${title}'`);
        res.status(200).json({ message: `Notification sent to all users successfully` });
    }
    catch (error) {
        console.error("🔔 Error sending notification:", error);
        res.status(500).json({ message: `Error sending notification to all users`, details: error });
    }
}));
// Route to establish a secure session (login)
router.post("/session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400).json({ message: "Missing idToken" });
            return;
        }
        // Verify Firebase ID token
        const decoded = yield (0, authUtils_1.verifyToken)(idToken);
        if (!decoded) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        // Determine role: check if email is in admin list
        // (Assume you have a function or config to get admin emails, e.g. getAdminEmails())
        const adminEmails = (process.env.ADMIN_EMAILS || "jery99961@gmail.com").split(",").map(e => e.trim().toLowerCase());
        const isAdmin = decoded.email && adminEmails.includes(decoded.email.toLowerCase());
        const user = {
            name: decoded.name || ((_a = decoded.email) === null || _a === void 0 ? void 0 : _a.split("@")[0]) || "User",
            username: decoded.email || decoded.uid,
            role: isAdmin ? constants_1.Role.ADMIN : constants_1.Role.USER,
            profilePic: decoded.picture || undefined
        };
        // Set secure, HTTP-only cookie
        res.cookie("session", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        });
        res.json({ user });
    }
    catch (error) {
        console.error("Session error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    return;
}));
exports.default = router;
