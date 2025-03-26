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
exports.sendPushNotificationToAllUsers = exports.messaging = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const messaging_1 = require("firebase-admin/messaging");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount),
});
exports.db = (0, firestore_1.getFirestore)();
exports.messaging = (0, messaging_1.getMessaging)();
exports.db.settings({ ignoreUndefinedProperties: true });
/**
 * Send push notification to all users
 */
const sendPushNotificationToAllUsers = (title, body, imageUrl, options) => __awaiter(void 0, void 0, void 0, function* () {
    const message = {
        notification: {
            title,
            body,
            imageUrl,
        },
        data: {
            // Add data for handling in the service worker
            saveToDatabase: (options === null || options === void 0 ? void 0 : options.saveToDatabase) ? 'true' : 'false',
            clickAction: (options === null || options === void 0 ? void 0 : options.clickAction) || '/',
            timestamp: Date.now().toString(),
            // Add any other metadata needed
        },
        topic: 'all-users', // You can use a topic to send to all users
    };
    try {
        yield exports.messaging.send(message);
        console.log('Push notification sent successfully');
    }
    catch (error) {
        console.error('Error sending push notification:', error);
    }
});
exports.sendPushNotificationToAllUsers = sendPushNotificationToAllUsers;
exports.default = exports.db;
