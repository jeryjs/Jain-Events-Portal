"use strict";
try{
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import 'module-alias/register';
require("dotenv/config");
require("module-alias/register");
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
app.listen(PORT, "0.0.0.0", () => console.log(`Api server running on port ${PORT}`));
} catch (e) {
    console.log(e);
}