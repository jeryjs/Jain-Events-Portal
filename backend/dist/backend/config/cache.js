"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL = exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
// TTL in seconds
const TTL = {
    EVENTS: 300, // 5 mins
    ACTIVITIES: 60, // 1 min
    USER_DATA: 1800, // 30 mins
};
exports.TTL = TTL;
const cache = new node_cache_1.default({
    stdTTL: 60,
    checkperiod: 120,
});
exports.cache = cache;
