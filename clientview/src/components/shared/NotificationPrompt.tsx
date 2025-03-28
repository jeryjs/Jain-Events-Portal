import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { alpha, keyframes, styled } from '@mui/system';
import { useState } from 'react';
import useNotifications from '../../hooks/useNotifications';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const EnableButton = styled(Button)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'none',
  borderRadius: '16px',
  maxWidth: 800,
  placeSelf: 'center',
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
  justifySelf: 'center',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  background: theme.palette.mode === 'light'
    ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)'
    : 'linear-gradient(135deg, #4b6cb7, #182848)',
  boxShadow: `0 12px 24px rgba(0,0,0,0.15)`,
  animation: `${float} 3s ease infinite`,
}));

const NoNotificationsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  color: theme.palette.text.secondary,
  height: 260,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: '12px',
  marginBottom: theme.spacing(1),
  // padding: theme.spacing(1.5),
  transition: 'background-color 0.2s ease',
  position: 'relative',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? alpha(theme.palette.grey[100], 0.7)
      : alpha(theme.palette.grey[800], 0.5),
  },
}));

const MarkAsReadButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  padding: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light'
      ? alpha(theme.palette.primary.light, 0.1)
      : alpha(theme.palette.primary.dark, 0.1),
  },
}));

const NotificationTimestamp = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  display: 'block',
  marginTop: theme.spacing(0.5),
}));

const NotificationPrompt = (props) => {
  const [showSettings, setShowSettings] = useState(false);
  const theme = useTheme();

  // Use our enhanced hook for notifications
  const {
    notifications,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    isSubscribed,
    isSubscribing,
    permissionStatus,
    subscribeToNotifications,
  } = useNotifications();

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    // Today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Within last 7 days
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (date > oneWeekAgo) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Older
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleEnableNotifications = async () => {
    await subscribeToNotifications();

    if (permissionStatus != 'granted') {
      setShowSettings(true);
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

  if (!isSubscribed && !showSettings) {
    return (
      <Box display='grid' alignContent='center' {...props}>
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
          {isSubscribing ? "Setting Up Notifications..." : "Never Miss an Event!"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 3, px: 1 }}
        >
          {isSubscribing
            ? "Preparing your personalized event notifications..."
            : "Get instant updates about upcoming events, shrine timings and important announcements directly to your device."
          }
        </Typography>

        {permissionStatus !== 'granted' && !isSubscribing && !isSubscribed && (
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

        <Divider />

        {permissionStatus === 'granted' && isSubscribing && (
          <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="primary" fontWeight="medium">Almost there...</Typography>
          </Box>
        )}

        {permissionStatus === 'granted' && !isSubscribing && isSubscribed && (
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
      </Box>
    )
  }

  // Settings view - instructions for rejected permissions
  if (!isSubscribed && showSettings) {
    return (<>
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
    </>)
  }

  // Notifications list view
  return (
    <Box sx={{ width: '100%', minHeight: 400, maxHeight: '75vh', overflowY: 'auto' }}>
      {notificationsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress size={24} />
        </Box>
      ) : notifications.length > 0 ? (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              px: 1
            }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Notification History
            </Typography>
            <Tooltip title="Mark all as read">
              <span>
                <Button
                  size="small"
                  startIcon={<DoneAllIcon fontSize="small" />}
                  onClick={markAllAsRead}
                  disabled={!notifications.some(n => !n.read)}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  Mark all read
                </Button>
              </span>
            </Tooltip>
          </Box>

          <List disablePadding>
            {notifications.map((notification) => (
              <StyledListItem
                key={notification.id}
                alignItems="flex-start"
                sx={{
                  backgroundColor: !notification.read ?
                    (theme.palette.mode === 'light' ? alpha(theme.palette.primary.light, 0.05) : alpha(theme.palette.primary.dark, 0.08)) :
                    'transparent',
                  border: !notification.read ?
                    `1px solid ${theme.palette.mode === 'light' ? alpha(theme.palette.primary.light, 0.2) : alpha(theme.palette.primary.dark, 0.2)}` :
                    '1px solid transparent'
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: notification.read ?
                        (theme.palette.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)') :
                        'primary.light'
                    }}
                  >
                    {!notification.read ?
                      <NotificationsActiveIcon color="primary" /> :
                      <NotificationsIcon color="action" />
                    }
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', pr: 4, alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" component="span" fontWeight={notification.read ? 400 : 600}>
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Chip
                          label="New"
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.6rem', ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: 'block',
                          fontWeight: notification.read ? 'normal' : 500,
                          opacity: notification.read ? 0.9 : 1
                        }}
                      >
                        {notification.body}
                      </Typography>
                      <NotificationTimestamp>
                        {formatTimestamp(notification.timestamp)}
                      </NotificationTimestamp>
                    </>
                  }
                />
                <MarkAsReadButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!notification.read) markAsRead(notification.id);
                  }}
                  disabled={notification.read}
                  aria-label="mark as read"
                >
                  <Tooltip title="Mark as read">
                    <CheckCircleOutlineIcon
                      fontSize="small"
                      color={notification.read ? 'disabled' : 'primary'}
                    />
                  </Tooltip>
                </MarkAsReadButton>
              </StyledListItem>
            ))}
          </List>
        </>
      ) : (
        <NoNotificationsBox>
          <NotificationsOffIcon sx={{ fontSize: 40, mb: 2, opacity: 0.5 }} />
          <Typography variant="subtitle1" gutterBottom>
            No notifications yet
          </Typography>
          <Typography variant="body2" align="center">
            You'll see notifications about events and announcements here once you receive them.
          </Typography>
        </NoNotificationsBox>
      )}
    </Box>
  );
}

export default NotificationPrompt;