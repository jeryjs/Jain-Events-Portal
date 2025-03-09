import { useState } from 'react';
import { Box, Paper, Typography, Button, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid, Chip, Chip } from '@mui/material';
import { TeamsForm } from './TeamsForm';
import { ParticipantsForm } from '../ParticipantsForm';
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
  };

  const handleGameChange = (key: keyof Football, value: any) => {
    handleChange('game', { ...game, [key]: value });
  };

  const [teams, setTeams] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  const handleTeamsChange = (newTeams: any[]) => {
    setTeams(newTeams);
  };

  const handleParticipantsChange = (newParticipants: any[]) => {
    setParticipants(newParticipants);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Football Activity Setup</Typography>
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Teams" />
        <Tab label="Participants" />
        <Tab label="Match Details" />
      </Tabs>

      {/* <Box sx={{ mt: 2 }}>
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
      </Box> */}
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
    setFormData({ ...formData, game: { ...formData.game, stats: newStats } });
  };

  return (
    <Grid container spacing={2}>
      {teams.map((team, teamIndex) => (
        <Grid item xs={12} sm={6} key={team.id}>
          <Card>
            <CardContent>
              <Typography variant="h6">{team.name}</Typography>
              <FootballTeamStats team={team} teamStats={stats[teamIndex] || {}} participants={participants.filter(p => p.teamId === team.id)} updateStats={(updatedTeamStats) => {
                const newStats = [...stats];
                newStats[teamIndex] = updatedTeamStats;
                updateStats(newStats);
              }} />
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
  const addStat = (statType: string, participantId: string, position?: string) => {
    if (!participantId) return;
    const updatedStats = {
      ...teamStats,
      [statType]: [...(teamStats[statType] || []), position ? { playerId: participantId, position } : { playerId: participantId }],
    };
    updateStats(updatedStats);
  };

  return (
    <Box>
      {["goals", "penaltyGoals", "ownGoals", "assists", "redCards", "yellowCards"].map(statType => (
        <StatInput key={statType} label={statType} participants={participants} teamStats={teamStats} updateStats={updateStats} />
      ))}
      <StatInput label="positions" participants={participants} teamStats={teamStats} updateStats={updateStats} isPosition />
    </Box>
  );
};

interface StatInputProps {
  label: string;
  participants: any[];
  teamStats: any;
  updateStats: (stats: any) => void;
  isPosition?: boolean;
}

const StatInput = ({ label, participants, teamStats, updateStats, isPosition }: StatInputProps) => {
  const addStat = (statType: string, participantId: string, position?: string) => {
    if (!participantId) return;
    const updatedStats = {
      ...teamStats,
      [statType]: [...(teamStats[statType] || []), position ? { playerId: participantId, position } : { playerId: participantId }],
    };
    updateStats(updatedStats);
  };
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>{label.replace(/([A-Z])/g, ' $1')}</Typography>
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Player</InputLabel>
        <Select
          label="Player"
          onChange={(e) => addStat(label, e.target.value as string, isPosition ? "Player" : undefined)}
          value=""
        >
          {participants.map(p => (
            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {isPosition && (
        <FormControl size="small" sx={{ minWidth: 120, ml: 1 }}>
          <InputLabel>Position</InputLabel>
          <Select
            label="Position"
            onChange={(e) => addStat(label, e.target.value as string, e.target.value)}
            value=""
          >
            {["Player", "Benched", "Goalkeeper", "Defender", "Midfielder", "Forward"].map(pos => (
              <MenuItem key={pos} value={pos}>{pos}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default FootballForm;
