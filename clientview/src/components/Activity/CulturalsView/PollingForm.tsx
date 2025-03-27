import { CulturalActivity } from '@common/models';
import { useLogin, useLoginPrompt } from '@components/shared';
import { useCastVote } from '@hooks/useApi';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import LockIcon from '@mui/icons-material/Lock';
import SwipeIcon from '@mui/icons-material/SwipeRightAlt';
import { Alert, alpha, Avatar, Badge, Box, CircularProgress, Tooltip, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Styled components with glassmorphism effects
const PollContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    margin: theme.spacing(3, 0),
    paddingBlock: theme.spacing(2),
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
        ? alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)
        : selected
            ? alpha(theme.palette.success.light, theme.palette.mode === 'dark' ? 0.15 : 0.08)
            : alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.7 : 0.6),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.success.main, userVote ? 0.5 : selected ? 0.2 : 0.08)}`,
    boxShadow: userVote
        ? `0 4px 24px ${alpha(theme.palette.success.dark, 0.25)}`
        : selected
            ? `0 2px 12px ${alpha(theme.palette.success.main, 0.15)}`
            : `0 2px 8px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.2 : 0.08)}`,
}));

const ProgressBar = styled(motion.div)<{ width: number }>(({ theme, width }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${width}%`,
    background: alpha(theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main,
        theme.palette.mode === 'dark' ? 0.2 : 0.1),
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
    letterSpacing: 1,
    userSelect: 'none',
}));

const VoteIcon = styled(CheckCircleIcon)(({ theme }) => ({
    marginLeft: 8,
    color: theme.palette.primary.main,
    transition: 'transform 0.3s ease',
    animation: 'pulse 1.2s infinite',
}));

interface PollingFormProps {
    eventId: string;
    activityId: string;
    activity: CulturalActivity;
}

