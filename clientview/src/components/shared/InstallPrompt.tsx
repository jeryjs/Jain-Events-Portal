import { useState, useEffect } from 'react';
import {
    Box, Button, Slide, Paper, Typography,
    IconButton, useMediaQuery, useTheme, Grow,
    Avatar, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { styled, keyframes } from '@mui/system';

const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
`;

const slideIn = keyframes`
    from { transform: translateY(5px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
`;

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2.5),
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    borderRadius: '16px',
    margin: theme.spacing(2),
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1000,
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #ffffff, #f8f9fa)'
        : 'linear-gradient(135deg, #2D3748, #1A202C)',
    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(227,242,253,0.7)' : 'rgba(255,255,255,0.05)'}`,
    backdropFilter: 'blur(10px)',
}));

const InstallButton = styled(Button)(({ theme }) => ({
    fontWeight: 'bold',
    textTransform: 'none',
    borderRadius: '12px',
    padding: '10px 20px',
    transition: 'all 0.3s ease',
    animation: `${pulse} 2s infinite ease-in-out`,
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(45deg, #3f51b5, #2196f3)'
        : 'linear-gradient(45deg, #7986cb, #64b5f6)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 25px rgba(33,150,243,0.3)',
        background: theme.palette.mode === 'light'
            ? 'linear-gradient(45deg, #303f9f, #1976d2)'
            : 'linear-gradient(45deg, #5c6bc0, #42a5f5)',
    }
}));

const IconContainer = styled(Avatar)(({ theme }) => ({
    background: theme.palette.mode === 'light'
        ? 'linear-gradient(45deg, #e3f2fd, #bbdefb)'
        : 'linear-gradient(45deg, #4b6cb7, #182848)',
    padding: theme.spacing(1.5),
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const InstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [installing, setInstalling] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const theme = useTheme();
    const isWideScreen = useMediaQuery('(min-width:768px)');

    useEffect(() => {
        // Check if user previously dismissed the prompt
        const lastDismissed = localStorage.getItem('installPromptDismissed');
        const isDismissed = lastDismissed && (Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000);

        if (isDismissed) return;

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            setDeferredPrompt(e);
            setShowPrompt(true);

            // Add slight delay before animation for better effect
            setTimeout(() => setAnimateIn(true), 100);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        setInstalling(true);

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const choiceResult = await deferredPrompt.userChoice;

        // Reset state
        setDeferredPrompt(null);

        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            // Wait briefly to show success state before dismissing
            setTimeout(() => setShowPrompt(false), 1500);
        } else {
            console.log('User dismissed the install prompt');
            setInstalling(false);
        }
    };

    const handleDismiss = () => {
        setAnimateIn(false);
        setTimeout(() => setShowPrompt(false), 300);
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <Slide direction={isWideScreen ? "left" : "up"} in={showPrompt} mountOnEnter unmountOnExit>
            <Box sx={{
                position: 'fixed',
                ...(isWideScreen
                    ? { bottom: 24, right: 24, maxWidth: 380 }
                    : { bottom: 16, left: 16, right: 16 })
            }}>
                <Grow in={animateIn} timeout={500}>
                    <StyledPaper elevation={6}>
                        {/* Background decoration */}
                        <Box sx={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: theme.palette.primary.main,
                            opacity: 0.04,
                            zIndex: -1
                        }} />

                        <IconContainer>
                            {installing ?
                                <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 28 }} /> :
                                <AppShortcutIcon color="primary" sx={{ fontSize: 28 }} />
                            }
                        </IconContainer>

                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            animation: `${slideIn} 0.5s ease-out`,
                            flexGrow: 1
                        }}>
                            <Typography variant="h6" fontWeight="700" sx={{ mb: 0.5 }}>
                                {installing ? "Installing..." : "Upgrade Your Experience"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {installing ?
                                    "Setting up your app for offline access and faster loading" :
                                    "Add FET Hub to your home screen to stay updated with upcoming events, get notifications, and more."
                                }
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                {!installing && (
                                    <>
                                        <InstallButton
                                            variant="contained"
                                            onClick={handleInstall}
                                            startIcon={<AppShortcutIcon />}
                                            disableElevation
                                        >
                                            Add to Home Screen
                                        </InstallButton>

                                        <IconButton
                                            onClick={handleDismiss}
                                            aria-label="dismiss"
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                color: theme.palette.text.secondary,
                                                '&:hover': {
                                                    color: theme.palette.text.primary,
                                                    background: theme.palette.action.hover
                                                }
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </>
                                )}

                                {installing && (
                                    <Box sx={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        animation: `${pulse} 1.5s infinite ease-in-out`
                                    }}>
                                        <Typography variant="body2" color="primary" fontWeight="medium">
                                            Please follow the installation instructions
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </StyledPaper>
                </Grow>
            </Box>
        </Slide>
    );
};

export default InstallPrompt;