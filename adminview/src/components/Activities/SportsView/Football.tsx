import { useState } from 'react';
import { Box, Paper, Typography, Button, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { TeamsForm } from './TeamsForm';
import { ParticipantsForm } from '../ParticipantsForm';
import { EventType } from '@common/constants';
import { SportsActivity } from '@common/models';
import { Football, Sport } from '@common/models/sports/SportsActivity';

interface FootballFormProps {
  formData: SportsActivity<Sport>;
  setFormData: (data: SportsActivity<Sport>) => void;
}

export const FootballForm = ({ formData, setFormData }: FootballFormProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const game = formData.game as Football;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChange = (key: keyof SportsActivity<Sport>, value: any) => {
    setFormData(SportsActivity.parse({ ...formData, [key]: value }));
  }

  const handleGameChange = (key: keyof Football, value: any) => {
    handleChange('game', { ...game, [key]: value });
  }

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Football Activity Setup</Typography>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Teams" />
        <Tab label="Participants" />
        <Tab label="Match Details" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && (
          <TeamsForm
            teams={teams}
            setTeams={handleTeamsChange}
          />
        )}
        {activeTab === 1 && (
          <ParticipantsForm
            participants={participants}
            setParticipants={handleParticipantsChange}
            teams={teams}
          />
        )}
        {activeTab === 2 && (
          <FootballMatchDetails
            formData={formData}
            setFormData={setFormData}
            teams={teams}
            participants={participants}
            stats={stats}
            setStats={setStats}
          />
        )}
      </Box>
    </Paper>
  );
};

interface MatchDetailsProps {
  formData: any;
  setFormData: (data: any) => void;
  teams: any[];
  participants: any[];
  stats: any[];
  setStats: (stats: any[]) => void;
}

const FootballMatchDetails = ({ formData, setFormData, teams, participants, stats, setStats }: MatchDetailsProps) => {
  const updateStats = (newStats: any[]) => {
    setStats(newStats);
    setFormData({
      ...formData,
      game: {
        ...formData.game,
        stats: newStats
      }
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>Match Statistics</Typography>
      </Grid>

      {teams.map((team, teamIndex) => (
        <Grid item xs={12} sm={6} key={team.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{team.name}</Typography>
              <FootballTeamStats
                team={team}
                teamStats={stats[teamIndex] || {}}
                participants={participants.filter(p => p.teamId === team.id)}
                updateStats={(updatedTeamStats) => {
                  const newStats = [...stats];
                  newStats[teamIndex] = updatedTeamStats;
                  updateStats(newStats);
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

interface TeamStatsProps {
  team: any;
  teamStats: any;
  participants: any[];
  updateStats: (stats: any) => void;
}

const FootballTeamStats = ({ team, teamStats, participants, updateStats }: TeamStatsProps) => {
  // Helper function to add stat
  const addStat = (statType: string, participantId: string) => {
    if (!participantId) return;

    const updatedStats = {
      ...teamStats,
      [statType]: [...(teamStats[statType] || []), participantId]
    };

    updateStats(updatedStats);
  };

  return (
    <Box>
      {['goals', 'assists', 'redCards', 'yellowCards'].map(statType => (
        <Box key={statType} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
            {statType.replace(/([A-Z])/g, ' $1')}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            {(teamStats[statType] || []).map((participantId: string, idx: number) => {
              const participant = participants.find(p => p.id === participantId);
              return (
                <Chip
                  key={`${participantId}-${idx}`}
                  label={participant?.name || 'Unknown'}
                  onDelete={() => {
                    const newStats = [...teamStats[statType]];
                    newStats.splice(idx, 1);
                    updateStats({
                      ...teamStats,
                      [statType]: newStats
                    });
                  }}
                />
              );
            })}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Player</InputLabel>
              <Select
                label="Player"
                onChange={(e) => addStat(statType, e.target.value as string)}
                value=""
              >
                {participants.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const select = document.querySelector(`select[name="${statType}-select"]`) as HTMLSelectElement;
                if (select && select.value) {
                  addStat(statType, select.value);
                  select.value = '';
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default FootballForm;