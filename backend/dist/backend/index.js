"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Workaround for module-alias in vercel deployment.
if (process.env.VERCEL == '1' || __filename.endsWith('.js')) {
    console.log("Registering tsconfig-paths");
    // Workaround for tsconfig-paths in vercel deployment.
    const tsConfigPaths = require("../../tsconfig.json").compilerOptions.paths;
    const resolvedPaths = {};
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
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const eventRoutes_1 = __importDefault(require("@routes/eventRoutes"));
const activityRoutes_1 = __importDefault(require("@routes/activityRoutes"));
const articleRoutes_1 = __importDefault(require("@routes/articleRoutes"));
const authRoutes_1 = __importDefault(require("@routes/authRoutes"));
const os = require("os");
const app = (0, express_1.default)();
// Middlewares to use only in production
if (process.env.NODE_ENV !== "development") {
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
}
app.use(express_1.default.json());
app.get("/api", (req, res) => {
    res.send("API Server is running successfully!!");
});
app.use("/api/events", eventRoutes_1.default);
app.use("/api/activities", activityRoutes_1.default);
app.use("/api/articles", articleRoutes_1.default);
app.use("/api/user", authRoutes_1.default);
const PORT = (process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => {
    const serverUrl = `http://localhost:${PORT}`;
    console.log(`✅ API server running successfully!`);
    console.log(`📡 Listening on port ${PORT} (${serverUrl})`);
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
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
