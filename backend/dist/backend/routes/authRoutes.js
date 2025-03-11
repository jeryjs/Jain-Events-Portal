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
const constants_1 = require("@common/constants");
const auth_1 = require("@services/auth");
const router = express_1.default.Router();
// Route to authenticate any user (admin, manager, or regular user)
router.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).send('Username and password are required');
            return;
        }
        const authResult = yield (0, auth_1.authenticateUser)(username, password);
        if (authResult) {
            const { userData, token } = authResult;
            res.json({ userData, token });
        }
        else {
            res.status(401).send('Invalid credentials');
        }
    }
    catch (e) {
        res.status(500).send(`Authentication failed: ${e.message}`);
    }
}));
// Admin-specific authentication route
router.post('/admin/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).send('Username and password are required');
            return;
        }
        const authResult = yield (0, auth_1.authenticateUser)(username, password);
        if (authResult) {
            // Check if the user has admin role
            if (authResult.userData.role !== constants_1.Role.ADMIN) {
                res.status(403).send('Access denied: Admin privileges required');
                return;
            }
            const { userData, token } = authResult;
            res.json({ userData, token });
        }
        else {
            res.status(401).send('Invalid credentials');
        }
    }
    catch (e) {
        res.status(500).send(`Authentication failed: ${e.message}`);
    }
}));
exports.default = router;
