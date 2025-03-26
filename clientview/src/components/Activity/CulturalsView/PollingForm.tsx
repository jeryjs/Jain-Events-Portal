import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, useTheme, alpha, CircularProgress, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwipeIcon from '@mui/icons-material/SwipeRightAlt';
import LockIcon from '@mui/icons-material/Lock';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useCastVote } from '@hooks/useApi';
import { CulturalActivity } from '@common/models';
import { useLoginPrompt } from '@components/shared';

const PollContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(3, 0),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.7)
    : alpha(theme.palette.background.paper, 0.6),
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 4px 24px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
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
      : theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.4)
        : alpha(theme.palette.background.default, 0.7),
  border: `1px solid ${userVote
    ? alpha(theme.palette.primary.main, 0.4)
    : alpha(theme.palette.divider, 0.1)
    }`,
  boxShadow: userVote
    ? `0 2px 12px ${alpha(theme.palette.primary.main, 0.15)}`
    : 'none',
}));

const ProgressBar = styled('div')<{ width: number }>(({ theme, width }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: `${width}%`,
  background: theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.dark, 0.2)
    : alpha(theme.palette.primary.main, 0.1),
  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 0,
}));

// Swipe button with glassmorphism effect
const SwipeButton = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  height: 48,
  width: '100%',
  marginTop: theme.spacing(2),
  borderRadius: 24,
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(90deg, ${alpha(theme.palette.primary.dark, 0.2)}, ${alpha(theme.palette.primary.main, 0.2)})`
    : `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.dark, 0.2)})`,
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark'
    ? `0 4px 24px ${alpha(theme.palette.common.black, 0.3)}`
    : `0 4px 24px ${alpha(theme.palette.common.black, 0.06)}`,
}));

// Thumb with improved resistance via springs
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
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [userVoted, setUserVoted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isDragReady, setIsDragReady] = useState(false);
  const { isAuthenticated, promptLogin, user } = useLoginPrompt();

  const containerRef = useRef<HTMLDivElement>(null);
  const { participants, pollData = [], showPoll } = activity;

  // Motion values for drag interactions
  const x = useMotionValue(0);

  // Calculate dragPercentage as percentage of container width
  const calculateDragPercentage = () => {
    if (!containerWidth || containerWidth <= 0) return 0;
    const maxDrag = containerWidth - 52; // Account for thumb width and padding
    const currentX = x.get();
    const percentage = (currentX / maxDrag) * 100;
    return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
  };

  // Transform functions that use the calculated percentage
  const dragPercentage = useTransform(x, (value) => {
    if (!containerWidth || containerWidth <= 0) return 0;
    const maxDrag = containerWidth - 52;
    return Math.min(Math.max((value / maxDrag) * 100, 0), 100);
  });

  const swipeOpacity = useTransform(dragPercentage, [0, 60], [1, 0]);
  const lockOpacity = useTransform(dragPercentage, [60, 90], [0, 1]);

  // Update container width on mount and resize with improved initialization
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.getBoundingClientRect().width;
        if (newWidth > 0) {
          setContainerWidth(newWidth);
          setIsDragReady(true);
          console.log("Container width set:", newWidth);
        }
      }
    };

    // Initial width calculation with multiple attempts
    const initializeWidth = () => {
      updateWidth();

      // If width is still 0, try again with a delay to ensure DOM is fully rendered
      if (containerWidth === 0) {
        const timerId = setTimeout(() => {
          updateWidth();

          // One more attempt after a longer delay
          if (containerWidth === 0) {
            setTimeout(updateWidth, 500);
          }
        }, 100);

        return () => clearTimeout(timerId);
      }
    };

    initializeWidth();

    // Set up resize observer for any future size changes
    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateWidth);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Additional effect to ensure we have the container width after selection changes
  useEffect(() => {
    if (selectedTeam && containerRef.current) {
      const checkWidth = () => {
        const newWidth = containerRef.current?.getBoundingClientRect().width || 0;
        if (newWidth > 0) {
          setContainerWidth(newWidth);
          setIsDragReady(true);
          console.log("Container width updated after selection:", newWidth);
        }
      };

      // Check width after a short delay to ensure component is rendered
      setTimeout(checkWidth, 50);
    }
  }, [selectedTeam]);

  // Reset x position on mount and when selection changes
  useEffect(() => {
    x.set(0);
  }, [selectedTeam, x]);

  // Check authentication and user vote
  useEffect(() => {
    // Mock authentication - replace with real implementation
    const userUsername = "admin";

    // Check if user has already voted
    if (pollData.length > 0 && userUsername) {
      const userVote = pollData.find(poll => poll.votes.includes(userUsername));
      if (userVote) {
        setUserVoted(userVote.teamId);
      }
    }
  }, [pollData]);

  // Select a team to vote for
  const handleSelectTeam = (teamId: string) => {
    if (userVoted || !isAuthenticated) return;
    setSelectedTeam(teamId === selectedTeam ? null : teamId);
  };

  // Process vote when thumb is dragged to end
  const handleDragEnd = () => {
    // Get current drag percentage
    const currentPercentage = calculateDragPercentage();
    console.log("Drag percentage on end:", currentPercentage);

    if (currentPercentage > 90 && selectedTeam) {
      castVoteMutation.mutate(selectedTeam, {
        onSuccess: () => {
          setUserVoted(selectedTeam);
          setError(null);
          // Force reset position
          setTimeout(() => x.set(0), 10);
        },
        onError: (error) => {
          setError('Failed to submit vote. Please try again.');
          // Force reset position
          setTimeout(() => x.set(0), 10);
        }
      });
    } else {
      // Animate back to start
      setTimeout(() => x.set(0), 10);
    }
  };

  // Track drag position for debugging
  const handleDrag = () => {
    const percentage = calculateDragPercentage();
    console.log(`Current drag percentage: ${percentage}, Container width: ${containerWidth}`);
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

      {/* Summary */}
      {totalVotes > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
          Total votes: <b>{totalVotes}</b>
        </Typography>
      )}

      {/* Swipe to Vote Button */}
      <AnimatePresence>
        {selectedTeam && isAuthenticated && !userVoted && !castVoteMutation.isPending && (
          <Box ref={containerRef} sx={{ width: '100%' }}>
            {/* Display error as alert below the button */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
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
                dragConstraints={{
                  left: 0,
                  right: containerWidth > 0 ? containerWidth - 52 : 100
                }}
                dragElastic={0.1}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                style={{ x }}
                animate={{ x: 0 }} // Ensures it returns to start position when needed
              >
                <SwipeIcon />
              </SwipeThumb>
            </SwipeButton>

            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block', mt: 1 }}>
              Your vote cannot be changed once cast
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