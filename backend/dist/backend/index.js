"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Workaround for module-alias in vercel deployment.
try {
    // Workaround for module-alias in vercel deployment.
    if (process.env.VERCEL == '1' || __filename.endsWith('.js')) {
        console.log("Registering tsconfig-paths");
        console.log("CURRENT ENVIRONMENT: ", process.env.VERCEL_ENV || process.env.NODE_ENV);
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
}
catch (e) {
    console.log("Error occurred during startup:", e);
    console.log("Current working directory:", process.cwd());
    console.log("Environment variables:", process.env);
    console.log("Filename:", __filename);
    console.log("dirname:", __dirname);
    console.log("VERCEL:", process.env.VERCEL);
    console.log("require test: ", require("@routes/eventRoutes"));
    require('fs').readdirSync(__dirname).forEach((file) => {
        console.log(file);
    });
}
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const eventRoutes_1 = __importDefault(require("@routes/eventRoutes"));
const activityRoutes_1 = __importDefault(require("@routes/activityRoutes"));
const articleRoutes_1 = __importDefault(require("@routes/articleRoutes"));
const authRoutes_1 = __importDefault(require("@routes/authRoutes"));
const os = require("os");
const app = (0, express_1.default)();
// Configure CORS to handle credentials
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
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
    app.use((0, helmet_1.default)());
}
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
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
