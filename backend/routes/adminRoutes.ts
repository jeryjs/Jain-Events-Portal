import express, { Request, Response } from 'express';
import { ROLE } from '@common/constants';
import { generateToken } from '../utils/authUtils';

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
            role: ROLE.ADMIN
        };

        if (password === 'test') {
            const token = generateToken(userdata, ROLE.ADMIN);
            res.json({ userData: userdata, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send(`Login failed: ${e.message}`);
    }
});

export default router;