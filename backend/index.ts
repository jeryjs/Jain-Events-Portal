// Workaround for module-alias in vercel deployment.
if (process.env.VERCEL == "1" || __filename.endsWith(".js")) {
	const tsConfig = require("../../tsconfig.json");
    // Manually append dirname to path aliases to turn them into absolute paths
	const resolvedPaths = Object.entries(tsConfig.compilerOptions.paths).reduce<Record<string, string[]>>((acc, [key, paths]) => {
		acc[key] = (paths as string[]).map((path: string) => (path.startsWith("./") || path.startsWith("../") ? __dirname + "/" + path : path));
		return acc;
	}, {});

	require("tsconfig-paths").register({ baseUrl: ".", paths: resolvedPaths });
} else {
	require("module-alias/register");
}

import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from 'helmet';

import eventRoutes from "@routes/eventRoutes";
import activityRoutes from "@routes/activityRoutes";
import articleRoutes from "@routes/articleRoutes";
import authRoutes from "@routes/authRoutes";

const app = express();

// Middlewares to use only in production
if (process.env.NODE_ENV !== 'development') {
    app.use(cors<Request>());
    app.use(helmet());
}

app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
	res.send("API Server is running successfully!!");
});

app.use("/api", eventRoutes);
app.use("/api", activityRoutes);
app.use("/api", articleRoutes);
app.use("/api/auth", authRoutes);

const PORT = (process.env.PORT || 3000) as number;
app.listen(PORT, "0.0.0.0", () => {
    const serverUrl = `http://localhost:${PORT}`;
    console.log(`✅ API server running successfully!`);
    console.log(`📡 Listening on port ${PORT} (${serverUrl})`);
    console.log(`🚀 API endpoints available at ${serverUrl}/api`);
    console.log(`📚 Routes loaded: events, activities, user, admin`);
    console.log(`💻 Environment: ${process.env.NODE_ENV || 'development'}`);
}).on('error', (err) => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
});
