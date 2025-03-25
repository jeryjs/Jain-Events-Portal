import { CulturalActivity, Judge, Participant } from '@common/models';
import { Box, FormControlLabel, Paper, Switch, Typography, Alert, Card, CardContent, Divider } from '@mui/material';
import { memo, useState } from 'react';
import { ParticipantsForm } from '.';
import { JudgesForm } from './CulturalsView/JudgesForm';
import { TeamsForm } from './shared/TeamsForm';

interface CulturalsViewProps {
  formData: CulturalActivity;
  setFormData: (data: CulturalActivity) => void;
}

// Summary section to avoid re-renders
const SummarySection = memo<{ label: string, count: number }>(({ label, count }) => (
  <Typography>
    {count === 0
      ? `No ${label} configured yet`
      : `${count} ${label}${count > 1 ? 's' : ''} configured`}
  </Typography>
));

export const CulturalsView = ({ formData, setFormData }: CulturalsViewProps) => {
  // UI state for solo performance toggle - default to isSoloPerformance from formData or true
  const [isSoloPerformanceUI, setIsSoloPerformanceUI] = useState<boolean>(formData.isSoloPerformance ?? true);

  // Extract directly from formData
  const teams = formData.teams || [];
  const participants = formData.participants || [];
  const judges = formData.judges || [];

  // function to update the form data
  const handleChange = (field: keyof CulturalActivity, value: any) => {
    setFormData(CulturalActivity.parse({
      ...formData,
      [field]: value
    }));
  };

  const handleSoloPerformanceToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIsSoloPerformance = event.target.checked;
    setIsSoloPerformanceUI(newIsSoloPerformance);

    if (newIsSoloPerformance) {
      // In solo mode, create teams from participants
      const soloTeams = participants.map(p => ({
        id: p.usn || `participant-${p.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: p.name
      }));

      // Keep existing teams and add solo teams without duplicates
      const existingTeamNames = new Set(teams.map(t => t.name));
      const uniqueSoloTeams = soloTeams.filter(t => !existingTeamNames.has(t.name));
      const mergedTeams = [...teams, ...uniqueSoloTeams];

      // Update form data with merged teams and solo flag
      setFormData(CulturalActivity.parse({
        ...formData,
        teams: mergedTeams,
        isSoloPerformance: true
      }));
    } else {
      // Just update the solo flag, keep teams intact
      setFormData(CulturalActivity.parse({
        ...formData,
        isSoloPerformance: false
      }));
    }
  };

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    // In solo mode, we need to update teams at the same time as participants
    // to avoid race conditions between state updates
    if (isSoloPerformanceUI) {
      const soloTeams = newParticipants.map(p => ({
        id: p.usn || `participant-${p.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: p.name
      }));

      // Non-destructive update - preserve teams that don't represent participants
      const existingNonSoloTeams = teams.filter(team =>
        !participants.some(p => p.name === team.name)
      );

      const mergedTeams = [...existingNonSoloTeams, ...soloTeams];

      // Update both participants and teams in one operation to avoid race conditions
      setFormData(CulturalActivity.parse({
        ...formData,
        participants: newParticipants,
        teams: mergedTeams
      }));
    } else {
      // Not in solo mode, just update participants
      handleChange('participants', newParticipants);
    }
  };

  const handleTeamsChange = (newTeams: { id: string, name: string }[]) => {
    handleChange('teams', newTeams);
  };

  const handleJudgesChange = (newJudges: Judge[]) => {
    handleChange('judges', newJudges);
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
                checked={isSoloPerformanceUI}
                onChange={handleSoloPerformanceToggle}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography fontWeight="medium">Solo Performance Mode</Typography>
                <Typography variant="caption" color="text.secondary">
                  {isSoloPerformanceUI
                    ? "Each participant is treated as an individual entry (team of 1)"
                    : "Participants compete as teams"}
                </Typography>
              </Box>
            }
          />

          {isSoloPerformanceUI && (
            <Alert severity="info" sx={{ mt: 2 }}>
              In solo mode, each participant competes as an individual entry.
              Teams will be automatically created for each participant.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Judges Section */}
      <JudgesForm judges={judges} setJudges={handleJudgesChange} />

      {/* Participants and Teams Section - Unified for both modes */}
      {/* Show TeamsForm only in team mode */}
      {!isSoloPerformanceUI && (
        <>
          <TeamsForm teams={teams} setTeams={handleTeamsChange} />
          <Divider sx={{ my: 3 }} />
          {teams.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please create at least one team before adding participants.
            </Alert>
          ) : null}
        </>
      )}

      {/* ParticipantsForm for both modes */}
      <ParticipantsForm
        participants={participants}
        setParticipants={handleParticipantsChange}
        teams={isSoloPerformanceUI ? [] : teams}
      />

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
          When enabled, users will be able to vote for their favorite {isSoloPerformanceUI ? "participants" : "teams"} in this activity.
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