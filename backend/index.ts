// import 'module-alias/register';
import 'dotenv/config';
import express, { Request, Response } from 'express';
// import cors from 'cors';

import eventRoutes from './routes/eventRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// app.use(cors());
app.use(express.json());

app.get("/api", (req: Request, res: Response) => {
    res.send("API Server is running successfully!!");
});

app.use("/api", eventRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Api server running on port ${PORT}`));