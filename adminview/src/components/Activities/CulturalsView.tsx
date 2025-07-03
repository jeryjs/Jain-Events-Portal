import { CulturalActivity, Judge, Participant } from '@common/models';
import { Alert, Box, Card, CardContent, Chip, FormControlLabel, IconButton, Paper, Switch, Typography, Select, MenuItem, Stack, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { JudgesForm } from './CulturalsView/JudgesForm';
import ManageTeamsForm from './shared/ManageTeamsForm';

interface CulturalsViewProps {
  formData: CulturalActivity;
  setFormData: (data: CulturalActivity) => void;
}

export const CulturalsView = ({ formData, setFormData }: CulturalsViewProps) => {
  // Extract directly from formData
  const teams = formData.teams || [];
  const participants = formData.participants || [];
  const judges = formData.judges || [];
  const winners = formData.winners || [];

  // function to update the form data
  const handleChange = (field: keyof CulturalActivity, value: any) => {
    setFormData(CulturalActivity.parse({
      ...formData,
      [field]: value
    }));
  };

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    handleChange('participants', newParticipants);
  };

  const handleTeamsChange = (newTeams: { id: string, name: string }[]) => {
    handleChange('teams', newTeams);
  };

  const handleJudgesChange = (newJudges: Judge[]) => {
    handleChange('judges', newJudges);
  };

  // Handle adding a winner
  const addWinner = (teamId: string) => {
    // Calculate the next available rank
    const existingRanks = winners.map(w => w.rank).sort((a, b) => a - b);
    const nextRank = existingRanks.length > 0 ? existingRanks[existingRanks.length - 1] + 1 : 1;
    
    const newWinners = [...winners, { teamId, rank: nextRank }];
    handleChange('winners', newWinners);
  };

  // Handle removing a winner
  const removeWinner = (teamId: string) => {
    const newWinners = winners.filter(w => w.teamId !== teamId);
    
    // Re-rank the remaining winners to ensure ranks are consecutive
    const sortedWinners = [...newWinners].sort((a, b) => a.rank - b.rank);
    const rerankedWinners = sortedWinners.map((winner, index) => ({
      ...winner,
      rank: index + 1
    }));
    
    handleChange('winners', rerankedWinners);
  };

  // Handle changing a winner's rank
  const changeWinnerRank = (teamId: string, newRank: number) => {
    // Find the winner we're updating
    const winnerToUpdate = winners.find(w => w.teamId === teamId);
    if (!winnerToUpdate) return;
    
    const oldRank = winnerToUpdate.rank;
    
    // If trying to set the same rank, do nothing
    if (oldRank === newRank) return;
    
    // Create new winners array with updated rank
    let newWinners = winners.map(w => 
      w.teamId === teamId ? { ...w, rank: newRank } : w
    );
    
    // Handle duplicate ranks by shifting other winners
    if (newWinners.filter(w => w.rank === newRank).length > 1) {
      // If moving to a higher rank (smaller number), shift all winners between new and old rank down
      if (newRank < oldRank) {
        newWinners = newWinners.map(w => 
          w.teamId !== teamId && w.rank >= newRank && w.rank < oldRank 
            ? { ...w, rank: w.rank + 1 } 
            : w
        );
      } 
      // If moving to a lower rank (larger number), shift all winners between old and new rank up
      else {
        newWinners = newWinners.map(w => 
          w.teamId !== teamId && w.rank > oldRank && w.rank <= newRank 
            ? { ...w, rank: w.rank - 1 } 
            : w
        );
      }
    }
    
    handleChange('winners', newWinners);
  };

  // Get display name for a team or participant
  const getDisplayName = (id: string) => {
    if (formData.isSoloPerformance) {
      const participant = participants.find(p => p.usn === id);
      return participant ? `${participant.name} (${participant.usn})` : id;
    } else {
      const team = teams.find(t => t.id === id);
      return team ? team.name : id;
    }
  };

  // Get ranks for dropdown options
  const getRankOptions = () => {
    const maxRank = winners.length > 0 ? 
      Math.max(...winners.map(w => w.rank)) : 0;
    
    return Array.from({ length: maxRank + 1 }, (_, i) => i + 1);
  };

  // Get color for rank
  const getRankColor = (rank: number) => {
    switch(rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return '#cd7f32'; // bronze
      default: return 'gray';
    }
  };

  return (
    <Box>
      {/* Top Section with Configuration Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Event Configuration</Typography>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isSoloPerformance}
                onChange={(e) => handleChange('isSoloPerformance', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography fontWeight="medium">Solo Performance Mode</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.isSoloPerformance
                    ? "Each participant is treated as an individual entry (team of 1)"
                    : "Participants compete as teams"}
                </Typography>
              </Box>
            }
          />

          {formData.isSoloPerformance && (
            <Alert severity="info" sx={{ mt: 2 }}>
              In solo mode, each participant competes as an individual entry.
              Teams will be automatically created for each participant.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Judges Section */}
      <JudgesForm judges={judges} setJudges={handleJudgesChange} />

      {/* Manage Teams and Participants Section */}
      <ManageTeamsForm
        teams={teams}
        setTeams={handleTeamsChange}
        participants={participants}
        setParticipants={handleParticipantsChange}
        isSoloPerformance={formData.isSoloPerformance}
      />

      {/* Winners Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
          Winners
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Declare winners for this activity. Select {formData.isSoloPerformance ? "participants" : "teams"} and assign ranks.
            Ranks will be automatically managed for consistency.
          </Typography>
          
          {/* Current Winners */}
          {winners.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Current Winners:</Typography>
              <Stack spacing={1}>
                {[...winners]
                  .sort((a, b) => a.rank - b.rank)
                  .map((winner) => (
                    <Box 
                      key={winner.teamId} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Chip 
                        label={`Rank ${winner.rank}`} 
                        size="small" 
                        sx={{ 
                          mr: 2, 
                          bgcolor: getRankColor(winner.rank),
                          color: winner.rank <= 3 ? 'black' : 'white',
                          fontWeight: 'bold'
                        }} 
                      />
                      <Typography sx={{ flex: 1 }}>{getDisplayName(winner.teamId)}</Typography>
                      <Select
                        size="small"
                        value={winner.rank}
                        onChange={(e) => changeWinnerRank(winner.teamId, Number(e.target.value))}
                        sx={{ width: 100, mr: 1 }}
                      >
                        {getRankOptions().map(rank => (
                          <MenuItem key={rank} value={rank}>
                            Rank {rank}
                          </MenuItem>
                        ))}
                      </Select>
                      <IconButton 
                        size="small" 
                        onClick={() => removeWinner(winner.teamId)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))
                }
              </Stack>
            </Box>
          )}
          
          {/* Add Winner */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Add Winners:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {(formData.isSoloPerformance ? participants : teams)
                .filter(item => !winners.some(w => w.teamId === item.id))
                .map(item => {
                  return (
                    <Tooltip key={item.id} title={`Add as winner`}>
                      <Chip
                        label={item.name}
                        onClick={() => addWinner(item.id)}
                        clickable
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'action.hover',
                            boxShadow: 1
                          }
                        }}
                      />
                    </Tooltip>
                  );
                })
              }
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Audience Polling Section */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Audience Polling</Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.showPoll || false}
              onChange={(e) => handleChange('showPoll', e.target.checked)}
              color="primary"
            />
          }
          label="Enable audience polling for this activity"
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
          When enabled, users will be able to vote for their favorite {formData.isSoloPerformance ? "participants" : "teams"} in this activity.
          Voting results will be visible in real-time to the audience.
        </Typography>

        {formData.showPoll && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Polling Enabled
            </Typography>
            <Typography variant="body2">
              • Audience members will be able to cast votes during this activity.<br />
              • Each user can vote only once.<br />
              • Results will update in real-time.<br />
              • You can disable polling at any time.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
