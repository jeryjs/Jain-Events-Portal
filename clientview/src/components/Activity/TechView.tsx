import { styled, Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Chip, Avatar } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Section = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(4),
}));

const WinnerCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  }
}));

const getRankColor = (rank) => {
  switch (rank) {
    case 1: return { color: '#FFD700', label: '1st Place' }; // Gold
    case 2: return { color: '#C0C0C0', label: '2nd Place' }; // Silver
    case 3: return { color: '#CD7F32', label: '3rd Place' }; // Bronze
    default: return { color: '#A0A0A0', label: `${rank}th Place` }; // Gray for others
  }
};

// Tech Activity View
export const TechView = ({ activity }) => {
    const winners = activity.winners || [];
    const hasWinners = winners.length > 0;
    
    const getParticipantOrTeamName = (teamId) => {
      // For solo performance, look for participant by USN
      if (activity.isSoloPerformance) {
        const participant = activity.participants?.find(p => p.usn === teamId);
        return participant ? participant.name : 'Unknown Participant';
      }
      
      // For team performance, find team name
      const team = activity.teams?.find(t => t.id === teamId);
      return team ? team.name : 'Unknown Team';
    };
    
    return (
      <Box>
        <Section>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Activity Details
          </Typography>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="body1">
              Immerse yourself in this tech-focused activity featuring innovative challenges and learning experiences.
            </Typography>
          </Paper>
        </Section>
        
        {/* Winners Section */}
        {hasWinners && (
          <Section>
            <Typography variant="h5" component="h2" fontWeight="bold" sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center' 
            }}>
              <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
              Winners
            </Typography>
            
            {winners
              .sort((a, b) => a.rank - b.rank)
              .map((winner) => {
                const rankInfo = getRankColor(winner.rank);
                return (
                  <WinnerCard key={winner.teamId} elevation={winner.rank === 1 ? 3 : 1}>
                    <Avatar 
                      sx={{ 
                        bgcolor: rankInfo.color, 
                        color: '#000', 
                        fontWeight: 'bold',
                        width: 40, 
                        height: 40,
                        mr: 2
                      }}
                    >
                      {winner.rank}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {getParticipantOrTeamName(winner.teamId)}
                      </Typography>
                      <Chip 
                        label={rankInfo.label}
                        size="small"
                        sx={{ 
                          bgcolor: rankInfo.color, 
                          color: '#000',
                          fontWeight: 'bold' 
                        }}
                      />
                    </Box>
                  </WinnerCard>
                );
              })}
          </Section>
        )}
        
        {/* For tech activities like coding or hackathons */}
        <Section>
          <Typography variant="h5" component="h2" fontWeight="bold" sx={{ mb: 2 }}>
            Participants
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>USN</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activity.participants?.map((participant, idx) => (
                  <TableRow key={participant.usn || idx}>
                    <TableCell>{participant.name}</TableCell>
                    <TableCell>{participant.usn.toUpperCase()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Section>
      </Box>
    );
  };
