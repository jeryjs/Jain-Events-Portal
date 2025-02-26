import { useState, useCallback, memo } from 'react';
import { Box, Typography, Card, CardContent, Skeleton, Tooltip, IconButton, styled } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useEvents } from '@hooks/App';
import { EventCard } from '.';

interface EventsListProps {
  selectedEventId?: string;
  onSelectEvent: (id: string) => void;
  onCreateEvent: () => void;
}

const CollapsibleCard = styled(Card)(({ theme }) => ({
  transition: theme.transitions.create(['width', 'border-radius', 'height', 'min-width'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  justifyContent: 'flex-start',
}));

export const EventsList = memo(({ selectedEventId, onSelectEvent, onCreateEvent }: EventsListProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { events, isLoading } = useEvents();

  // Toggle collapsed state with useCallback for performance
  const toggleCollapsed = useCallback(() => setCollapsed(prev => !prev), []);

  // Memoize event selection handler
  const handleSelectEvent = useCallback((id: string) => {
    onSelectEvent(id);
  }, [onSelectEvent]);

  return (
    <Box
      component="section"
      aria-label="Events List"
      sx={{
        height: '100%',
        width: collapsed ? '120px' : '480px',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
    >
      <Box
        component="header"
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" component="h2">Events</Typography>
        <Tooltip title={collapsed ? "Expand events" : "Collapse events"}>
          <IconButton
            onClick={toggleCollapsed}
            size="small"
            aria-label={collapsed ? "Expand events" : "Collapse events"}
            sx={{
              transform: 'rotate(270deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          >
            {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        component="div"
        role="list"
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
          },
          display: 'flex', // Use flex layout
          flexDirection: 'column', // Stack children vertically
        }}
      >
        {/* Create Event Card */}
        <Tooltip title="Create new event">
          <CollapsibleCard
            role="button"
            aria-label="Create new event"
            tabIndex={0}
            sx={{
              cursor: 'pointer',
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
                bgcolor: 'primary.dark',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.dark',
              },
              justifyContent: collapsed ? 'center' : 'flex-start',
              height: collapsed ? 48 : '100px',
              width: collapsed ? 48 : '100%',
              borderRadius: collapsed ? '50%' : 2,
              minWidth: collapsed ? 48 : 'auto',
              mb: 2,
            }}
            onClick={onCreateEvent}
            onKeyDown={(e) => e.key === 'Enter' && onCreateEvent()}
          >
            {collapsed ? (
              <AddIcon />
            ) : (
              <CardContent sx={{ display: 'flex', alignItems: 'center', width: '100%', py: 1.5 }}>
                <AddIcon sx={{ mr: 1 }} />
                <Typography variant="h6" component="span">Create Event</Typography>
              </CardContent>
            )}
          </CollapsibleCard>
        </Tooltip>

        {/* Event List */}
        {isLoading ? (
          // Loading skeletons with animation
          Array(5).fill(0).map((_, index) => (
            <Box key={`skeleton-${index}`} sx={{ mb: 2 }}>
              <Skeleton
                variant="rectangular"
                height={48}
                animation="wave"
                sx={{
                  borderRadius: collapsed ? '50%' : 2,
                  width: collapsed ? 48 : '100%',
                }}
              />
            </Box>
          ))
        ) : events.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 100 }}>
            <Typography color="text.secondary" align="center">
              No events available. Create one to get started.
            </Typography>
          </Box>
        ) : (
          <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {events.map((event) => (
              <Box component="li" key={event.id} sx={{ mb: 2 }}>
                <EventCard
                  event={event}
                  isSelected={event.id === selectedEventId}
                  collapsed={collapsed}
                  onClick={() => handleSelectEvent(event.id)}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
});

EventsList.displayName = 'EventsList';
