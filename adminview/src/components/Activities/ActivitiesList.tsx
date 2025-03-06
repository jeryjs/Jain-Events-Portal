import { Box, Button, List, ListItem, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Activity } from '@common/models';
import { useEventActivities } from '@hooks/App';

interface ActivitiesListProps {
  eventId: string;
  selectedActivityId?: string;
  onSelectActivity: (id: string) => void;
  onCreateActivity: () => void;
}

export const ActivitiesList = ({ eventId, selectedActivityId, onSelectActivity, onCreateActivity }: ActivitiesListProps) => {
  const { activities, isLoading } = useEventActivities(eventId);
  
  return (
    <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6">Activities</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={onCreateActivity}
          size="small"
        >
          Create Activity
        </Button>
      </Box>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading activities...</Typography>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No activities found</Typography>
            <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
              Create your first activity to get started
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={onCreateActivity}
              size="small"
            >
              Create Activity
            </Button>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {activities.map((activity: Activity) => (
              <ListItem key={activity.id} disablePadding divider>
                <ListItemButton 
                  selected={activity.id === selectedActivityId}
                  onClick={() => onSelectActivity(activity.id)}
                  sx={{ 
                    py: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      }
                    }
                  }}
                >
                  <ListItemText 
                    primary={activity.name} 
                    secondary={activity.eventType || 'No type specified'}
                    primaryTypographyProps={{
                      fontWeight: activity.id === selectedActivityId ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};
