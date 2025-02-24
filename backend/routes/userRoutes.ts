import express, { Request, Response } from 'express';
import { ROLE } from '@common/constants';
import { generateToken } from '../utils/authUtils';

const router = express.Router();

interface UserData {
    username: string;
    role: string;
}

// Route to authenticate user and generate jwt token
router.post('/authenticate', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // TODO: implement proper function to authenticate user
        const userdata: UserData = {
            username,
            role: ROLE.USER
        };

        if (password === 'test') {
            const token = generateToken(userdata, ROLE.USER);
            res.json({ userData: userdata, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send(`Login failed: ${e.message}`);
    }
});

export default router;