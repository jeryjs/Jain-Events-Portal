import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Avatar,
  Box, Button,
  CircularProgress,
  Grow,
  IconButton,
  Paper,
  Popover, Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { keyframes, styled } from '@mui/system';
import { useEffect, useState } from 'react';
import { initializeMessaging } from '../../firebaseConfig';
import InstallPrompt from './InstallPrompt';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
`;

const NotificationButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isSubscribed',
})<{ isSubscribed?: boolean }>(({ theme, isSubscribed }) => ({
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
    : 'linear-gradient(145deg, #2d3748, #252d3b)',
  // boxShadow: theme.palette.mode === 'light'
  //   ? '5px 5px 10px #d9d9d9, -5px -5px 10px #ffffff'
  //   : '5px 5px 10px #1a202c, -5px -5px 10px #2d3748',
  width: 36,
  borderRadius: '50%',
  animation: isSubscribed ? null : `${glowPulse} 2s infinite`,
  '&:hover': {
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(145deg, #f0f0f0, #ffffff)'
      : 'linear-gradient(145deg, #252d3b, #2d3748)',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  borderRadius: '24px',
  overflow: 'hidden',
  position: 'relative',
  minWidth: 300,
  maxWidth: 360,
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #ffffff, #f8f9fa)'
    : 'linear-gradient(135deg, #2D3748, #1A202C)',
  border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(227,242,253,0.7)' : 'rgba(255,255,255,0.05)'}`,
  backdropFilter: 'blur(10px)',
}));

