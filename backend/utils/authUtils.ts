import { UserData } from "@common/models";
import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
	throw new Error("JWT_SECRET environment variable not set.");
}

/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {string} username - The username of the user
 * @param {string} role - The role of the user
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData: UserData): string => {
	return jwt.sign(
		{
			username: userData.username,
			role: userData.role,
		},
		JWT_SECRET
	);
};

/**
 * Verifies a JSON Web Token (JWT)
 * @param {string} token - The JWT token to verify
 * @returns {JwtPayload | null} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = (token: string): JwtPayload | null => {
	return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

/**
 * Extract user information from a JWT token
 */
const getUserFromToken = (token: string) => {
	// Verify and decode the token
	const decoded = jwt.verify(token, JWT_SECRET) as {
		username: string;
		role: string;
	};

	if (!decoded) return null;

	return {
		username: decoded.username,
		role: decoded.role,
	};
};

export { generateToken, verifyToken, getUserFromToken };
