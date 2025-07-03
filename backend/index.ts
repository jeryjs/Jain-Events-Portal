// Workaround for module-alias in vercel deployment.
try {
	// Workaround for module-alias in vercel deployment.
	if (process.env.VERCEL == '1' || __filename.endsWith('.js')) {
		console.log("Registering tsconfig-paths");
		console.log("CURRENT ENVIRONMENT: ", process.env.VERCEL_ENV || process.env.NODE_ENV);
		
		// Workaround for tsconfig-paths in vercel deployment.
		const tsConfigPaths = require("../../tsconfig.json").compilerOptions.paths as { [key: string]: string[] };
		const resolvedPaths: typeof tsConfigPaths = {};
		for (const key in tsConfigPaths) {
			resolvedPaths[key] = tsConfigPaths[key].map(path => {
				// Prepend __dirname only if the path is relative
				if (path.startsWith("./") || path.startsWith("../"))
					return __dirname + "/" + path;
				return path; // Keep absolute paths as is
			});
		}
		require('tsconfig-paths').register({
			baseUrl: '.',
			paths: resolvedPaths
		});
		console.log("BaseURL tsconfig-paths: " + __dirname);
		console.log("Original tsconfig-paths: " + JSON.stringify(tsConfigPaths));
		console.log("Registered tsconfig-paths: " + JSON.stringify(resolvedPaths));
	}
	else {
		require('module-alias/register');
	}
}
catch (e) {
	console.log("Error occurred during startup:", e);
	console.log("Current working directory:", process.cwd());
	console.log("Environment variables:", process.env);
	console.log("Filename:", __filename);
	console.log("dirname:", __dirname);
	console.log("VERCEL:", process.env.VERCEL);
	console.log("require test: ", require("@routes/eventRoutes"));
	require('fs').readdirSync(__dirname).forEach((file: any) => {
		console.log(file);
	});
}
import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import eventRoutes from "@routes/eventRoutes";
import activityRoutes from "@routes/activityRoutes";
import articleRoutes from "@routes/articleRoutes";
import authRoutes from "@routes/authRoutes";

const os = require("os");
const app = express();

// Configure CORS to handle credentials
app.use(cors<Request>({
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		// Allow localhost on any port for development
		if (origin.match(/^http:\/\/localhost:\d+$/))
			return callback(null, true);

		// Allow vercel preview deployments
		if (origin.match(/^https:\/\/jain-events-portal-[a-z0-9]+\.vercel\.app$/))
			return callback(null, true);
		
		const allowedOrigins = [
			'http://localhost:3000',
			'http://localhost:5780',
			'http://localhost:5781',
			'https://jain-fet-hub.web.app',
			'https://jain-fet-hub.vercel.app'
		];
		if (allowedOrigins.includes(origin))
			return callback(null, true);
		
		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

// Middlewares to use only in production
if (process.env.NODE_ENV !== "development") {
	app.use(helmet());
}

app.use(express.json());
app.use(cookieParser());

app.get("/api", (req: Request, res: Response) => {
	res.send("API Server is running successfully!!");
});

app.use("/api/events", eventRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/user", authRoutes);

const PORT = (process.env.PORT || 3000) as number;
app.listen(PORT, "0.0.0.0", () => {
    const serverUrl = `http://localhost:${PORT}`;
    console.log(`✅ API server running successfully!`);
    console.log(`📡 Listening on port ${PORT} (${serverUrl})`);
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]!) {
            if (net.family === "IPv4" && !net.internal) {
                console.log(`🖧 Accessible on ${name}: http://${net.address}:${PORT}`);
            }
        }
    }
    console.log(`💻 Environment: ${process.env.NODE_ENV || "development"}`);
})
.on("error", (err) => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
});
