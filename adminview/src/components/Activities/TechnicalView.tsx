import { TeamActivity, Participant } from '@common/models';
import { Box, Typography, Paper, Card, CardContent, Divider } from '@mui/material';
import { memo, useState } from 'react';
import { ParticipantsForm } from '.';
import { TeamsForm } from './shared/TeamsForm';
import ManageTeamsForm from './shared/ManageTeamsForm';

interface TeamViewProps {
  formData: TeamActivity;
  setFormData: (data: TeamActivity) => void;
}

export const TechnicalView = ({ formData, setFormData }: TeamViewProps) => {
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
      <ManageTeamsForm
        teams={teams}
        setTeams={handleTeamsChange}
        participants={participants}
        setParticipants={handleParticipantsChange}
        isSoloPerformance={false} />
    </Box>
  );
};