import express, { Request, Response } from "express";
import { adminMiddleware } from "@middlewares/auth";
import { authenticateUser } from "@services/auth";
import { messaging, sendPushNotificationToAllUsers } from "@config/firebase";
import { Role } from "@common/constants";

const router = express.Router();

interface AuthRequest extends Request {
	body: {
		username: string;
		password: string;
	};
}

// Route to subscribe client to push notifications
router.post("/subscribe", async (req: Request, res: Response) => {
	const { token, topic } = req.body;

	try {
		await messaging.subscribeToTopic(token, topic);
		console.log(`🔔 Subscribed ${req.ip} to '${topic}' topic`);
		res.status(200).json({ message: `Subscribed ${req.ip} to '${topic}' topic successfully` });
	} catch (error) {
		console.error("🔔 Error subscribing to topic:", error);
		res.status(500).json({ message: `Error subscribing ${req.ip} to '${topic}' topic`, details: error });
	}
});

// Route to send push notifications to all users
router.post("/sendNotificationToAll", adminMiddleware, async (req: Request, res: Response) => {
    const { title, message, imageUrl, link, showNotification } = req.body;

    try {
        await sendPushNotificationToAllUsers(title, message, imageUrl, {
            link,
            showNotification
        });
        console.log(`🔔 Notification sent to all users: '${title}'`);
        res.status(200).json({ message: `Notification sent to all users successfully` });
    } catch (error) {
        console.error("🔔 Error sending notification:", error);
        res.status(500).json({ message: `Error sending notification to all users`, details: error });
    }
});

// Route to authenticate any user (admin, manager, or regular user)
router.post("/authenticate", async (req: AuthRequest, res: Response) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			res.status(400).send("Username and password are required");
			return;
		}

		const authResult = await authenticateUser(username, password);

		if (authResult) {
			const { userData, token } = authResult;
			res.json({ userData, token });
		} else {
			res.status(401).send("Invalid credentials");
		}
	} catch (e) {
		res.status(500).send(`Authentication failed: ${(e as Error).message}`);
	}
});

// Admin-specific authentication route
router.post("/admin/authenticate", async (req: AuthRequest, res: Response) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			res.status(400).send("Username and password are required");
			return;
		}

		const authResult = await authenticateUser(username, password);

		if (authResult) {
			// Check if the user has admin role
			if (authResult.userData.role !== Role.ADMIN) {
				res.status(403).send("Access denied: Admin privileges required");
				return;
			}

			const { userData, token } = authResult;
			res.json({ userData, token });
		} else {
			res.status(401).send("Invalid credentials");
		}
	} catch (e) {
		res.status(500).send(`Authentication failed: ${(e as Error).message}`);
	}
});

export default router;
