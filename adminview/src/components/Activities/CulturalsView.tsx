import { Box, TextField, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
      
      {/* Cultural Event Details */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Cultural Activity Details</Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Performance Type</InputLabel>
              <Select
                value={formData.eventType || ''}
                label="Performance Type"
                onChange={(e) => handleChange('eventType', e.target.value)}
              >
                <MenuItem value="dance">Dance</MenuItem>
                <MenuItem value="music">Music</MenuItem>
                <MenuItem value="drama">Drama</MenuItem>
                <MenuItem value="art">Art</MenuItem>
                <MenuItem value="fashion">Fashion Show</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Duration"
              value={formData.performanceDetails || ''}
              onChange={(e) => handleChange('performanceDetails', e.target.value)}
              placeholder="e.g., 30 minutes, 1 hour..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={formData.performanceDetails || ''}
              onChange={(e) => handleChange('performanceDetails', e.target.value)}
              placeholder="Enter a detailed description of this cultural activity..."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Venue"
              value={formData.performanceDetails || ''}
              onChange={(e) => handleChange('performanceDetails', e.target.value)}
              placeholder="Enter the venue for this activity..."
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Equipment Required"
              value={formData.performanceDetails || ''}
              onChange={(e) => handleChange('performanceDetails', e.target.value)}
              placeholder="Any special equipment needed..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Judging Criteria"
              multiline
              rows={3}
              value={formData.performanceDetails || ''}
              onChange={(e) => handleChange('performanceDetails', e.target.value)}
              placeholder="Describe how performances will be judged..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Information"
              multiline
              rows={2}
              value={formData.performanceDetails || ''}
              onChange={(e) => handleChange('performanceDetails', e.target.value)}
              placeholder="Any other relevant information..."
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
