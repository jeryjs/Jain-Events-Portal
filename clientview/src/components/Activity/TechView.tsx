import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { Avatar, Box, Chip, Collapse, Divider, Fade, Grow, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography, Zoom, styled, useTheme } from "@mui/material";
import React from "react"; // Import React for useState

const Section = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3), // Reduced margin
}));

// Simplified Winner Card - rely on default Paper styles + border for rank
const WinnerCard = styled(Paper)<{ rank: number }>(({ theme, rank }) => {
  const rankInfo = getRankColor(theme, rank); // Pass theme here
  return {
    padding: theme.spacing(1.5, 2), // Adjusted padding
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius,
    borderLeft: `4px solid ${rankInfo.color}`, // Use border for rank indication
    // Removed hover effects for simplicity
  };
});

const SectionHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 600, // Slightly bolder
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
export const TechView = ({ activity }) => {
  const theme = useTheme();
  const winners = activity.winners || [];
  const hasWinners = winners.length > 0;
  const participants = activity.participants || [];
  const teams = activity.teams || [];
  const isTeamEvent = !activity.isSoloPerformance && teams.length > 0;

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

      {/* Winners Section - Simplified */}
      {hasWinners && (
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Section>
            <SectionHeading variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
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
                        variant="outlined" // Use outlined variant
                        rank={winner.rank}
                      >
                        <Avatar
                          sx={{
                            bgcolor: rankInfo.color,
                            color: theme.palette.getContrastText(rankInfo.color),
                            mr: 1.5, // Adjusted margin
                            width: 32, height: 32, // Smaller avatar
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {winner.rank}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight="medium">
                            {details.name}
                          </Typography>
                          {details.isSolo && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {details.college || 'Unknown College'}
                              {details.usn && ` - ${details.usn.toUpperCase()}`}
                            </Typography>
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

      {/* Teams Section (Only for Team Events) */}
      {isTeamEvent && (
        <Fade in={true} timeout={700} style={{ transitionDelay: '200ms' }}>
          <Section>
            <SectionHeading variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupsIcon sx={{ mr: 1, color: 'action.active' }} />
              Teams
            </SectionHeading>
            <Paper variant="outlined" sx={{ borderRadius: 1 }}>
              <List dense disablePadding>
                {teams.map((team, index) => {
                  const members = getTeamMembers(team.id);
                  const isOpen = openTeamId === team.id;
                  return (
                    <React.Fragment key={team.id}>
                      <ListItem onClick={() => handleTeamClick(team.id)}>
                        <ListItemText
                          primary={team.name}
                          secondary={`${members.length} member${members.length !== 1 ? 's' : ''}`}
                        />
                        {isOpen ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding dense sx={{ pl: 4 }}>
                          {members.map((member) => (
                            <ListItem key={member.usn}>
                              <ListItemAvatar sx={{ minWidth: 32 }}>
                                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                  {member.name.charAt(0)}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={member.name}
                                secondary={`${member.usn?.toUpperCase()} ${member.branch && member.college ? ' • ' : ''} ${member.branch ? member.branch : ''} ${member.branch && member.college ? '•' : ''} ${member.college ? member.college : ''}`}
                                primaryTypographyProps={{ variant: 'body2' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />

                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                      {index < teams.length - 1 && <Divider />}
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