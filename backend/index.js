require('module-alias/register')
require("dotenv").config();

const express = require('express');
const cors = require("cors");
const { adminMiddleware } = require('./middleware/auth');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
    res.send("API Server is running successfully!!");
});

app.use("/api/user", userRoutes);
app.use("/api/admin", adminMiddleware, adminRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Api server running on port ${PORT}`));