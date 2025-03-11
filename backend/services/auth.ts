import { Role } from "@common/constants";
import { UserData } from "@common/models";
import db from "@config/firebase";
import { generateToken } from "@utils/authUtils";

// collection reference
const usersCollection = db.collection("users");

/**
 * Authenticate a user with username and password
 * @param username - The username to authenticate
 * @param password - The password to check
 * @returns A promise that resolves to an object containing user data and auth token if authenticated, null otherwise
 */
export async function authenticateUser(username: string, password: string): Promise<{ userData: UserData; token: string } | null> {
	// Find user in our "database"
	const userDoc = await usersCollection.doc(username).get();
	const user = userDoc.exists ? userDoc.data() : null;

	// User not found
	if (!user) { return null }

    // Check if incorrect password
    if (user.password !== password) { return null }

    // Create user data object from our model
    const userData = UserData.parse({...user, role: user.role});

	// Generate JWT token with user data
	const token = generateToken(userData);

	return { userData, token };
}

/**
 * Verify that user has proper authorization
 * @param username - Username to check
 * @param requiredRole - Role required for access
 * @returns True if user has required role, false otherwise
 */
export async function verifyUserRole(username: string, requiredRole: Role): Promise<boolean> {
	const user = await getUserByUsername(username);

	if (!user) {
		return false;
	}

	// Check if user's role meets the required role
	return user.role === requiredRole;
}

/**
 * Get user by username
 * @param username - Username to look up
 * @returns UserData object if found, null otherwise
 */
export async function getUserByUsername(username: string): Promise<UserData | null> {
	const user = (await usersCollection.doc(username).get()).data();

	if (!user) {
		return null;
	}

	return UserData.parse(user);
}
