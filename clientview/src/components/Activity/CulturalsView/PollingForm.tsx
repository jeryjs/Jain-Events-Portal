import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, useTheme, alpha, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwipeIcon from '@mui/icons-material/SwipeRightAlt';
import LockIcon from '@mui/icons-material/Lock';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useCastVote } from '@hooks/useApi';
import { CulturalActivity } from '@common/models';
import { useLoginPrompt } from '@components/shared';

// Styled components with glassmorphism effects
const PollContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    margin: theme.spacing(3, 0),
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.7 : 0.6),
    backdropFilter: 'blur(10px)',
    boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.06)}`,
}));

const OptionCard = styled(motion.div)<{ selected?: boolean, userVote?: boolean }>(({ theme, selected, userVote }) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(1.5),
    overflow: 'hidden',
    cursor: userVote ? 'default' : 'pointer',
    backgroundColor: userVote
        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.15 : 0.08)
        : selected
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.05)
            : alpha(theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.default,
                theme.palette.mode === 'dark' ? 0.4 : 0.7),
    border: `1px solid ${alpha(userVote ? theme.palette.primary.main : theme.palette.divider, userVote ? 0.4 : 0.1)}`,
    boxShadow: userVote ? `0 2px 12px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
}));

const ProgressBar = styled('div')<{ width: number }>(({ theme, width }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${width}%`,
    background: alpha(theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
        theme.palette.mode === 'dark' ? 0.2 : 0.1),
    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 0,
}));

const SwipeButton = styled(motion.div)(({ theme }) => ({
    position: 'relative',
    height: 48,
    width: '100%',
    marginTop: theme.spacing(2),
    borderRadius: 24,
    overflow: 'hidden',
    background: `linear-gradient(90deg, 
    ${alpha(theme.palette.primary[theme.palette.mode === 'dark' ? 'dark' : 'main'], 0.2)}, 
    ${alpha(theme.palette.primary[theme.palette.mode === 'dark' ? 'main' : 'dark'], 0.2)})`,
    backdropFilter: 'blur(10px)',
    boxShadow: `0 4px 24px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.06)}`,
}));

const SwipeThumb = styled(motion.div)(({ theme }) => ({
    position: 'absolute',
    top: 4,
    left: 4,
    width: 40,
    height: 40,
    borderRadius: '50%',
    background: theme.palette.common.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    '& svg': {
        fontSize: 22,
        color: theme.palette.primary.main,
    }
}));

const SwipeText = styled(motion(Typography))(({ theme }) => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.common.white,
    letterSpacing: 1,
    userSelect: 'none',
}));

interface PollingFormProps {
    eventId: string;
    activityId: string;
    activity: CulturalActivity;
}

export const PollingForm = ({ eventId, activityId, activity }: PollingFormProps) => {
    const theme = useTheme();
    const castVoteMutation = useCastVote(eventId, activityId);
    const { isAuthenticated, promptLogin } = useLoginPrompt();

    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [userVoted, setUserVoted] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragReady, setIsDragReady] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const { participants, pollData = [], showPoll } = activity;

    // Motion values for drag interactions
    const x = useMotionValue(0);

    // Calculate dragPercentage as percentage of container width
    const maxDragWidth = containerWidth - 52; // Account for thumb width and padding

    const dragPercentage = useTransform(x, value => {
        if (!containerWidth || maxDragWidth <= 0) return 0;
        return Math.min(Math.max((value / maxDragWidth) * 100, 0), 100);
    });

    // Combined opacity transforms
    const swipeOpacity = useTransform(dragPercentage, [0, 60], [1, 0]);
    const lockOpacity = useTransform(dragPercentage, [60, 90], [0, 1]);

    // Initialize container width and setup measurement
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const newWidth = containerRef.current.getBoundingClientRect().width;
                if (newWidth > 0) {
                    setContainerWidth(newWidth);
                    setIsDragReady(true);
                }
            }
        };

        // Multiple attempts to measure width
        updateWidth();

        const initialTimer = setTimeout(updateWidth, 100);
        const backupTimer = setTimeout(updateWidth, 500);

        // Setup resize observer
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) resizeObserver.observe(containerRef.current);

        window.addEventListener('resize', updateWidth);
        return () => {
            clearTimeout(initialTimer);
            clearTimeout(backupTimer);
            resizeObserver.disconnect();
        };
    }, []);

    // Ensure width is measured after selection changes
    useEffect(() => {
        if (selectedTeam && containerRef.current) {
            setTimeout(() => {
                const newWidth = containerRef.current?.getBoundingClientRect().width || 0;
                if (newWidth > 0) {
                    setContainerWidth(newWidth);
                    setIsDragReady(true);
                }
            }, 50);
        }
        // Reset thumb position
        x.set(0);
    }, [selectedTeam, x]);

    // Check user vote
    useEffect(() => {
        const userUsername = "admin"; // Replace with actual auth

        if (pollData.length > 0 && userUsername) {
            const userVote = pollData.find(poll => poll.votes.includes(userUsername));
            if (userVote) setUserVoted(userVote.teamId);
        }
    }, [pollData]);

    // Handle selecting a team
    const handleSelectTeam = (teamId: string) => {
        if (!userVoted && isAuthenticated) {
            setSelectedTeam(teamId === selectedTeam ? null : teamId);
        }
    };

    // Process vote when thumb is dragged to end
    const handleDragEnd = () => {
        const currentPercentage = dragPercentage.get();

        if (currentPercentage > 90 && selectedTeam) {
            castVoteMutation.mutate(selectedTeam, {
                onSuccess: () => {
                    setUserVoted(selectedTeam);
                    setError(null);
                    setTimeout(() => x.set(0), 300);
                },
                onError: () => {
                    setError('Failed to submit vote. Please try again.');
                    setTimeout(() => x.set(0), 300);
                },
                onSettled: () => setTimeout(() => x.set(0), 10),
            });
        }
        setTimeout(() => x.set(0), 10);
    };

    // Calculate vote data
    const totalVotes = pollData.reduce((sum, team) => sum + team.votes.length, 0) || 0;

    const getVoteData = (teamId: string) => {
        const votes = pollData.find(p => p.teamId === teamId)?.votes.length || 0;
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
        return { votes, percentage };
    };

    if (!showPoll || participants.length === 0) return null;

    return (
        <PollContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HowToVoteIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="600">Audience Poll</Typography>
            </Box>

            {/* Participant Options */}
            <AnimatePresence>
                {participants
                    .sort((a, b) => (getVoteData(b.usn).votes - getVoteData(a.usn).votes))
                    .map((participant) => {
                        const teamId = participant.usn;
                        const isSelected = selectedTeam === teamId;
                        const isUserVote = userVoted === teamId;
                        const { votes, percentage } = getVoteData(teamId);

                        return (
                            <OptionCard
                                key={teamId}
                                selected={isSelected}
                                userVote={isUserVote}
                                onClick={() => handleSelectTeam(teamId)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                whileHover={!userVoted ? { scale: 1.01 } : undefined}
                                whileTap={!userVoted ? { scale: 0.99 } : undefined}
                            >
                                <ProgressBar width={percentage} />

                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', zIndex: 1 }}>
                                    <Avatar
                                        src={participant.profilePic || `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}`}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1.5,
                                            border: isUserVote ? `2px solid ${theme.palette.primary.main}` : 'none',
                                        }}
                                    />

                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body1" fontWeight={isUserVote ? 600 : 400}>
                                            {participant.name}
                                            {isUserVote && <CheckCircleIcon color="primary" sx={{ ml: 1, width: 16, height: 16 }} />}
                                        </Typography>

                                        <Typography variant="caption" color="text.secondary">
                                            {participant.college || 'FET, JU'}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" fontWeight={500} sx={{ minWidth: 32, textAlign: 'right' }}>
                                        {votes}
                                    </Typography>
                                </Box>
                            </OptionCard>
                        );
                    })}
            </AnimatePresence>

            {/* Swipe to Vote Button */}
            <AnimatePresence>
                {selectedTeam && isAuthenticated && !userVoted && !castVoteMutation.isPending && (
                    <Box ref={containerRef} sx={{ width: '100%' }}>
                        <SwipeButton>
                            <SwipeText style={{ opacity: swipeOpacity }}>
                                SWIPE TO VOTE
                            </SwipeText>

                            <SwipeText style={{ opacity: lockOpacity }}>
                                <LockIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                VOTE CONFIRMED
                            </SwipeText>

                            <SwipeThumb
                                drag={isDragReady ? "x" : false}
                                dragConstraints={{ left: 0, right: Math.max(0, maxDragWidth) }}
                                dragElastic={0.1}
                                dragMomentum={false}
                                onDragEnd={handleDragEnd}
                                style={{ x }}
                            >
                                <SwipeIcon />
                            </SwipeThumb>
                        </SwipeButton>

                        <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1 }}>
                            Your vote cannot be changed once cast
                        </Typography>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                                <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }} onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}
                    </Box>
                )}

                {castVoteMutation.isPending && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 48, my: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 1.5 }}>Submitting vote...</Typography>
                    </Box>
                )}
            </AnimatePresence>

            {/* Summary and Authentication Info */}
            {totalVotes > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
                    Total votes: <b>{totalVotes}</b>
                </Typography>
            )}

            {!isAuthenticated && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        mt: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            color: theme.palette.primary.main
                        }
                    }}
                    onClick={promptLogin}
                >
                    <LockIcon sx={{ fontSize: 16 }} />
                    Sign in to cast your vote
                </Typography>
            )}
        </PollContainer>
    );
};