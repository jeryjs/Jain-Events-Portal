import type { NextFunction, Request, Response } from "express";

const recentRequests = new Map<string, number[]>();

const reset = "\x1b[0m";
const dim = "\x1b[90m";
const cyan = "\x1b[36m";
const blue = "\x1b[34m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red = "\x1b[31m";
const magenta = "\x1b[35m";

const nowLabel = () => new Date().toTimeString().slice(0, 8);

const paint = (color: string, value: string) => `${color}${value}${reset}`;

const statusLabel = (statusCode: number) => {
	if (statusCode >= 500)
		return paint(red, `[${statusCode}]`);

	if (statusCode >= 400)
		return paint(yellow, `[${statusCode}]`);

	if (statusCode >= 300)
		return paint(cyan, `[${statusCode}]`);

	return paint(green, `[${statusCode}]`);
};

const trim = (value: string, max = 120) => value.length > max ? `${value.slice(0, max - 1)}…` : value;

const payloadLabel = (body: unknown) => {
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

const requestStats = (ip: string, at: number) => {
	const timestamps = recentRequests.get(ip) ?? [];
	const window60s = at - 60_000;
	const window5s = at - 5_000;
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

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
	if (req.method === "OPTIONS")
		return next();

	const startedAt = Date.now();
	const ip = req.ip || req.socket.remoteAddress || "unknown";
	const route = req.originalUrl.split("?")[0] || req.url;
	const timestamps = recentRequests.get(ip) ?? [];
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
