import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { 
  Dialog, 
  DialogContent, 
  Button, 
  Typography, 
  Box, 
  useTheme, 
  alpha,
  IconButton,
  CircularProgress,
  Avatar
} from '@mui/material';
import { app } from '../../firebaseConfig';
import GoogleIcon from '@mui/icons-material/Google';
import CloseIcon from '@mui/icons-material/Close';

// Initialize Firebase auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Context type definition
interface LoginContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  openLoginPrompt: () => void;
  closeLoginPrompt: () => void;
  isLoginPromptOpen: boolean;
}

// Create the context
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// Login Dialog Component
const LoginDialog = () => {
  const { isLoginPromptOpen, closeLoginPrompt, loginWithGoogle, isLoading } = useContext(LoginContext) as LoginContextType;
  const [loginInProgress, setLoginInProgress] = useState(false);
  const theme = useTheme();
  
  const handleGoogleLogin = async () => {
    setLoginInProgress(true);
    try {
      await loginWithGoogle();
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
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          pt: 2, 
          px: 2
        }}
      >
        {!loginInProgress && (
          <IconButton 
            color="inherit" 
            onClick={closeLoginPrompt}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <DialogContent sx={{ pt: 0, pb: 4 }}>
        <Box 
          display="flex" 
          flexDirection="column"
          alignItems="center"
          gap={3}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: theme.palette.primary.main,
              mb: 1
            }}
          >
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      closeLoginPrompt();
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openLoginPrompt = () => setIsLoginPromptOpen(true);
  const closeLoginPrompt = () => setIsLoginPromptOpen(false);

  return (
    <LoginContext.Provider 
      value={{
        user,
        isAuthenticated: !!user,
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

// Hook for login prompt functionality
export const useLoginPrompt = () => {
  const { openLoginPrompt, isAuthenticated, user } = useLogin();
  
  return {
    promptLogin: openLoginPrompt,
    isAuthenticated,
    user
  };
};