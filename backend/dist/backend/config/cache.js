"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TTL = exports.cache = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
// TTL in seconds
const TTL = {
    EVENTS: 1800, // 30 mins
    ACTIVITIES: 600, // 10 min
    ARTICLES: 5400, // 90 mins
    USER_DATA: 3600, // 60 mins
};
exports.TTL = TTL;
const cache = new node_cache_1.default({
    stdTTL: 120,
    checkperiod: 240,
});
exports.cache = cache;
