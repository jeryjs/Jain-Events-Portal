import { TeamActivity, Participant } from '@common/models';
import { Box, Typography, Paper, Card, CardContent, Divider } from '@mui/material';
import { memo, useState } from 'react';
import { ParticipantsForm } from '.';
import { TeamsForm } from './shared/TeamsForm';

interface TeamViewProps {
  formData: TeamActivity;
  setFormData: (data: TeamActivity) => void;
}

// Summary section to avoid re-renders
const SummarySection = memo<{ label: string; count: number }>(({ label, count }) => (
  <Typography>
    {count === 0
      ? `No ${label} configured yet`
      : `${count} ${label}${count > 1 ? 's' : ''} configured`}
  </Typography>
));

export const TechnicalView = ({ formData, setFormData }: TeamViewProps) => {
  const [isSoloPerformanceUI, setIsSoloPerformanceUI] = useState<boolean>(true);

  const teams = formData.teams || [];
  const participants = formData.participants || [];

  const handleChange = (field: keyof TeamActivity, value: any) => {
    setFormData(TeamActivity.parse({ ...formData, [field]: value }));
  };

  const handleParticipantsChange = (newParticipants: Participant[]) => {
    handleChange('participants', newParticipants);
  };

  const handleTeamsChange = (newTeams: { id: string; name: string }[]) => {
    handleChange('teams', newTeams);
  };

  return (
    <Box>
      {/* Top Section with Configuration Options */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Event Configuration</Typography>
        </CardContent>
      </Card>

      {/* Participants and Teams Section */}
      <TeamsForm teams={teams} setTeams={handleTeamsChange} />
      <Divider sx={{ my: 3 }} />
      <ParticipantsForm participants={participants} setParticipants={handleParticipantsChange} teams={teams} />
    </Box>
  );
};