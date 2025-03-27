import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonIcon from '@mui/icons-material/Person';
import {
    Avatar,
    Badge,
    Box,
    Button,
    Chip,
    Divider,
    Fade,
    IconButton,
    List,
    Paper,
    Popover,
    Tab,
    Tabs,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { alpha, keyframes, styled } from '@mui/system';
import { Role } from '@common/constants';
import { useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import InstallPrompt from './InstallPrompt';
import { useLogin, useLoginPrompt } from './LoginContext';
import NotificationPrompt from './NotificationPrompt';
import ThemeSwitcher from './ThemeSwitcher';

const glowPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(66, 133, 244, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 133, 244, 0); }
`;

const ProfileButtonContainer = styled(IconButton, {
    shouldForwardProp: (prop) => prop !== 'isSubscribed',
})<{ isSubscribed?: boolean }>(({ theme, isSubscribed }) => ({
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(145deg, #ffffff, #f0f0f0)'
        : 'linear-gradient(145deg, #2d3748, #252d3b)',
    width: 40,
    height: 40,
    borderRadius: '50%',
    animation: isSubscribed ? 'none' : `${glowPulse} 2s infinite`,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(145deg, #f0f0f0, #ffffff)'
            : 'linear-gradient(145deg, #252d3b, #2d3748)',
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    width: 340, // Fixed width to prevent resizing
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #ffffff, #f8f9fa)'
        : 'linear-gradient(135deg, #2D3748, #1A202C)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(227,242,253,0.7)' : 'rgba(255,255,255,0.05)'}`,
    backdropFilter: 'blur(10px)',
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1),
}));

const TabPanel = styled(Box)(({ theme }) => ({
    padding: 0,
    overflow: 'hidden',
    width: '100%',
}));

// Helper function to get role color and icon
const getRoleInfo = (role: Role) => {
    switch (role) {
        case Role.ADMIN:
            return {
                color: 'error',
                icon: <AdminPanelSettingsIcon fontSize="small" />,
                label: 'Admin'
            };
        case Role.MANAGER:
            return {
                color: 'warning',
                icon: <ManageAccountsIcon fontSize="small" />,
                label: 'Manager'
            };
        case Role.USER:
            return {
                color: 'info',
                icon: <PersonIcon fontSize="small" />,
                label: 'User'
            };
        default:
            return {
                color: 'default',
                icon: <AccountCircleIcon fontSize="small" />,
                label: 'Guest'
            };
    }
};

