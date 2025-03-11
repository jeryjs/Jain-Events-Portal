import { Box, TextField, Typography, Paper, Grid } from '@mui/material';

interface GeneralViewProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const GeneralView = ({ formData, setFormData }: GeneralViewProps) => {
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      details: {
        ...formData.details,
        [field]: value
      }
    });
  };

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Activity Details</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={formData.details?.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter a detailed description of this activity..."
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Venue"
            value={formData.details?.venue || ''}
            onChange={(e) => handleChange('venue', e.target.value)}
            placeholder="Enter the venue for this activity..."
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Duration"
            value={formData.details?.duration || ''}
            onChange={(e) => handleChange('duration', e.target.value)}
            placeholder="e.g., 90 minutes, 2 hours..."
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Max Participants"
            type="number"
            value={formData.details?.maxParticipants || ''}
            onChange={(e) => handleChange('maxParticipants', e.target.value)}
            inputProps={{ min: 1 }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Requirements"
            value={formData.details?.requirements || ''}
            onChange={(e) => handleChange('requirements', e.target.value)}
            placeholder="Any specific requirements for participants..."
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Information"
            multiline
            rows={3}
            value={formData.details?.additionalInfo || ''}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            placeholder="Any other relevant information..."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
