import { getAuth } from 'firebase/auth';
import { app } from '../firebaseConfig';

const auth = getAuth(app);

/**
 * Utility to ensure Firebase token is fresh before making API calls
 */
export class TokenManager {
  private static lastRefresh = 0;
  private static readonly REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

  /**
   * Ensures the Firebase token is fresh (refreshes if older than 30 minutes)
   * This prevents token expiration during critical operations
   */
  static async ensureFreshToken(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    const now = Date.now();
    const timeSinceRefresh = now - this.lastRefresh;

    // If token was refreshed less than 30 minutes ago, skip refresh
    if (timeSinceRefresh < this.REFRESH_INTERVAL) {
      return;
    }

    try {
      // Force refresh the Firebase ID token
      await auth.currentUser.getIdToken(true);
      this.lastRefresh = now;
      console.log('🔄 Token refreshed preemptively');
    } catch (error) {
      console.error('❌ Preemptive token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Force refresh token immediately (for error recovery)
   */
  static async forceRefresh(): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      await auth.currentUser.getIdToken(true);
      this.lastRefresh = Date.now();
      console.log('🔄 Token force refreshed');
    } catch (error) {
      console.error('❌ Force token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Check if token needs refresh (used by automatic refresh)
   */
  static needsRefresh(): boolean {
    const now = Date.now();
    const timeSinceRefresh = now - this.lastRefresh;
    return timeSinceRefresh >= this.REFRESH_INTERVAL;
  }
}
