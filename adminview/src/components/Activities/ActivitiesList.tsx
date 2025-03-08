import { Box, Button, List, ListItem, ListItemButton, ListItemText, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Activity } from '@common/models';
import { useEventActivities } from '@hooks/App';
import { alpha, styled } from '@mui/material/styles';
import { EventType } from '@common/constants';

interface ActivitiesListProps {
  eventId: string;
  selectedActivityId?: string;
  onSelectActivity: (id: string) => void;
  onCreateActivity: () => void;
}

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  py: 1.75, // Increased padding for a more spacious feel
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s ease-in-out', // Smooth transition for hover effects
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.12), // Slightly stronger hover effect
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2), // More pronounced selected state
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.3), // Even stronger hover effect when selected
    },
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontWeight: 700, // Bolder primary text
    fontSize: '1rem', // Slightly larger font size
  },
  '& .MuiListItemText-secondary': {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem', // Slightly larger secondary text
  },
}));

const ActivityChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12, // Slightly more rounded chip
  fontSize: '0.75rem', // Smaller font size for the chip
  fontWeight: 500,
}));


export const ActivitiesList = ({ eventId, selectedActivityId, onSelectActivity, onCreateActivity }: ActivitiesListProps) => {
  const { activities, isLoading } = useEventActivities(eventId);
  
  return (
    <Paper elevation={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}> {/* Slightly more rounded corners and overflow hidden for a cleaner look */}
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight="bold">Activities</Typography>{/* Slightly smaller heading */}
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onCreateActivity}
          size="small"
          sx={{ borderRadius: 1 }}
        >
          Create Activity
        </Button>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Loading activities...</Typography>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">No activities found</Typography>
            <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
              Create your first activity to get started
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={onCreateActivity}
              size="small"
              sx={{ borderRadius: 1 }}
            >
              Create Activity
            </Button>
          </Box>
        ) : (
          <List sx={{ py: 1 }}>
            {activities.map((activity: Activity) => (
              <ListItem key={activity.id} disablePadding divider>
                <StyledListItemButton 
                  selected={activity.id === selectedActivityId}
                  onClick={() => onSelectActivity(activity.id)}
                >
                  <StyledListItemText 
                    primary={activity.name} 
                    secondary={
                      <ActivityChip size='small' label={EventType[activity.eventType]}/>
                    }
                  />
                </StyledListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};
