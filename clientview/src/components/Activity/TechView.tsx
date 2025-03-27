import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import CodeIcon from '@mui/icons-material/Code';
import { Avatar, Box, Card, CardContent, Chip, Collapse, Divider, Fade, Grid, Grow, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography, Zoom, styled, useTheme } from "@mui/material";
import React from "react"; // Import React for useState
import { TechnicalActivity } from '@common/models';

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3), // Reduced margin
}));

// Enhanced Winner Card with hover effect and better styling
const WinnerCard = styled(Paper)<{ rank: number }>(({ theme, rank }) => {
  const rankInfo = getRankColor(theme, rank);
  return {
    padding: theme.spacing(1.5, 2),
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    borderLeft: `4px solid ${rankInfo.color}`,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: theme.shadows[rank === 1 ? 8 : rank === 2 ? 6 : 4],
    }
  };
});

// New styled component for participant cards
const ParticipantCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: theme.shadows[3],
  }
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  '&::after': {
    content: '""',
    display: 'block',
    height: 3,
    width: 40,
    backgroundColor: theme.palette.primary.main,
    marginLeft: theme.spacing(1),
    borderRadius: 3
  }
}));

// Pass theme to getRankColor to access palette
const getRankColor = (theme, rank) => {
  switch (rank) {
    case 1: return { color: '#FFD700', label: '1st Place' }; // Gold
    case 2: return { color: '#C0C0C0', label: '2nd Place' }; // Silver
    case 3: return { color: '#CD7F32', label: '3rd Place' }; // Bronze
    default: return { color: theme.palette.text.disabled, label: `${rank}th Place` }; // Use theme color
  }
};

// Tech Activity View
interface TechViewProps {
  activity: TechnicalActivity;
}

