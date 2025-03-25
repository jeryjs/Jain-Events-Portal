import { useState, useEffect, useRef } from 'react';
import { Box, Typography, Avatar, useTheme, alpha, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwipeIcon from '@mui/icons-material/SwipeRightAlt';
import LockIcon from '@mui/icons-material/Lock';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useCastVote } from '@hooks/useApi';
import { CulturalActivity } from '@common/models';

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

// Swipe button with better resistance and cleaner styling
const SwipeButton = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  height: 48,
  width: '100%',
  marginTop: theme.spacing(2),
  borderRadius: 24,
  overflow: 'hidden',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(90deg, ${theme.palette.primary.dark}, ${alpha(theme.palette.primary.main, 0.8)})`
    : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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
  marginTop: '16px',
  textAlign: 'center',
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { participants, pollData = [], showPoll } = activity;
  
  // Motion values with spring physics for resistance
  const x = useMotionValue(0);
  const springConfig = { damping: 40, stiffness: 400 }; // More resistance
  const springX = useSpring(x, springConfig); // Apply spring to smooth movement
  const dragProgress = useTransform(springX, [0, Math.max(containerWidth - 48, 1)], [0, 100]);
  const swipeOpacity = useTransform(dragProgress, [0, 60], [1, 0]);
  const lockOpacity = useTransform(dragProgress, [60, 90], [0, 1]);
  
  // Update container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Check authentication and user vote
  useEffect(() => {
    // Mock authentication - replace with real implementation
    const token = "mock-token";
    setIsAuthenticated(!!token);
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
    if (dragProgress.get() > 90 && selectedTeam) {
      castVoteMutation.mutate(selectedTeam, {
        onSuccess: () => {
          setUserVoted(selectedTeam);
          x.set(0);
        }
      });
    } else {
      // Snap back with spring physics if not completed
      x.set(0);
    }
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
                drag="x"
                dragConstraints={{ left: 0, right: Math.max(containerWidth - 48, 1) }}
                dragElastic={0.05} // Less elasticity for more resistance
                dragMomentum={false} // Disable momentum for more control
                onDragEnd={handleDragEnd}
                style={{ x: springX }} // Use spring physics for resistance
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

      {/* Summary */}
      {totalVotes > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
          Total votes: <b>{totalVotes}</b>
        </Typography>
      )}
      
      {!isAuthenticated && (
        <Typography 
          variant="caption" 
          color="primary" 
          sx={{ 
            display: 'block', 
            mt: 1, 
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' }
          }}
          onClick={() => console.log('Login clicked')}
        >
          Log in to vote
        </Typography>
      )}
    </PollContainer>
  );
};