import { Box, TextField, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { useState } from 'react';
import { CulturalActivity, Participant } from '@common/models';
import { ParticipantsForm } from '.';

interface CulturalsViewProps {
  formData: CulturalActivity;
  setFormData: (data: CulturalActivity) => void;
}

export const CulturalsView = ({ formData, setFormData }: CulturalsViewProps) => {
  const [participants, setParticipants] = useState<Participant[]>(formData.participants || []);

  // Update parent form data when participants change
  const handleParticipantsChange = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    setFormData(CulturalActivity.parse({
      ...formData,
      participants: newParticipants
    }));
  };
  
  const handleChange = (field: keyof CulturalActivity, value: any) => {
    setFormData(CulturalActivity.parse({
      ...formData,
      [field]: value
    }));
  };

  return (
    <Box>
      {/* Participants Section */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Participants</Typography>
        <ParticipantsForm participants={participants} setParticipants={handleParticipantsChange} />
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
          When enabled, users will be able to vote for their favorite participants in this activity.
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