export const PollingForm = ({ eventId, activityId, activity }: PollingFormProps) => {
    const theme = useTheme();
    const castVoteMutation = useCastVote(eventId, activityId);
    const { promptLogin } = useLoginPrompt();
    const { isAuthenticated, username, token } = useLogin();

    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [userVoted, setUserVoted] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isDragReady, setIsDragReady] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const { participants, pollData = [], showPoll, teams = [], isSoloPerformance } = activity;

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
        if (pollData.length > 0 && username) {
            const userVote = pollData.find(poll => poll.votes.includes(username));
            if (userVote) setUserVoted(userVote.teamId);
        } else {
            setUserVoted(null);
        }
    }, [pollData, username]);

    // Handle selecting a team
    const handleSelectTeam = (teamId: string) => {
        if (isAuthenticated && activity.canVote) {
            // Allow users to change their vote by selecting a new team
            setSelectedTeam(teamId === selectedTeam ? null : teamId);
        } else if (!isAuthenticated && activity.canVote) {
            promptLogin();
        }
    };

    // Process vote when thumb is dragged to end
    const handleDragEnd = async () => {
        const currentPercentage = dragPercentage.get();

        if (currentPercentage > 90 && selectedTeam && token) {
            castVoteMutation.mutate(selectedTeam, {
                onSuccess: () => {
                    setUserVoted(selectedTeam);
                    setError(null);
                    setTimeout(() => x.set(0), 300);
                },
                onError: (err: any) => {
                    const errorMessage = err?.message || 'Failed to submit vote. Please try again.';
                    setError(errorMessage);
                    setTimeout(() => x.set(0), 300);
                },
                onSettled: () => setTimeout(() => x.set(0), 10),
            });
        } else if (currentPercentage > 90 && selectedTeam && !token) {
            // If we somehow don't have a token but the user is authenticated
            setError("Authentication error. Please sign in again.");
            promptLogin();
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

    // Get sorted entries for voting, either participants (solo) or teams
    const getVotingEntries = () => {
        if (isSoloPerformance) {
            return participants.sort((a, b) => (getVoteData(b.usn).votes - getVoteData(a.usn).votes));
        } else {
            return teams.sort((a, b) => (getVoteData(b.id).votes - getVoteData(a.id).votes));
        }
    };

    if (!showPoll || (isSoloPerformance ? participants.length === 0 : teams.length === 0)) return null;

    return (
        <PollContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HowToVoteIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight="600">Audience Poll</Typography>
                </Box>
                {userVoted && (
                    <Tooltip title="You've already voted" enterTouchDelay={0}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 16,
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}>
                            <CheckCircleIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                            Vote Recorded
                        </Box>
                    </Tooltip>
                )}
            </Box>

            {/* Contribution note */}
            <Typography variant="caption" color="text.secondary">
                <span>* Audience vote contributes 10% to final result</span>
            </Typography>

            {/* Participant/Team Options */}
            <AnimatePresence>
                {getVotingEntries().map((entry) => {
                    // Each entry can be a participant (solo) or a team
                    const teamId = isSoloPerformance ? entry.usn : entry.id;
                    const name = entry.name;
                    const isSelected = selectedTeam === teamId;
                    const isUserVote = userVoted === teamId;
                    const { votes, percentage } = getVoteData(teamId);
                    const teamMembers = !isSoloPerformance ? activity.getTeamParticipants(teamId) : [];

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
                            <ProgressBar
                                width={percentage}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{
                                    duration: 1.2,
                                    delay: 0.3,
                                    ease: [0, 0.71, 0.2, 1.01]
                                }}
                            />

                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', zIndex: 1 }}>
                                {isSoloPerformance ? (
                                    <Avatar
                                        src={entry.profilePic}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            mr: 1.5,
                                            border: isUserVote ? `2px solid ${theme.palette.primary.main}` : 'none'
                                        }}
                                    />
                                ) : (
                                    <Badge
                                        badgeContent={
                                            <>
                                                <PeopleIcon sx={{ fontSize: 'inherit' }} />
                                                {teamMembers.length}
                                            </>
                                        }
                                        sx={{ mr: 1.5 }}
                                    >
                                        <Avatar
                                            src={teamMembers.length > 0 ? teamMembers[0].profilePic : undefined}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                border: isUserVote ? `2px solid ${theme.palette.primary.main}` : 'none'
                                            }}
                                        >
                                            {teamMembers.length === 0 && name.charAt(0)}
                                        </Avatar>
                                    </Badge>
                                )}

                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography variant="body1" fontWeight={isUserVote ? 600 : 400}>
                                            {name}
                                        </Typography>
                                        {isUserVote && <VoteIcon fontSize="small" sx={{ ml: 1, width: 18, height: 18 }} />}
                                    </Box>

                                    {!isSoloPerformance && teamMembers.length > 0 && (
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                display: 'block',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                minWidth: 0
                                            }}
                                        >
                                            {teamMembers.map(m => m.name).join(', ')}
                                        </Typography>
                                    )}

                                    {isSoloPerformance && entry.college && (
                                        <Typography variant="caption" color="text.secondary">
                                            {entry.college || 'FET, JU'}
                                        </Typography>
                                    )}
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    placeSelf: 'flex-end',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 40
                                }}>
                                    <Typography
                                        variant="body1"
                                        fontWeight={isUserVote ? 600 : 500}
                                        color={isUserVote ? 'primary.main' : 'text.primary'}
                                    >
                                        {votes}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.675rem' }}
                                    >
                                        {percentage.toFixed(0)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </OptionCard>
                    );
                })}
            </AnimatePresence>

            {/* Summary and Authentication Info */}
            {totalVotes > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                    Total votes: <b>{totalVotes}</b>
                </Typography>
            )}

            {/* Swipe to Vote Button */}
            <AnimatePresence>
                {selectedTeam && isAuthenticated && !castVoteMutation.isPending && (
                    <Box ref={containerRef} sx={{ width: '100%' }}>
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                                <Alert severity="error" sx={{ mt: 2, fontSize: '0.8rem' }} onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            </motion.div>
                        )}

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
                            Swipe to confirm your vote
                        </Typography>
                    </Box>
                )}

                {castVoteMutation.isPending && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 48, my: 2 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" sx={{ ml: 1.5 }}>Submitting vote...</Typography>
                    </Box>
                )}
            </AnimatePresence>

            {/* Authentication and Voting Info */}
            {((!isAuthenticated && activity.canVote) || !activity.canVote || activity.startTime > new Date()) && (
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
                        cursor: (!isAuthenticated && activity.canVote) ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': (!isAuthenticated && activity.canVote)
                            ? {
                                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  color: theme.palette.primary.main,
                              }
                            : {},
                    }}
                    onClick={(!isAuthenticated && activity.canVote) ? promptLogin : undefined}
                >
                    <LockIcon sx={{ fontSize: 16 }} />
                    {(!isAuthenticated && activity.canVote)
                        ? "Sign in to cast your vote!"
                        : activity.startTime > new Date()
                        ? `Voting starts ${activity.relativeStartTime}`
                        : "Voting is closed!"}
                </Typography>
            )}
        </PollContainer>
    );
};