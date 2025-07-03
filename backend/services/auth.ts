import { Role } from "@common/constants";
import { UserData } from "@common/models";
import db from "@config/firebase";
import { getUserFromToken } from "@utils/authUtils";

// collection reference
const usersCollection = db.collection("users");

/**
 * Get user by Firebase UID (from decoded token)
 */
export async function getUserByUID(uid: string): Promise<UserData | null> {
	const userDoc = await usersCollection.doc(uid).get();
	if (!userDoc.exists) return null;
	const userData = UserData.parse(userDoc.data());
	// Default admin logic
	if (userData.username === 'jery99961@gmail.com' && userData.role < Role.ADMIN) {
		userData.role = Role.ADMIN;
	}
	return userData;
}

/**
 * Verify that user has proper authorization
 * @param username - Username to check
 * @param requiredRole - Role required for access
 * @returns True if user has required role, false otherwise
 */
export async function verifyUserRole(uid: string, requiredRole: Role): Promise<boolean> {
	const user = await getUserByUID(uid);
	if (!user) return false;
	return user.role >= requiredRole;
}

/**
 * Get user by username
 * @param username - Username to look up
 * @returns UserData object if found, null otherwise
 */
// Deprecated: Use getUserByUID instead
export async function getUserByUsername(username: string): Promise<UserData | null> {
	// Optionally implement if you want to support lookup by email
	const snapshot = await usersCollection.where('username', '==', username).limit(1).get();
	if (snapshot.empty) return null;
	return UserData.parse(snapshot.docs[0].data());
}
