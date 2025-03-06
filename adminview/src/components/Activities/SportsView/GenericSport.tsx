import { Box, TextField, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface GenericSportProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const GenericSport = ({ formData, setFormData }: GenericSportProps) => {
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
      <Typography variant="h6" gutterBottom>Generic Sport Settings</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Rules"
            multiline
            rows={4}
            value={formData.details?.rules || ''}
            onChange={(e) => handleChange('rules', e.target.value)}
            placeholder="Enter the rules for this sport..."
            helperText="Describe the rules and regulations for this sport"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Venue"
            value={formData.details?.venue || ''}
            onChange={(e) => handleChange('venue', e.target.value)}
            placeholder="Enter the venue for this sport..."
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
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              value={formData.details?.format || ''}
              label="Format"
              onChange={(e) => handleChange('format', e.target.value)}
            >
              <MenuItem value="league">League</MenuItem>
              <MenuItem value="knockout">Knockout</MenuItem>
              <MenuItem value="roundRobin">Round Robin</MenuItem>
              <MenuItem value="groupStage">Group Stage</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Max Players Per Team"
            type="number"
            value={formData.details?.maxPlayersPerTeam || ''}
            onChange={(e) => handleChange('maxPlayersPerTeam', e.target.value)}
            inputProps={{ min: 1 }}
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
