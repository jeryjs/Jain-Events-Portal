import jwt, { JwtPayload } from 'jsonwebtoken';

interface UserData {
  username: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

/**
 * Generates a JSON Web Token (JWT) for user authentication
 * @param {UserData} userData - The user data object containing the username
 * @param {string} role - The role of the user
 * @returns {string} A signed JWT containing the user information
 */
const generateToken = (userData: UserData, role: string): string => {
  return jwt.sign(
    { 
      username: userData.username,
      role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

/**
 * Verifies a JSON Web Token (JWT)
 * @param {string} token - The JWT token to verify
 * @returns {JwtPayload | null} Decoded token payload if verification succeeds, null if verification fails
 */
const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

export { generateToken, verifyToken };