import express, { Request, Response } from 'express';
import { Role } from '../../common/constants';
import { generateToken } from '../utils/authUtils';
import { authenticateUser } from '../services/auth';

const router = express.Router();

interface AuthRequest extends Request {
    body: {
        username: string;
        password: string;
    };
}

// Route to authenticate admin and generate jwt token
router.post('/authenticate', async (req: AuthRequest, res: Response) => {
    try {
        const { username, password } = req.body;

        // TODO: implement proper function to authenticate user
        const userdata = {
            username,
            role: Role.ADMIN
        };

        const isAuthenticated = await authenticateUser(username, password);

        if (isAuthenticated) {
            const token = generateToken(userdata, Role.ADMIN);
            res.json({ userData: userdata, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send(`Login failed: ${(e as Error).message}`);
    }
});

export default router;