const EnableButton = styled(Button)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: '16px',
  padding: '10px 24px',
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite ease-in-out`,
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(45deg, #4285F4, #34A853)'
    : 'linear-gradient(45deg, #4285F4, #0F9D58)',
  boxShadow: '0 4px 20px rgba(66,133,244,0.25)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 25px rgba(66,133,244,0.35)',
    background: theme.palette.mode === 'light'
      ? 'linear-gradient(45deg, #3367D6, #2E7D32)'
      : 'linear-gradient(45deg, #3367D6, #0B8043)',
  }
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  fontWeight: 'medium',
  textTransform: 'none',
  borderRadius: '16px',
  padding: '8px 16px',
  transition: 'all 0.3s ease',
  marginTop: theme.spacing(2),
}));

const NotificationIconContainer = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)'
    : 'linear-gradient(135deg, #4b6cb7, #182848)',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  animation: `${float} 3s ease infinite`,
}));

const NotificationPrompt = ({ className }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [loading, setLoading] = useState(false);
  const [subscribedToNotifications, setSubscribedToNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Check if already subscribed to notifications
    const isSubscribed = localStorage.getItem('subscribedToken') != null;
    setSubscribedToNotifications(isSubscribed);

    // Check current notification permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, [localStorage.subscribedToken]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // Reset settings view when opening
    setShowSettings(false);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEnableNotifications = async () => {
    setLoading(true);

    try {
      // Only request permission when user clicks the button
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);

        if (permission === 'granted') {
          const messaging = await initializeMessaging();
          setSubscribedToNotifications(!!messaging);
        } else if (permission === 'denied') {
          // Show instructions to reset permissions
          setShowSettings(true);
        }
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const openBrowserSettings = () => {
    // Open instructions in a new tab based on browser
    const userAgent = navigator.userAgent.toLowerCase();
    let settingsUrl = '';

    if (userAgent.indexOf("chrome") > -1) {
      settingsUrl = 'chrome://settings/content/notifications';
    } else if (userAgent.indexOf("firefox") > -1) {
      settingsUrl = 'about:preferences#privacy';
    } else if (userAgent.indexOf("safari") > -1) {
      settingsUrl = 'https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac';
    } else if (userAgent.indexOf("edge") > -1) {
      settingsUrl = 'edge://settings/content/notifications';
    }

    // For Chrome-like browsers, we can try to open the settings directly
    if (settingsUrl.startsWith('chrome://') || settingsUrl.startsWith('edge://')) {
      try {
        window.open(settingsUrl, '_blank');
      } catch (e) {
        // If direct opening fails, show generic instructions
        window.open('https://support.google.com/chrome/answer/3220216?hl=en', '_blank');
      }
    } else if (settingsUrl) {
      window.open(settingsUrl, '_blank');
    } else {
      // Generic instructions for other browsers
      window.open('https://support.google.com/chrome/answer/3220216?hl=en', '_blank');
    }
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf("chrome") > -1) return "Chrome";
    if (userAgent.indexOf("firefox") > -1) return "Firefox";
    if (userAgent.indexOf("safari") > -1) return "Safari";
    if (userAgent.indexOf("edge") > -1) return "Edge";
    return "your browser";
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <NotificationButton
        onClick={handleClick}
        className={className}
        isSubscribed={subscribedToNotifications}
        color={subscribedToNotifications ? "primary" : "default"}
      >
        {subscribedToNotifications
          ? <NotificationsActiveIcon color="primary" />
          : <NotificationsIcon />
        }
      </NotificationButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: isMobile ? 'bottom' : 'bottom',
          horizontal: isMobile ? 'center' : 'left',
        }}
        transformOrigin={{
          vertical: isMobile ? 'top' : 'top',
          horizontal: isMobile ? 'center' : 'right',
        }}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          }
        }}
      >
        <Grow in={open}>
          <StyledPaper>
            {/* Background decoration elements */}
            <Box sx={{
              position: 'absolute',
              top: -30,
              right: -30,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: theme.palette.primary.main,
              opacity: 0.06,
              zIndex: -1
            }} />

            <Box sx={{
              position: 'absolute',
              bottom: -20,
              left: -20,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: '#34A853',
              opacity: 0.05,
              zIndex: -1
            }} />

            {/* Close button */}
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                opacity: 0.7,
                '&:hover': { opacity: 1 }
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {/* Main content */}
            {!showSettings ? (
              // Default view - enable notifications
              <>
                <NotificationIconContainer>
                  <NotificationsActiveIcon
                    sx={{
                      fontSize: 40,
                      color: theme.palette.primary.main,
                      animation: `${pulse} 2s infinite ease-in-out`
                    }}
                  />
                </NotificationIconContainer>

                <Typography variant="h6" fontWeight="700" textAlign="center" sx={{ mb: 1.5 }}>
                  {loading ? "Setting Up Notifications..." : "Never Miss an Event!"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mb: 3, px: 1 }}
                >
                  {loading
                    ? "Preparing your personalized event notifications..."
                    : "Get instant updates about upcoming events, shrine timings and important announcements directly to your device."
                  }
                </Typography>

                {permissionStatus !== 'granted' && !loading && !subscribedToNotifications && (
                  <EnableButton
                    variant="contained"
                    onClick={handleEnableNotifications}
                    fullWidth
                    disableElevation
                    startIcon={<NotificationsActiveIcon />}
                  >
                    Enable Notifications
                  </EnableButton>
                )}

                {permissionStatus === 'denied' && !showSettings && (
                  <SecondaryButton
                    variant="outlined"
                    onClick={() => setShowSettings(true)}
                    startIcon={<ErrorOutlineIcon />}
                    size="small"
                  >
                    Having trouble?
                  </SecondaryButton>
                )}

                {permissionStatus === 'granted' && loading && (
                  <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} /> {/* Adjust size as needed */}
                    <Typography variant="body2" color="primary" fontWeight="medium">Almost there...</Typography>
                  </Box>
                )}

                {permissionStatus === 'granted' && !loading && subscribedToNotifications && (
                  <Box sx={{ textAlign: 'center', py: 1 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'success.light',
                        margin: '0 auto',
                        mb: 1
                      }}
                    >
                      <CheckCircleOutlineIcon />
                    </Avatar>
                    <Typography variant="body2" color="success.main" fontWeight="medium">
                      Push notifications enabled successfully!
                    </Typography>
                  </Box>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 2, opacity: 0.7 }}
                >
                  You can change notification settings anytime
                </Typography>
              </>
            ) : (
              // Settings view - instructions for rejected permissions
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 56, height: 56 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 32, color: theme.palette.warning.dark }} />
                  </Avatar>
                </Box>

                <Typography variant="h6" fontWeight="700" textAlign="center" sx={{ mb: 1.5 }}>
                  Permission Required
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mb: 3, px: 1 }}
                >
                  Notifications have been blocked in {getBrowserName()}. To enable them:
                </Typography>

                <Box sx={{
                  backgroundColor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 2,
                  p: 2,
                  width: '100%',
                  mb: 2
                }}>
                  <Typography variant="body2" component="ol" sx={{ pl: 2 }}>
                    <li>Click the button below to open {getBrowserName()} settings</li>
                    <li>Find "FET Hub" in the list of sites</li>
                    <li>Change notifications to "Allow"</li>
                    <li>Return to this page and try again</li>
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={openBrowserSettings}
                  startIcon={<OpenInNewIcon />}
                  sx={{ mb: 1.5 }}
                >
                  Open Browser Settings
                </Button>

                <Button
                  variant="text"
                  size="small"
                  onClick={() => setShowSettings(false)}
                >
                  Go back
                </Button>
              </>
            )}
            <InstallPrompt showAsComponent={true} />
          </StyledPaper>
        </Grow>
      </Popover>
    </>
  );
};

export default NotificationPrompt;