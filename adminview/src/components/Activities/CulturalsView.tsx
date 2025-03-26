import { CulturalActivity, Judge, Participant } from '@common/models';
import { Alert, Box, Card, CardContent, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
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
