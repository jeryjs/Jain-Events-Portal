// import 'module-alias/register';
import 'dotenv/config';
import 'module-alias/register';
import express, { Request, Response } from 'express';
import cors from 'cors';

import eventRoutes from '@routes/eventRoutes';
import activityRoutes from '@routes/activityRoutes';
import userRoutes from '@routes/userRoutes';
import adminRoutes from '@routes/adminRoutes';

const app = express();

app.use(cors<Request>());
app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
    res.send("API Server is running successfully!!");
});

app.use("/api", eventRoutes);
app.use("/api", activityRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

const PORT = (process.env.PORT || 3000) as number;
app.listen(PORT, "0.0.0.0", () => console.log(`Api server running on port ${PORT}`));