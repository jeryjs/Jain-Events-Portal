import { Role } from '@common/constants';
import { UserData } from '@common/models';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import LogoutIcon from '@mui/icons-material/Logout';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useTheme
} from '@mui/material';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User
} from 'firebase/auth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { app } from '../../firebaseConfig';

// Initialize Firebase auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Context type definition
interface LoginContextType {
  userData: UserData | null;
  username: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  openLoginPrompt: () => void;
  closeLoginPrompt: () => void;
  isLoginPromptOpen: boolean;
}

// Create the context
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// Login Dialog Component
const LoginDialog = () => {
  const { isLoginPromptOpen, closeLoginPrompt, loginWithGoogle, isLoading } = useLogin();
  const [loginInProgress, setLoginInProgress] = useState(false);
  const theme = useTheme();

  const handleGoogleLogin = async () => {
    setLoginInProgress(true);
    try {
      await loginWithGoogle();
      closeLoginPrompt();
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <Dialog
      open={isLoginPromptOpen}
      onClose={!loginInProgress ? closeLoginPrompt : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.1 : 0.2)}`
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, px: 2 }}>
        {!loginInProgress && (
          <IconButton color="inherit" onClick={closeLoginPrompt} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <DialogContent sx={{ pt: 0, pb: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main, mb: 1 }}>
            <GoogleIcon sx={{ fontSize: 28 }} />
          </Avatar>

          <Box textAlign="center">
            <Typography variant="h5" fontWeight="500" gutterBottom>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to cast your vote and participate in events
            </Typography>
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={loginInProgress ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loginInProgress}
            sx={{
              py: 1.2,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: theme.palette.mode === 'dark'
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
                : `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
            }}
          >
            {loginInProgress ? 'Signing in...' : 'Continue with Google'}
          </Button>

          <Typography variant="caption" color="text.secondary" align="center">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// Provider component
export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // Convert Firebase User to UserData
  const createUserDataFromFirebase = (user: User): UserData => {
    return UserData.parse({
      name: user.displayName || user.email?.split('@')[0] || 'User',
      username: user.email || '',  // Using email as username
      role: Role.USER,
      profilePic: user.photoURL || undefined
    });
  };

  // Generate token and store user data
  const processUserLogin = (user: User): void => {
    try {
      // Create UserData from Firebase user
      const userData = createUserDataFromFirebase(user);
      const userEmail = user.email || '';

      // Create token using UserData
      const tokenVal = btoa(JSON.stringify(userData));

      // Store in localStorage
      localStorage.setItem('auth_token', tokenVal);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      localStorage.setItem('auth_username', userEmail);

      // Update state
      setUserData(userData);
      setToken(tokenVal);
    } catch (error) {
      console.error('Error processing login:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Try to restore user from localStorage first for faster UI loading
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      try {
        setUserData(UserData.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
    }

    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        processUserLogin(user);
      } else {
        // Clear user data on logout
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUserData(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      processUserLogin(result.user);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      // Auth state listener will handle clearing user data
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openLoginPrompt = () => setIsLoginPromptOpen(true);
  const closeLoginPrompt = () => setIsLoginPromptOpen(false);

  return (
    <LoginContext.Provider
      value={{
        userData,
        username: userData?.username,
        token,
        isAuthenticated: !!userData,
        isLoading,
        loginWithGoogle,
        logout,
        openLoginPrompt,
        closeLoginPrompt,
        isLoginPromptOpen
      }}
    >
      {children}
      <LoginDialog />
    </LoginContext.Provider>
  );
};

// Hook for easy context usage
export const useLogin = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};

// Convenient hook for auth prompts
export const useLoginPrompt = () => {
  const { openLoginPrompt, isAuthenticated, userData } = useLogin();

  return {
    promptLogin: openLoginPrompt,
    isAuthenticated,
    userData
  };
};