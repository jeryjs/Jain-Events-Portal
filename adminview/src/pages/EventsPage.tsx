import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Container, Paper, Grid2 as Grid, Card, IconButton } from '@mui/material';

import { EventForm } from '../components/Home/EventForm';
import { EventsList, ActivityButton } from '../components/Home';
import { useEvent, useCreateEvent, useUpdateEvent } from '@hooks/App';
import slugify from '../utils/Slugify';
import { Event } from '@common/models';

const EventsPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(eventId === 'create');

  // Fetch event data if editing
  const eventQuery = useEvent(eventId, !isCreating && !!eventId);
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  // Handle event selection
  const handleSelectEvent = (id: string) => {
    setIsCreating(false);
    navigate(`/events/${id}`);
  };

  // Handle create new event action
  const handleCreateEvent = () => {
    setIsCreating(true);
    navigate('/events/create');
  };

  // Handle save (create or update)
  const handleSaveEvent = async (formData: Event) => {
    const eventData = Event.parse({ ...formData, id: isCreating ? slugify(formData.name) : eventId });
    if (isCreating) {
      await createMutation.mutateAsync(eventData, {
        onSuccess: () => {
          setIsCreating(false);
          navigate(`/events/${eventData.id}`);
        }
      });
    } else if (eventId) {
      await updateMutation.mutateAsync(eventData, {
        onSuccess: () => navigate(`/events/${eventId}`),
      });
    }
  };

  return (
    <Container maxWidth={false} sx={{ height: '100vh', py: 3 }}>
      <Card sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Event Management
        </Typography>

        <IconButton component={Link} to="/articles">
          go to articles
        </IconButton>
      </Card>

      <Grid container spacing={3} sx={{ height: '-webkit-fill-available', width: '100%' }}>
        {/* Left pane - Events list */}
        <Grid>
          <EventsList
            selectedEventId={eventId}
            onSelectEvent={handleSelectEvent}
            onCreateEvent={handleCreateEvent}
          />
        </Grid>

        {/* Right pane - Event form */}
        <Grid flex={1}>
          {!eventId && !isCreating ? (
            <Paper
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                borderRadius: 2,
                textAlign: 'center'
              }}
            >
              <Typography variant="h5" sx={{ mb: 2 }}>
                Select an event or create a new one
              </Typography>
              <Typography color="text.secondary">
                Use the list on the left to select an existing event or click "Create Event"
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ height: '100%' }}>
              <EventForm
                event={eventQuery.data}
                isCreating={isCreating}
                onSave={handleSaveEvent}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventsPage;
