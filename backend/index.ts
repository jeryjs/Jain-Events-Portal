// Workaround for module-alias in vercel deployment.
try {
	if (process.env.VERCEL == "1" || __filename.endsWith(".js")) {
		// Workaround for tsconfig-paths in vercel deployment.
		const tsConfigPaths = require("../../tsconfig.json").compilerOptions.paths;
		const resolvedPaths: Record<string, string[]> = {};
		for (const key in tsConfigPaths) {
			resolvedPaths[key] = tsConfigPaths[key].map((path: string) => {
				// Prepend __dirname only if the path is relative
				if (path.startsWith("./") || path.startsWith("../")) return __dirname + "/" + path;
				return path; // Keep absolute paths as is
			});
		}
		require("tsconfig-paths").register({
			baseUrl: ".",
			paths: resolvedPaths,
		});
	} else {
		require("module-alias/register");
	}
} catch (e) {
	console.error("Error in module-alias workaround:", e);
}

import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import eventRoutes from "@routes/eventRoutes";
import activityRoutes from "@routes/activityRoutes";
import articleRoutes from "@routes/articleRoutes";
import authRoutes from "@routes/authRoutes";
import { messaging } from "@config/firebase";

const os = require("os");
const app = express();

// Middlewares to use only in production
if (process.env.NODE_ENV !== "development") {
	app.use(cors<Request>());
	app.use(helmet());
}

app.use(express.json());

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
