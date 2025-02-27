"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
try{
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
        console.log("BaseURL tsconfig-paths: "+ __dirname);
        console.log("Original tsconfig-paths: "+ JSON.stringify(tsConfigPaths));
        console.log("Registered tsconfig-paths: "+ JSON.stringify(resolvedPaths));
    }
    else {
        require('module-alias/register');
    }
} catch(e) {
    console.log("Error occurred during startup:", e);
    console.log("Current working directory:", process.cwd());
    console.log("Environment variables:", process.env);
    console.log("Filename:", __filename);
    console.log("dirname:", __dirname);
    console.log("VERCEL:", process.env.VERCEL);
    console.log("require test: ", require("@routes/eventRoutes"));
    require('fs').readdirSync(__dirname).forEach(file => {
        console.log(file);
    });
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
