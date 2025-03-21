import useVoteApi from '@hooks/useVoteApi';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    LinearProgress,
    styled,
    SwipeableDrawer,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

// Mock authentication function - to be replaced with actual auth
const isAuthenticated = () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
};

const getUserUSN = () => {
    // Placeholder for actual user authentication
    return localStorage.getItem('user_usn') || null;
};

// Styled components
const ParticipantCard = styled(motion.div)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    maxWidth: 320,
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    background: theme.palette.background.paper,
    margin: theme.spacing(1),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
}));

const VoteButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: theme.spacing(5),
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'all 0.6s ease',
    },
    '&:hover::before': {
        left: '100%',
    }
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
    width: '100%',
    height: 8,
    borderRadius: 4,
    marginTop: theme.spacing(1),
    background: theme.palette.grey[200],
    position: 'relative',
    overflow: 'hidden',
}));

const ResultsBar = styled(motion.div)<{ percentage: number; voted: boolean }>(
    ({ theme, percentage, voted }) => ({
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: `${percentage}%`,
        background: voted
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
            : theme.palette.grey[400],
        borderRadius: 4,
    })
);

const CarouselContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: '-ms-autohiding-scrollbar',
    '&::-webkit-scrollbar': {
        display: 'none'
    },
    padding: theme.spacing(2, 0),
    margin: theme.spacing(0, -2),
    paddingLeft: theme.spacing(2),
}));

const VoteCountChip = styled(Chip)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    background: theme.palette.mode === 'dark'
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.06)',
}));

const ResultsDrawer = styled(SwipeableDrawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
    }
}));

const DrawerPuller = styled(Box)(({ theme }) => ({
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.palette.grey[300],
    margin: '8px auto 16px',
}));

interface Participant {
    usn: string;
    name: string;
    gender: string;
    profilePic?: string;
    college?: string;
    [key: string]: any;
}

interface PollingFormProps {
    activityId: string;
    eventId: string;
    participants: Participant[];
    showPoll?: boolean;
}

