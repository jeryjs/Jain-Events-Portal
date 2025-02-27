"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
(0, app_1.initializeApp)({
    credential: (0, app_1.cert)(serviceAccount),
});
const db = (0, firestore_1.getFirestore)();
db.settings({ ignoreUndefinedProperties: true });
exports.default = db;
