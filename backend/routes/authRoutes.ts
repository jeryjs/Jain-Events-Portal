import express, { Request, Response } from "express";
import { getUserFromToken, verifyToken } from "@utils/authUtils";
import { getUserByUID } from "@services/auth";
import { adminMiddleware } from "@middlewares/auth";
// import { authenticateUser } from "@services/auth";
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


// Route to establish a secure session (login)
router.post("/session", async (req: Request, res: Response) => {
	try {
		const { idToken } = req.body;
		if (!idToken) {
			res.status(400).json({ message: "Missing idToken" });
			return;
		}

		// Verify Firebase ID token
		const decoded = await verifyToken(idToken);
		if (!decoded) {
			res.status(401).json({ message: "Invalid token" });
			return;
		}

		// Get complete user data from database or create minimal user data
		let user;
		if ('uid' in decoded) {
			user = await getUserByUID(decoded.uid);
		}
		
		// Fallback to token data if no database record
		if (!user) {
			const adminEmails = (process.env.ADMIN_EMAILS || "jery99961@gmail.com").split(",").map(e => e.trim().toLowerCase());
			const isAdmin = decoded.email && adminEmails.includes(decoded.email.toLowerCase());
			user = {
				name: decoded.name || decoded.email?.split("@")[0] || "User",
				username: decoded.email || decoded.uid,
				role: isAdmin ? Role.ADMIN : Role.USER,
				profilePic: decoded.picture || undefined
			};
		}

		// Set secure, HTTP-only cookie
		res.cookie("session", idToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
		});

		res.json({ user });
	} catch (error) {
		console.error("Session error:", error);
		res.status(500).json({ message: "Internal server error" });
	}
	return;
});

export default router;
