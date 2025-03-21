import { Box, Typography, Avatar, useTheme, alpha, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwipeIcon from '@mui/icons-material/SwipeRightAlt';
import LockIcon from '@mui/icons-material/Lock';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useCastVote } from '@hooks/useApi';
import { CulturalActivity } from '@common/models';

// Styled components for a truly premium UI
const PollContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(4, 0),
  padding: theme.spacing(2, 0),
  borderRadius: theme.shape.borderRadius * 2,
}));

const PollHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  '& svg': {
    fontSize: 30,
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main
  },
  '& h5': {
    fontWeight: 600,
    letterSpacing: '0.5px'
  }
}));

const OptionCard = styled(motion.div)<{ selected?: boolean, userVote?: boolean }>(({ theme, selected, userVote }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  cursor: 'pointer',
  background: userVote 
    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.primary.main, 0.15)})`
    : selected
      ? alpha(theme.palette.primary.light, 0.1)
      : alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${userVote 
    ? theme.palette.primary.main 
    : selected 
      ? alpha(theme.palette.primary.main, 0.5)
      : alpha(theme.palette.divider, 0.1)
  }`,
  boxShadow: userVote || selected 
    ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.2)}` 
    : '0 2px 10px rgba(0,0,0,0.05)',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    boxShadow: userVote 
      ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.25)}`
      : selected
        ? `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`
        : '0 5px 15px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
  }
}));

// Background progress bar that fills the entire card
const ProgressBackground = styled('div')<{ width: number, selected?: boolean, userVote?: boolean }>(
  ({ theme, width, selected, userVote }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${width}%`,
    background: userVote
      ? `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.light, 0.1)})`
      : selected
        ? alpha(theme.palette.primary.main, 0.1)
        : alpha(theme.palette.grey[200], 0.3),
    borderTopLeftRadius: theme.shape.borderRadius * 2,
    borderBottomLeftRadius: theme.shape.borderRadius * 2,
    transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    zIndex: 0,
  })
);

const VoteCount = styled(Typography)<{ userVote?: boolean }>(({ theme, userVote }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  fontWeight: 600,
  fontSize: '0.85rem',
  color: userVote ? theme.palette.primary.main : theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  '& .icon': {
    marginLeft: theme.spacing(0.5),
    fontSize: '1rem'
  }
}));

// Elegant swipe button with smooth reveal effect
const SwipeButtonContainer = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  height: 56,
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(1),
  borderRadius: 28,
  overflow: 'hidden',
  boxShadow: `0 5px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const SwipeTrack = styled('div')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const SwipeThumbContainer = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  width: 56,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
});

const SwipeThumb = styled(motion.div)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: theme.shadows[2],
  color: theme.palette.primary.main,
  '& svg': {
    fontSize: 24,
  }
}));

// Message that appears as user swipes
const SwipeMessage = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 600,
  letterSpacing: 1,
  zIndex: 2,
}));

// Overlay that reveals as user swipes
const LockMessageOverlay = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingRight: theme.spacing(3),
  background: `linear-gradient(90deg, transparent, ${theme.palette.primary.dark})`,
  color: '#fff',
  fontWeight: 600,
  zIndex: 2,
  '& svg': {
    marginRight: theme.spacing(1),
  }
}));

const LoginPrompt = styled(motion.button)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1.5),
  right: theme.spacing(1.5),
  background: 'none',
  border: 'none',
  color: alpha(theme.palette.text.secondary, 0.7),
  fontSize: '0.75rem',
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha(theme.palette.background.paper, 0.5),
    color: theme.palette.text.primary,
  }
}));

const ResultsSummary = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 1),
  marginTop: theme.spacing(2),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  color: theme.palette.text.secondary,
  '& strong': {
    color: theme.palette.text.primary,
    fontWeight: 600,
  }
}));

interface PollingFormProps {
  eventId: string;
  activityId: string;
  activity: CulturalActivity
}