export const TechView = ({ activity }: TechViewProps) => {
  const theme = useTheme();
  const winners = activity.winners || [];
  const hasWinners = winners.length > 0;
  const participants = activity.participants || [];
  const teams = activity.teams || [];
  const isTeamEvent = !activity.isSoloPerformance && teams.length > 0;
  const isSoloEvent = activity.isSoloPerformance;

  const [openTeamId, setOpenTeamId] = React.useState<string | null>(null);

  const handleTeamClick = (teamId: string) => {
    setOpenTeamId(openTeamId === teamId ? null : teamId);
  };

  // Get full details of a participant or team based on ID
  const getParticipantOrTeamDetails = (teamId) => {
    if (activity.isSoloPerformance) {
      const participant = participants.find(p => p.usn === teamId);
      return participant ? {
        name: participant.name,
        college: participant.college,
        usn: participant.usn,
        branch: participant.branch,
        isSolo: true
      } : { name: 'Unknown Participant', isSolo: true };
    }
    const team = teams.find(t => t.id === teamId);
    if (team) {
      // Ensure participants have teamId property before filtering
      const teamMembers = participants.filter(p => 'teamId' in p && p.teamId === team.id);
      return {
        name: team.name,
        members: teamMembers,
        isSolo: false
      };
    }
    return { name: 'Unknown Team', isSolo: false };
  };

  const getTeamMembers = (teamId: string) => {
    // Ensure participants have teamId property before filtering
    return participants.filter(p => 'teamId' in p && p.teamId === teamId);
  }

  return (
    <Box>
      {/* Activity Details Section - Simplified */}
      <Fade in={true} timeout={500}>
        <Section>
          <Paper sx={{ p: 2, borderRadius: 1, mb: 3 }} variant="outlined">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<GroupsIcon fontSize="small" />}
                label={activity.isSoloPerformance ? "Solo Event" : "Team Event"}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<PersonIcon fontSize="small" />}
                label={`${participants.length} Participants`}
                size="small"
                variant="outlined"
              />
              {isTeamEvent && (
                <Chip
                  icon={<GroupsIcon fontSize="small" />}
                  label={`${teams.length} Teams`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        </Section>
      </Fade>

      {/* Winners Section - Enhanced */}
      {hasWinners && (
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Section>
            <SectionHeading variant="h6">
              <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
              Winners
            </SectionHeading>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {winners
                .sort((a, b) => a.rank - b.rank)
                .map((winner, index) => {
                  const rankInfo = getRankColor(theme, winner.rank); // Pass theme
                  const details = getParticipantOrTeamDetails(winner.teamId);

                  return (
                    <Grow
                      in={true}
                      key={winner.teamId}
                      style={{ transformOrigin: '0 0 0', transitionDelay: `${index * 50}ms` }}
                    >
                      <WinnerCard
                        variant="outlined"
                        rank={winner.rank}
                        elevation={winner.rank === 1 ? 3 : winner.rank === 2 ? 2 : 1}
                      >
                        <Avatar
                          sx={{
                            bgcolor: rankInfo.color,
                            color: theme.palette.getContrastText(rankInfo.color),
                            mr: 1.5,
                            width: 40, height: 40,
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            border: winner.rank === 1 ? '2px solid #FFD700' : 'none',
                          }}
                        >
                          {winner.rank}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {details.name}
                          </Typography>
                          {details.isSolo && (
                            <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {details.college && (
                                <Chip
                                  icon={<SchoolIcon fontSize="small" />}
                                  label={details.college}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                              {details.usn && (
                                <Chip
                                  icon={<BadgeIcon fontSize="small" />}
                                  label={details.usn.toUpperCase()}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                              {details.branch && (
                                <Chip
                                  icon={<CodeIcon fontSize="small" />}
                                  label={details.branch}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                          {!details.isSolo && details.members && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Team ({details.members.length} members)
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={rankInfo.label}
                          size="small"
                          sx={{
                            bgcolor: rankInfo.color,
                            color: theme.palette.getContrastText(rankInfo.color),
                            fontWeight: 'medium',
                            ml: 1
                          }}
                        />
                      </WinnerCard>
                    </Grow>
                  );
                })}
            </Box>
          </Section>
        </Zoom>
      )}

      {/* Solo Participants Section (Only for Solo Events) */}
      {isSoloEvent && (
        <Fade in={true} timeout={700} style={{ transitionDelay: '200ms' }}>
          <Section>
            <SectionHeading variant="h6">
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              Participants
            </SectionHeading>
            
            <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
              <List disablePadding>
                {participants.map((participant, index) => {
                  const isWinner = winners.some(w => w.teamId === participant.usn);
                  const winnerRank = isWinner ? winners.find(w => w.teamId === participant.usn)?.rank : null;
                  const rankInfo = winnerRank ? getRankColor(theme, winnerRank) : null;
                  
                  return (
                    <Grow 
                      key={participant.usn || index}
                      in={true} 
                      style={{ transformOrigin: '0 0 0', transitionDelay: `${index * 30}ms` }}
                    >
                      <ListItem 
                        divider
                        sx={{
                          py: 1.2,
                          transition: 'background-color 0.15s',
                          borderLeft: isWinner ? `4px solid ${rankInfo?.color}` : 'none',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={participant.profilePic}
                            sx={{ 
                              width: 40, 
                              height: 40,
                              bgcolor: isWinner ? rankInfo?.color : 'primary.main',
                              border: isWinner ? `2px solid ${rankInfo?.color}` : 'none',
                            }}
                          >
                            {participant.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight={500}>
                                {participant.name}
                              </Typography>
                              {isWinner && (
                                <Chip
                                  size="small"
                                  icon={<EmojiEventsIcon sx={{ fontSize: '0.8rem' }} />}
                                  label={rankInfo?.label}
                                  sx={{
                                    ml: 1,
                                    height: 24,
                                    bgcolor: rankInfo?.color,
                                    color: theme.palette.getContrastText(rankInfo?.color),
                                    fontWeight: 'bold',
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                              {participant.usn && (
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <BadgeIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                                  {participant.usn.toUpperCase()}
                                </Typography>
                              )}
                              {participant.branch && (
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CodeIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                                  {participant.branch}
                                </Typography>
                              )}
                              {participant.college && (
                                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }} noWrap>
                                  <SchoolIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                                  {participant.college}
                                </Typography>
                              )}
                            </Box>
                          }
                          secondaryTypographyProps={{
                            component: 'div',
                          }}
                        />
                      </ListItem>
                    </Grow>
                  );
                })}
              </List>
            </Paper>
          </Section>
        </Fade>
      )}

      {/* Teams Section (Only for Team Events) */}
      {isTeamEvent && (
        <Fade in={true} timeout={700} style={{ transitionDelay: '200ms' }}>
          <Section>
            <SectionHeading variant="h6">
              <GroupsIcon sx={{ mr: 1, color: 'action.active' }} />
              Teams
            </SectionHeading>
            <Paper variant="outlined" sx={{ borderRadius: 1 }}>
              <List dense disablePadding>
                {teams.map((team, index) => {
                  const members = getTeamMembers(team.id);
                  const isOpen = openTeamId === team.id;
                  const isWinner = winners.some(w => w.teamId === team.id);
                  const winnerRank = isWinner ? winners.find(w => w.teamId === team.id)?.rank : null;
                  const rankInfo = winnerRank ? getRankColor(theme, winnerRank) : null;

                  return (
                    <React.Fragment key={team.id}>
                      <ListItem
                        divider
                        onClick={() => handleTeamClick(team.id)}
                        sx={{
                          transition: 'background-color 0.2s',
                          borderLeft: isWinner ? `4px solid ${rankInfo?.color}` : 'none',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: isWinner ? rankInfo?.color : 'primary.main',
                              color: isWinner ? 'black' : 'white',
                              fontWeight: isWinner ? 'bold' : 'normal',
                            }}
                          >
                            {isWinner ? winnerRank : <GroupsIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="medium">
                                {team.name}
                              </Typography>
                              {isWinner && (
                                <Chip
                                  size="small"
                                  label={rankInfo?.label}
                                  sx={{
                                    ml: 1,
                                    bgcolor: rankInfo?.color,
                                    color: 'black',
                                    fontWeight: 'bold',
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={`${members.length} member${members.length !== 1 ? 's' : ''}`}
                        />
                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>

                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 2, pr: 2, pt: 1, pb: 2, bgcolor: 'background.default' }}>
                          <List dense>
                            {members.map((member, i) => (
                              <ListItem key={member.usn || i} sx={{ pl: 3 }}>
                                <ListItemAvatar>
                                  <Avatar src={member.profilePic} sx={{ width: 30, height: 30 }}>
                                    {member.name.charAt(0)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={member.name}
                                  secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                      {member.usn && (
                                        <Typography variant="caption">
                                          <BadgeIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                                          {member.usn.toUpperCase()}
                                        </Typography>
                                      )}
                                      {member.branch && (
                                        <Typography variant="caption">
                                          <CodeIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                                          {member.branch}
                                        </Typography>
                                      )}
                                      {member.college && (
                                        <Typography variant="caption" noWrap sx={{ maxWidth: '100%' }} title={member.college}>
                                          <SchoolIcon fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                                          {member.college}
                                        </Typography>
                                      )}
                                    </Box>
                                  }
                                  secondaryTypographyProps={{
                                    component: 'div',
                                  }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Collapse>
                    </React.Fragment>
                  );
                })}
              </List>
            </Paper>
          </Section>
        </Fade>
      )}
    </Box>
  );
};