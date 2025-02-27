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
const authUtils_1 = require("@utils/authUtils");
const auth_1 = require("@services/auth");
const router = express_1.default.Router();
// Route to authenticate user and generate jwt token
router.post('/authenticate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // TODO: implement proper function to authenticate user
        const userdata = {
            username,
            role: constants_1.Role.USER
        };
        if (yield (0, auth_1.authenticateUser)(username, password)) {
            const token = (0, authUtils_1.generateToken)(userdata, constants_1.Role.USER);
            res.json({ userData: userdata, token });
        }
        else {
            res.status(401).send('Invalid credentials');
        }
    }
    catch (e) {
        res.status(500).send(`Login failed: ${e.message}`);
    }
}));
exports.default = router;
