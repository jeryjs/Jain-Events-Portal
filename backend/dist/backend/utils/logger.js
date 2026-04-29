"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const recentRequests = new Map();
const reset = "\x1b[0m";
const dim = "\x1b[90m";
const cyan = "\x1b[36m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const magenta = "\x1b[35m";
const nowLabel = () => new Date().toTimeString().slice(0, 8);
const paint = (color, value) => `${color}${value}${reset}`;
const statusLabel = (statusCode) => {
    if (statusCode >= 500)
        return paint(red, `[${statusCode}]`);
    if (statusCode >= 400)
        return paint(yellow, `[${statusCode}]`);
    if (statusCode >= 300)
        return paint(cyan, `[${statusCode}]`);
    return paint(green, `[${statusCode}]`);
};
const trim = (value, max = 120) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
const payloadLabel = (body) => {
    if (body == null)
        return "-";
    if (typeof body === "string")
        return trim(body);
    if (typeof body === "object") {
        const text = JSON.stringify(body);
        return text && text !== "{}" ? trim(text) : "-";
    }
    return trim(String(body));
};
const requestStats = (ip, at) => {
    var _a;
    const timestamps = (_a = recentRequests.get(ip)) !== null && _a !== void 0 ? _a : [];
    const window60s = at - 60000;
    const window5s = at - 5000;
    const recent = timestamps.filter(timestamp => timestamp >= window60s);
    if (recent.length)
        recentRequests.set(ip, recent);
    else
        recentRequests.delete(ip);
    return {
        last5s: recent.filter(timestamp => timestamp >= window5s).length,
        last60s: recent.length,
    };
};
const requestLogger = (req, res, next) => {
    var _a;
    if (req.method === "OPTIONS")
        return next();
    const startedAt = Date.now();
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const route = req.originalUrl.split("?")[0] || req.url;
    const timestamps = (_a = recentRequests.get(ip)) !== null && _a !== void 0 ? _a : [];
    timestamps.push(startedAt);
    recentRequests.set(ip, timestamps);
    const { last5s, last60s } = requestStats(ip, startedAt);
    console.log(`${paint(dim, nowLabel())} ${paint(magenta, `[${ip} `)} ${paint(cyan, `${last5s} ${last60s}`)} ${paint(magenta, `]`)} ${paint(blue, `[${req.method}]`)} ${route} [${payloadLabel(req.body)}]`);
    res.on("prefinish", () => {
        const { last5s, last60s } = requestStats(ip, Date.now());
        const duration = Date.now() - startedAt;
        console.log(`${paint(dim, nowLabel())} ${paint(magenta, `[${ip} `)} ${paint(cyan, `${last5s} ${last60s}`)} ${paint(magenta, `]`)} ${paint(blue, `[${req.method}]`)} ${route} [${payloadLabel(req.body)}] ${statusLabel(res.statusCode)} ${paint(dim, `[${duration}ms]`)}`);
    });
    next();
};
exports.requestLogger = requestLogger;
