import { Participant, TechnicalActivity } from '@common/models';
import { Alert, Autocomplete, Box, Card, CardContent, Chip, FormControlLabel, IconButton, MenuItem, Paper, Select, Stack, Switch, TextField, Tooltip, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageTeamsForm from './shared/ManageTeamsForm';

interface TechnicalViewProps {
  formData: TechnicalActivity;
  setFormData: (data: TechnicalActivity) => void;
}

export const TechnicalView = ({ formData, setFormData }: TechnicalViewProps) => {
  const teams = formData.teams || [];
  const participants = formData.participants || [];
  const winners = formData.winners || [];

  const handleChange = (field: keyof TechnicalActivity, value: any) => {
    setFormData(TechnicalActivity.parse({ ...formData, [field]: value }));
  };

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    handleChange('participants', newParticipants);
  };

  const handleTeamsChange = (newTeams: { id: string; name: string }[]) => {
    handleChange('teams', newTeams);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'gold';
      case 2: return 'silver';
      case 3: return '#cd7f32'; // bronze
      default: return '#555555'; // dark gray for other ranks
    }
  };

  const getRankOptions = () => {
    return [1, 2, 3, 4, 5].filter(rank =>
      !winners.some(w => w.rank === rank) ||
      winners.find(w => w.teamId === winners.find(win => win.rank === rank)?.teamId)?.rank === rank
    );
  };

  const getDisplayName = (teamId: string) => {
    if (formData.isSoloPerformance) {
      const participant = participants.find(p => p.usn === teamId);
      return participant ? participant.name : 'Unknown Participant';
    } else {
      const team = teams.find(t => t.id === teamId);
      return team ? team.name : 'Unknown Team';
    }
  };

  const addWinner = (teamId: string) => {
    const newRank = winners.length > 0
      ? Math.max(...winners.map(w => w.rank)) + 1
      : 1;

    const newWinners = [
      ...winners,
      { teamId, rank: newRank }
    ];

    handleChange('winners', newWinners);
  };

  const removeWinner = (teamId: string) => {
    const newWinners = winners.filter(w => w.teamId !== teamId);
    handleChange('winners', newWinners);
  };

  const changeWinnerRank = (teamId: string, newRank: number) => {
    const existingWinnerWithRank = winners.find(w => w.rank === newRank);

    const newWinners = winners.map(winner => {
      if (winner.teamId === teamId) {
        return { ...winner, rank: newRank };
      } else if (existingWinnerWithRank && winner.teamId === existingWinnerWithRank.teamId) {
        const oldRank = winners.find(w => w.teamId === teamId)?.rank || 0;
        return { ...winner, rank: oldRank };
      }
      return winner;
    });

    handleChange('winners', newWinners);
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
                <Typography fontWeight="medium">Solo Activity</Typography>
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
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Participants and Teams Section */}
      <ManageTeamsForm
        teams={teams}
        setTeams={handleTeamsChange}
        participants={participants}
        setParticipants={handleParticipantsChange}
        isSoloPerformance={formData.isSoloPerformance || false} />

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
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>Add Winner:</Typography>
            <Autocomplete
              options={(formData.isSoloPerformance ? participants : teams).filter(
                item => !winners.some(w => w.teamId.trim() === item.id.trim())
              )}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Find Participant" variant="outlined" size="small" />
              )}
              onChange={(_, value) => {
                if (value) {
                  addWinner(value.id);
                }
              }}
              clearOnBlur
              renderOption={(props, option) => (
                <li {...props}>
                  {option.name}
                </li>
              )}
            />
          </Box>
        </Box>
      </Paper>
    </Box >
  );
};