export const PollingForm = ({ eventId, activityId, activity }: PollingFormProps) => {
  const theme = useTheme();
  const castVoteMutation = useCastVote(eventId, activityId);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [userVoted, setUserVoted] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { participants, pollData = [], showPoll } = activity;
  
  // Motion values for the swipe interaction
  const x = useMotionValue(0);
  const dragProgress = useTransform(x, [0, 250], [0, 100]);
  const opacity = useTransform(dragProgress, [0, 60], [1, 0]);
  const lockOpacity = useTransform(dragProgress, [50, 90], [0, 1]);
  const thumbScale = useTransform(dragProgress, [0, 100], [1, 1.1]);
  const containerBackground = useTransform(
    dragProgress,
    [0, 90],
    [
      `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.dark})`
    ]
  );

  // Check authentication and user vote
  useEffect(() => {
    // For real implementation: const token = localStorage.getItem('auth_token');
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6MywiaWF0IjoxNzQyNDM5OTA2LCJleHAiOjE3NDI1MjYzMDZ9.NUIy-0ILujq_loVYKMhK7U5f8zcQexFFDG2u2yQMJPw"; // Mock token for testing
    setIsAuthenticated(!!token);

    // For real implementation: const userUsername = localStorage.getItem('user_usn');
    const userUsername = "admin"; // Mock username for testing

    // Find if user has already voted
    if (pollData.length > 0 && userUsername) {
      const userVote = pollData.find(poll => poll.votes.includes(userUsername));
      if (userVote) {
        setUserVoted(userVote.teamId);
      }
    }
  }, [activityId, pollData]);

  // Handle team selection
  const handleSelectTeam = (teamId: string) => {
    if (userVoted || !isAuthenticated || castVoteMutation.isPending) return;
    setSelectedTeam(teamId === selectedTeam ? null : teamId);
  };

  // Handle vote submission when swipe completes
  const handleDragEnd = () => {
    if (dragProgress.get() > 90 && selectedTeam && !userVoted && !castVoteMutation.isPending) {
      castVoteMutation.mutate(selectedTeam, {
        onSuccess: () => {
          setUserVoted(selectedTeam);
          x.set(0); // Reset position
        }
      });
    } else {
      // Reset position if not completed
      x.set(0);
    }
  };

  // Calculate vote statistics
  const getTotalVotes = () => {
    return pollData.reduce((sum, team) => sum + team.votes.length, 0) || 0;
  };
  
  const getVotePercentage = (teamId: string) => {
    const totalVotes = getTotalVotes();
    if (totalVotes === 0) return 0;
    
    const teamVotes = pollData.find(p => p.teamId === teamId)?.votes.length || 0;
    return (teamVotes / totalVotes) * 100;
  };
  
  const getVoteCount = (teamId: string) => {
    return pollData.find(p => p.teamId === teamId)?.votes.length || 0;
  };

  // Get participant name from USN
  const getParticipantName = (usn: string) => {
    return participants.find(p => p.usn === usn)?.name || 'Unknown';
  };

  if (!showPoll || participants.length === 0) {
    return null;
  }

  return (
    <PollContainer>
      <PollHeader>
        <HowToVoteIcon />
        <Typography variant="h5">Audience Poll</Typography>
      </PollHeader>

      {/* Participant Options */}
      <AnimatePresence>
        {participants.sort((a, b) => {
          // Sort by votes (descending)
          const votesA = getVoteCount(a.usn);
          const votesB = getVoteCount(b.usn);
          return votesB - votesA;
        }).map((participant, index) => {
          const teamId = participant.usn;
          const isSelected = selectedTeam === teamId;
          const isUserVote = userVoted === teamId;
          const votePercentage = getVotePercentage(teamId);
          const votes = getVoteCount(teamId);
          
          return (
            <OptionCard
              key={teamId}
              selected={isSelected}
              userVote={isUserVote}
              onClick={() => handleSelectTeam(teamId)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: isUserVote ? 1.02 : 1,
              }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                stiffness: 120,
                damping: 20
              }}
              whileHover={{ scale: isUserVote ? 1.02 : 1.01 }}
              whileTap={{ scale: 0.98 }}
              style={{ 
                opacity: userVoted && !isUserVote ? 0.8 : 1 
              }}
            >
              {/* Progress background fills entire card */}
              <ProgressBackground 
                width={votePercentage} 
                selected={isSelected}
                userVote={isUserVote}
              />
              
              {/* Content appears above background */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                zIndex: 1, 
                position: 'relative'
              }}>
                <Avatar
                  src={participant.profilePic || `https://eu.ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&size=60`}
                  sx={{ 
                    width: 52, 
                    height: 52, 
                    mr: 2,
                    border: isUserVote ? `2px solid ${theme.palette.primary.main}` : 'none',
                    boxShadow: isUserVote ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}` : 'none'
                  }}
                />
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: isUserVote ? 700 : 500,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {participant.name}
                    {isUserVote && (
                      <CheckCircleIcon 
                        color="primary"
                        sx={{ ml: 1, width: 18, height: 18 }}
                      />
                    )}
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    {participant.college || 'FET, JU'}
                  </Typography>
                </Box>
                
                {(userVoted || !isAuthenticated) && (
                  <VoteCount userVote={isUserVote}>
                    {votes}
                    <Typography 
                      component="span" 
                      variant="body2" 
                      sx={{ 
                        ml: 0.5,
                        fontSize: '0.75rem',
                        opacity: 0.8
                      }}
                    >
                      votes
                    </Typography>
                  </VoteCount>
                )}
              </Box>
            </OptionCard>
          );
        })}
      </AnimatePresence>

      {/* Swipe to Vote Button - Only show when a team is selected and user hasn't voted */}
      <AnimatePresence mode="wait">
        {selectedTeam && isAuthenticated && !userVoted && !castVoteMutation.isPending && (
          <motion.div
            key="swipe-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <SwipeButtonContainer style={{ background: containerBackground }}>
              <SwipeTrack>
                {/* Swipe message that fades out as user swipes */}
                <SwipeMessage style={{ opacity }}>
                  SWIPE TO VOTE
                </SwipeMessage>
                
                {/* Lock message that fades in as user swipes */}
                <LockMessageOverlay style={{ opacity: lockOpacity }}>
                  <LockIcon /> VOTE CANNOT BE CHANGED
                </LockMessageOverlay>
              </SwipeTrack>
              
              {/* Swipe thumb */}
              <SwipeThumbContainer
                drag="x"
                dragConstraints={{ left: 0, right: 250 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                style={{ x }}
              >
                <SwipeThumb style={{ scale: thumbScale }}>
                  <SwipeIcon />
                </SwipeThumb>
              </SwipeThumbContainer>
            </SwipeButtonContainer>
            
            <Typography 
              variant="caption" 
              align="center" 
              color="text.secondary"
              sx={{ 
                display: 'block',
                mt: 1.5,
                opacity: 0.8
              }}
            >
              10% of audience votes will be considered for winner score. Your vote cannot be changed once cast.
            </Typography>
          </motion.div>
        )}
        
        {/* Show loading state while voting */}
        {castVoteMutation.isPending && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              height: 56, 
              my: 3 
            }}
          >
            <CircularProgress size={32} color="primary" />
            <Typography 
              variant="body2" 
              sx={{ ml: 2, fontWeight: 500 }}
            >
              Submitting your vote...
            </Typography>
          </Box>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {(userVoted || !isAuthenticated) && (
        <ResultsSummary>
          <Typography variant="body2">
            Total votes: <strong>{getTotalVotes()}</strong>
          </Typography>
          
          {userVoted && (
            <Typography variant="body2">
              Your vote: <strong>{getParticipantName(userVoted)}</strong>
            </Typography>
          )}
        </ResultsSummary>
      )}

      {/* Login Prompt */}
      {!isAuthenticated && (
        <LoginPrompt
          onClick={() => console.log('Login clicked')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login to vote
        </LoginPrompt>
      )}
    </PollContainer>
  );
};

export default PollingForm;