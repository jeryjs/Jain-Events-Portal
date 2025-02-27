"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Workaround for module-alias in vercel deployment.
if (process.env.VERCEL == "1" || __filename.endsWith(".js")) {
    const tsConfig = require("../../tsconfig.json");
    // Manually append dirname to path aliases to turn them into absolute paths
    const resolvedPaths = Object.entries(tsConfig.compilerOptions.paths).reduce((acc, [key, paths]) => {
        acc[key] = paths.map((path) => (path.startsWith("./") || path.startsWith("../") ? __dirname + "/" + path : path));
        return acc;
    }, {});
    require("tsconfig-paths").register({ baseUrl: ".", paths: resolvedPaths });
}
else {
    require("module-alias/register");
}
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const eventRoutes_1 = __importDefault(require("@routes/eventRoutes"));
const activityRoutes_1 = __importDefault(require("@routes/activityRoutes"));
const userRoutes_1 = __importDefault(require("@routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("@routes/adminRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/api", (req, res) => {
    res.send("API Server is running successfully!!");
});
app.use("/api", eventRoutes_1.default);
app.use("/api", activityRoutes_1.default);
app.use("/api/user", userRoutes_1.default);
app.use("/api/admin", adminRoutes_1.default);
const PORT = (process.env.PORT || 3000);
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
