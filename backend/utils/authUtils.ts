import { UserData } from "@common/models";
import jwt, { JwtPayload } from "jsonwebtoken";
import admin from "firebase-admin";
import { Role } from "@common/constants";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable not set.");
}

/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {UserData} userData - The user data to encode in the token
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData: UserData): string => {
	return jwt.sign(userData.toJSON(), JWT_SECRET);
};


/**
 * Verifies a Firebase ID token and returns the decoded payload
 * @param {string} token - The Firebase ID token to verify
 * @returns {admin.auth.DecodedIdToken | null} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = async (token: string): Promise<admin.auth.DecodedIdToken | JwtPayload | null> => {
	try {
		// First try to verify as a standard JWT
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch { }
	try {
		return await admin.auth().verifyIdToken(token);
	} catch (error) {
		console.error("Failed to verify Firebase ID token:", error);
		return null;
	}
};

/**
 * Extract UserData from a Firebase ID token
 * @param {string} token - The token to decode
 * @returns {Promise<UserData | null>} UserData object if verification succeeds, null otherwise
 */
const getUserFromToken = async (token: string): Promise<UserData | null> => {
	try {
		const decoded = await verifyToken(token);
		if (!decoded) return null;
		// Map Firebase token fields to UserData
		return UserData.parse({
			name: decoded.name || decoded.email?.split('@')[0] || '',
			username: decoded.email || '',
			role: decoded.role || Role.USER, // You may want to set custom claims for role
			profilePic: decoded.picture || undefined,
		});
	} catch (error) {
		console.error("Failed to extract user from token:", error);
		return null;
	}
};

export { generateToken, verifyToken, getUserFromToken };