export const PollingForm = ({ activityId, eventId, participants, showPoll = false }: PollingFormProps) => {
    const [results, setResults] = useState<Record<string, number>>({});
    const [userVote, setUserVote] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVoting, setIsVoting] = useState<Record<string, boolean>>({});
    const [resultsOpen, setResultsOpen] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { castVote, getPollResults } = useVoteApi();

    useEffect(() => {
        if (showPoll) {
            fetchResults();
        }
    }, [showPoll]);

    const fetchResults = async () => {
        try {
            setIsLoading(true);
            const data = await getPollResults(eventId, activityId);
            setResults(data.votes || {});
            if (isAuthenticated()) {
                const userUSN = getUserUSN();
                if (userUSN && data.userVote) {
                    setUserVote(data.userVote);
                }
            }
        } catch (error) {
            console.error('Error fetching poll results:', error);
            setError('Unable to load poll results. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVote = async (participantId: string) => {
        if (!isAuthenticated()) {
            // Prompt user to login
            setError('Please log in to vote');
            return;
        }

        if (userVote) {
            // User has already voted
            return;
        }

        setIsVoting(prev => ({ ...prev, [participantId]: true }));

        try {
            await castVote(eventId, activityId, participantId);
            setUserVote(participantId);

            // Update results
            setResults(prev => ({
                ...prev,
                [participantId]: (prev[participantId] || 0) + 1
            }));

            // Show animation then open results drawer
            setTimeout(() => {
                setAnimationComplete(true);
                setResultsOpen(true);
            }, 500);
        } catch (error) {
            console.error('Error casting vote:', error);
            setError('Unable to cast your vote. Please try again.');
        } finally {
            setIsVoting(prev => ({ ...prev, [participantId]: false }));
        }
    };

    const getTotalVotes = () => {
        return Object.values(results).reduce((sum, count) => sum + count, 0);
    };

    const getPercentage = (participantId: string) => {
        const totalVotes = getTotalVotes();
        if (totalVotes === 0) return 0;
        return ((results[participantId] || 0) / totalVotes) * 100;
    };

    const swipeHandlers = useSwipeable({
        onSwipedRight: (eventData) => {
            // Find the element that was swiped
            const element = eventData.event.target as HTMLElement;
            const card = element.closest('[data-participant-id]');
            if (card) {
                const participantId = card.getAttribute('data-participant-id');
                if (participantId && !userVote && !isVoting[participantId]) {
                    handleVote(participantId);
                }
            }
        },
        // preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    if (!showPoll) {
        return null;
    }

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const authenticated = isAuthenticated();

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" component="h2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                    <HowToVoteIcon sx={{ mr: 1 }} /> Live Audience Poll
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setResultsOpen(true)}
                >
                    Results
                </Button>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!authenticated ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Please log in to vote. <Button size="small">Login</Button>
                </Alert>
            ) : userVote ? (
                <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>
                    Thank you for voting! Your choice has been recorded.
                </Alert>
            ) : null}

            <AnimatePresence>
                <CarouselContainer {...swipeHandlers}>
                    {participants.map((participant, index) => (
                        <ParticipantCard
                            key={participant.usn || index}
                            data-participant-id={participant.usn}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <VoteCountChip
                                size="small"
                                icon={<HowToVoteIcon fontSize="small" />}
                                label={results[participant.usn] || 0}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Avatar
                                    sx={{ width: 100, height: 100, mb: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                    alt={participant.name}
                                    src={participant.profilePic || `https://eu.ui-avatars.com/api/?name=${participant.name}&size=100`}
                                />
                                <Typography variant="h6" sx={{ textAlign: 'center', mb: 0.5 }}>
                                    {participant.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                                    {participant.college || 'FET, JU'}
                                </Typography>

                                <ProgressIndicator>
                                    <ResultsBar
                                        percentage={getPercentage(participant.usn)}
                                        voted={userVote === participant.usn}
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${getPercentage(participant.usn)}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </ProgressIndicator>

                                <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 'bold', color: 'text.secondary' }}>
                                    {getPercentage(participant.usn).toFixed(1)}%
                                </Typography>

                                <VoteButton
                                    fullWidth
                                    variant={userVote === participant.usn ? "contained" : "outlined"}
                                    color={userVote === participant.usn ? "primary" : "inherit"}
                                    disabled={!!userVote || isVoting[participant.usn] || !authenticated}
                                    onClick={() => handleVote(participant.usn)}
                                    endIcon={userVote ? <CheckCircleIcon /> : <ArrowForwardIcon />}
                                    sx={{ mt: 2 }}
                                >
                                    {isVoting[participant.usn] ? (
                                        <CircularProgress size={24} />
                                    ) : userVote === participant.usn ? (
                                        "Voted"
                                    ) : userVote ? (
                                        "Locked"
                                    ) : (
                                        "Swipe to Vote"
                                    )}
                                </VoteButton>
                            </Box>
                        </ParticipantCard>
                    ))}
                </CarouselContainer>
            </AnimatePresence>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    {userVote ? (
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LockIcon fontSize="small" sx={{ mr: 0.5 }} /> Your vote has been recorded
                        </Box>
                    ) : authenticated ? (
                        "Swipe right on a participant to vote"
                    ) : (
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PersonIcon fontSize="small" sx={{ mr: 0.5 }} /> Login to cast your vote
                        </Box>
                    )}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Total votes: {getTotalVotes()}
                </Typography>
            </Box>

            {/* Results Drawer */}
            <ResultsDrawer
                anchor="bottom"
                open={resultsOpen}
                onClose={() => setResultsOpen(false)}
                onOpen={() => setResultsOpen(true)}
                disableSwipeToOpen
                swipeAreaWidth={0}
                ModalProps={{
                    keepMounted: true,
                }}
            >
                <DrawerPuller />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Live Poll Results
                </Typography>

                <Box sx={{ mb: 2 }}>
                    {participants
                        .sort((a, b) => (results[b.usn] || 0) - (results[a.usn] || 0))
                        .map((participant, index) => (
                            <Box key={participant.usn} sx={{ mb: 2, position: 'relative' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Avatar
                                        src={participant.profilePic || `https://eu.ui-avatars.com/api/?name=${participant.name}&size=50`}
                                        alt={participant.name}
                                        sx={{ mr: 1.5, width: 36, height: 36 }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {participant.name}
                                            {userVote === participant.usn && (
                                                <Chip
                                                    size="small"
                                                    label="Your Vote"
                                                    color="primary"
                                                    sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={getPercentage(participant.usn)}
                                                sx={{
                                                    flex: 1,
                                                    height: 10,
                                                    borderRadius: 5,
                                                    backgroundColor: theme.palette.grey[200],
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 5,
                                                        background: index === 0
                                                            ? `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.warning.light})`
                                                            : undefined
                                                    }
                                                }}
                                            />
                                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: 45 }}>
                                                {getPercentage(participant.usn).toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">
                        Total votes: {getTotalVotes()}
                    </Typography>
                    {authenticated ? (
                        <Typography variant="body2" color="text.secondary">
                            {userVote ? "You have voted" : "You haven't voted yet"}
                        </Typography>
                    ) : (
                        <Button size="small" startIcon={<PersonIcon />}>
                            Login to vote
                        </Button>
                    )}
                </Box>
            </ResultsDrawer>
        </Box>
    );
};

export default PollingForm;