const ProfileButton = ({ className }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Use our enhanced hook for notifications
    const { unreadCount, refreshNotifications, isSubscribed } = useNotifications();

    // Get user authentication data
    const { userData, isAuthenticated, logout } = useLogin();
    const { promptLogin } = useLoginPrompt();

    // Update tabs when clicked
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        // Refresh notifications when opening the popover
        refreshNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleLogout = async () => {
        await logout();
        handleClose();
    };

    const open = Boolean(anchorEl);

    const ProfileContent = () => {
        return (isAuthenticated ? (
            <ProfileHeader>
                <Avatar
                    src={userData?.profilePic}
                    alt={userData?.name}
                    sx={{
                        width: 60,
                        height: 60,
                        mr: 2,
                        boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}`,
                    }}
                />
                <Box>
                    <Typography variant="h6" fontWeight="600">
                        {userData?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {userData?.username}
                    </Typography>

                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        {/* Role-specific actions */}
                        {userData?.role >= Role.MANAGER && (
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ borderRadius: 2, textTransform: 'none', p: '3px 8px' }}
                                href="/admin"
                                target="_blank"
                            >
                                Admin
                            </Button>
                        )}

                        {/* Logout button */}
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleLogout}
                            sx={{ borderRadius: 2, textTransform: 'none', p: '3px 8px' }}
                        >
                            Sign Out
                        </Button>
                    </Box>
                </Box>
            </ProfileHeader>
        ) : (
            <Box sx={{ p: 2, mb: 1 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    sx={{ mb: 2 }}
                >
                    Sign in to manage your profile and participate in events.
                </Typography>

                <Button
                    variant="contained"
                    onClick={promptLogin}
                    fullWidth
                    sx={{ borderRadius: 2, textTransform: 'none', py: 1 }}
                >
                    Sign In
                </Button>
            </Box>
        ));
    }

    return (
        <>
            <Badge
                badgeContent={unreadCount}
                color="error"
                invisible={unreadCount === 0 || !isSubscribed}
                overlap="circular"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem' } }}
            >
                <ProfileButtonContainer
                    onClick={handleClick}
                    className={className}
                    isSubscribed={isSubscribed}
                    color={isSubscribed ? "primary" : "default"}
                >
                    {isAuthenticated ? (
                        <Avatar
                            src={userData?.profilePic}
                            alt={userData?.name}
                            sx={{
                                width: 24,
                                height: 24,
                                border: '1px solid',
                                borderColor: theme.palette.divider
                            }}
                        />
                    ) : (
                        isSubscribed
                            ? <NotificationsActiveIcon color="primary" sx={{ fontSize: 20 }} />
                            : <NotificationsIcon sx={{ fontSize: 20 }} />
                    )}
                </ProfileButtonContainer>
            </Badge>

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
                <Fade in={open}>
                    <StyledPaper>
                        {/* Close button */}
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                opacity: 0.7,
                                zIndex: 2,
                                '&:hover': { opacity: 1 }
                            }}
                            size="small"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>

                        {/* Tab Navigation */}
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            sx={{ width: '100%', mb: 1, borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab
                                label="Home"
                                icon={<PersonIcon />}
                                iconPosition="start"
                                sx={{ minHeight: 48 }}
                            />
                            <Tab
                                label="Notifications"
                                icon={<NotificationsIcon />}
                                iconPosition="start"
                                sx={{ minHeight: 48 }}
                                disabled={!isSubscribed} // Disable Notifications tab if not subscribed
                            />
                        </Tabs>

                        {/* Tab Panels */}
                        <TabPanel>
                            {/* Profile Tab Content */}
                            <Fade in={activeTab === 0} timeout={{ enter: 500, exit: 300 }} style={{ 
                                display: activeTab === 0 ? 'block' : 'none',
                                transitionProperty: 'opacity, transform',
                                transform: activeTab === 0 ? 'translateY(0)' : 'translateY(10px)'
                            }}>
                                <Box>
                                    {/* Profile component */}
                                    <ProfileContent />

                                    <Divider sx={{ width: '100%', my: 1.5 }} />

                                    {/* Theme switcher */}
                                    <ThemeSwitcher variant='expanded'/>

                                    <Divider sx={{ width: '100%', my: 1.5 }} />

                                    {/* Install PWA component */}
                                    <InstallPrompt showAsComponent={true} />

                                    {/* Notification subscription - only for authenticated users */}
                                    {isAuthenticated && !isSubscribed && (
                                        <Box sx={{
                                            mt: 1.5,
                                            pt: 1.5,
                                            borderTop: `1px dashed ${theme.palette.divider}`,
                                            width: '100%',
                                            textAlign: 'center',
                                            p: 1.5
                                        }}>
                                            <Tooltip title="Enable to receive event notifications">
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => setActiveTab(1)}
                                                    size="small"
                                                    startIcon={<NotificationsIcon />}
                                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    Enable Notifications
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    )}
                                </Box>
                            </Fade>

                            {/* Notifications Tab Content */}
                            <Fade in={activeTab === 1} timeout={{ enter: 500, exit: 300 }} style={{ 
                                display: activeTab === 1 ? 'block' : 'none',
                                height: 300,
                                transitionProperty: 'opacity, transform',
                                transform: activeTab === 1 ? 'translateY(0)' : 'translateY(10px)'
                            }}>
                                <Box sx={{ width: '100%', height: '100%' }}>
                                    <NotificationPrompt />
                                </Box>
                            </Fade>
                        </TabPanel>
                    </StyledPaper>
                </Fade>
            </Popover>
        </>
    );
};

export default ProfileButton;