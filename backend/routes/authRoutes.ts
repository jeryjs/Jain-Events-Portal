import express, { Request, Response } from 'express';
import { Role } from '@common/constants';
import { authenticateUser } from '@services/auth';


const router = express.Router();

interface AuthRequest extends Request {
    body: {
        username: string;
        password: string;
    };
}

// Route to authenticate any user (admin, manager, or regular user)
router.post('/authenticate', async (req: AuthRequest, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send('Username and password are required');
            return;
        }

        const authResult = await authenticateUser(username, password);

        if (authResult) {
            const { userData, token } = authResult;
            res.json({ userData, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send(`Authentication failed: ${(e as Error).message}`);
    }
});

// Admin-specific authentication route
router.post('/admin/authenticate', async (req: AuthRequest, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send('Username and password are required');
            return;
        }

        const authResult = await authenticateUser(username, password);

        if (authResult) {
            // Check if the user has admin role
            if (authResult.userData.role !== Role.ADMIN) {
                res.status(403).send('Access denied: Admin privileges required');
                return;
            }
            
            const { userData, token } = authResult;
            res.json({ userData, token });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (e) {
        res.status(500).send(`Authentication failed: ${(e as Error).message}`);
    }
});

export default router;