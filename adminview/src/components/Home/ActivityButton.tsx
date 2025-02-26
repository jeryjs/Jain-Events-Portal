import { Card, CardContent, Typography, Box } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link } from 'react-router-dom';

interface ActivityButtonProps {
  eventId: string;
}

export const ActivityButton = ({ eventId }: ActivityButtonProps) => {
  return (
    <Card
      component={Link}
      to={`/${eventId}/activities`}
      sx={{
        cursor: 'pointer',
        bgcolor: 'secondary.light',
        color: 'white',
        transition: 'all 0.2s',
        textDecoration: 'none',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 4,
          bgcolor: 'secondary.main',
        },
      }}
    >
      <CardContent sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        alignItems: 'center',
        p: 3,
      }}>
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.2)',
          width: 60,
          height: 60,
          mr: { xs: 0, sm: 3 },
          mb: { xs: 2, sm: 0 }
        }}>
          <EventNoteIcon sx={{ fontSize: 30 }} />
        </Box>
        
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Manage Activities
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Add, edit, or remove activities for this event
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
