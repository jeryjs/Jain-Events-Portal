import { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { format } from 'date-fns';

import Event from '@common/models/Event';

interface EventCardProps {
  event: Event;
  isSelected: boolean;
  collapsed: boolean;
  onClick: () => void;
}

export const EventCard = ({ event, isSelected, collapsed, onClick }: EventCardProps) => {
  const [expanded, setExpanded] = useState(false);

  if (!event) {
    return null; // or some fallback UI
  }
  
  // Get the first letter of event name for collapsed mode
  const firstLetter = event.name.charAt(0).toUpperCase();
  
  // Format event date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMM d, yyyy');
  };

  // Handle card click - select event or toggle expanded state
  const handleClick = () => {
    onClick();
    if (!collapsed) {
      setExpanded(!expanded);
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        bgcolor: isSelected ? 'primary.light' : 'background.paper',
        color: isSelected ? 'white' : 'inherit',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        height: collapsed ? 48 : 'auto',
        width: collapsed ? 48 : 'auto',
        borderRadius: collapsed ? '50%' : 2,
        minWidth: collapsed ? 48 : 'auto',
      }}
      onClick={handleClick}
    >
      {collapsed ? (
        <Typography variant="h6">{firstLetter}</Typography>
      ) : (
        <CardContent sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {event.name}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Chip 
              label={event.type} 
              size="small" 
              sx={{ 
                bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'primary.main',
                color: isSelected ? 'white' : 'white',
              }} 
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {formatDate(event.time.start)}
            </Typography>
          </Box>
          
          {expanded && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color={isSelected ? 'inherit' : 'text.secondary'} sx={{ mb: 1 }}>
                {event.description.length > 100 
                  ? `${event.description.substring(0, 100)}...` 
                  : event.description}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 500 }}>
                Venue: {event.venue}
              </Typography>
            </Box>
          )}
        </CardContent>
      )}
    </Card>
  );
};
