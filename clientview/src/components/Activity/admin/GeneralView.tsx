import { Activity } from '@common/models';
import { Box, TextField, Typography, Paper, Grid } from '@mui/material';

interface GeneralViewProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const GeneralView = ({ formData, setFormData }: GeneralViewProps) => {
  const handleChange = (field: keyof Activity, value: any) => {
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
      <Typography variant="h6" gutterBottom>Select an activity type</Typography>
    </Paper>
  );
};
