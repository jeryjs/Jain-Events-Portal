import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import {
    Avatar,
    Box, Button,
    Grow,
    IconButton,
    Paper,
    Slide,
    Typography,
    useMediaQuery, useTheme
} from '@mui/material';
import { keyframes, styled } from '@mui/system';
import { useEffect, useState } from 'react';

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

// Create a global module-level variable to store the prompt
let globalDeferredPrompt: any = null;

// Listen for beforeinstallprompt at module level (outside component)
if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser install prompt
        e.preventDefault();
        // Store the event for later use
        globalDeferredPrompt = e;
        console.log('Captured install prompt at global level');
    });
}

interface InstallPromptProps {
    showAsComponent?: boolean;
}

const InstallPrompt = ({ showAsComponent = false }: InstallPromptProps) => {
    const [showPrompt, setShowPrompt] = useState(showAsComponent);
    const [installing, setInstalling] = useState(false);
    const [animateIn, setAnimateIn] = useState(showAsComponent);
    const theme = useTheme();
    const isWideScreen = useMediaQuery('(min-width:768px)');
    const isStandalone = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;

    useEffect(() => {
        // For standalone mode
        if (!showAsComponent) {
            // Check if user previously dismissed the prompt
            const lastDismissed = localStorage.getItem('installPromptDismissed');
            const isDismissed = lastDismissed && (Date.now() - parseInt(lastDismissed) < 24 * 60 * 60 * 1000);

            if (isDismissed || isStandalone) {
                setShowPrompt(false);
                return;
            }

            // If we already have a prompt captured, show standalone prompt
            if (globalDeferredPrompt) {
                console.log("Using previously captured prompt for standalone");
                setShowPrompt(true);
                setTimeout(() => setAnimateIn(true), 100);
            }

            // Re-register for the event in case it hasn't fired yet
            const handleBeforeInstallPrompt = (e: Event) => {
                e.preventDefault();
                globalDeferredPrompt = e;
                console.log("Install prompt event captured in component");

                setShowPrompt(true);
                setTimeout(() => setAnimateIn(true), 100);
            };

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }
    }, [isStandalone, showAsComponent]);

    const handleInstall = async () => {
        // Always use the global captured prompt
        if (!globalDeferredPrompt) {
            console.log("No install prompt available");

            // Show device-specific instructions
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            if (isIOS && isSafari) {
                alert("To install: tap the Share icon then 'Add to Home Screen'");
            } else if (isMobile) {
                alert("To install: tap on your browser's menu and select 'Add to Home Screen'");
            } else {
                alert("Installation not supported in this browser session");
            }

            return;
        }

        setInstalling(true);

        try {
            // Show the install prompt
            globalDeferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const choiceResult = await globalDeferredPrompt.userChoice;

            // Clear the saved prompt
            globalDeferredPrompt = null;

            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                // Wait briefly to show success state before dismissing
                setTimeout(() => setShowPrompt(false), 1500);
            } else {
                console.log('User dismissed the install prompt');
                setInstalling(false);
            }
        } catch (error) {
            console.error("Error during installation:", error);
            alert("Installation encountered an error. Please try again later.");
            setInstalling(false);
        }
    };

    const handleDismiss = () => {
        setAnimateIn(false);
        setTimeout(() => setShowPrompt(false), 300);
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    // Don't render standalone prompt if it shouldn't be shown
    if (!showPrompt && !showAsComponent) return null;

    // When used as a component inside NotificationPrompt
    if (showAsComponent) {
        const installAvailable = !!globalDeferredPrompt;

        return (
            <Box sx={{
                width: '100%',
                mt: 3,
                animation: `${slideIn} 0.5s ease-out`,
                borderRadius: '12px',
                border: `1px solid ${theme.palette.divider}`,
                padding: theme.spacing(2),
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <IconContainer sx={{ width: 40, height: 40, boxShadow: 'none' }}>
                        <AppShortcutIcon color="primary" sx={{ fontSize: 24 }} />
                    </IconContainer>
                    <Typography variant="h6" fontWeight="600">
                        Install FET Hub App
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {installAvailable
                        ? "Add to your home screen for quick access and a better experience."
                        : isStandalone
                            ? "You're already using the installed app!"
                            : "For the best experience, install our web app on your device."}
                </Typography>

                {isStandalone ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon color="success" />
                        <Typography variant="body2" color="success.main" fontWeight="medium">
                            App installed successfully
                        </Typography>
                    </Box>
                ) : (
                    <InstallButton
                        variant="contained"
                        onClick={handleInstall}
                        disabled={installing || isStandalone}
                        startIcon={installing ? <CheckCircleOutlineIcon /> : <AppShortcutIcon />}
                        sx={{ width: '100%' }}
                    >
                        {installing ? "Installing..." : "Add to Home Screen"}
                    </InstallButton>
                )}
            </Box>
        );
    }

    // Original standalone floating prompt - keep existing implementation
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
                        {/* Keep your existing implementation here */}
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