import React, { Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  IconButton, 
  Chip,
  Divider,
  Skeleton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { motion } from 'framer-motion';
import { useEvents } from '../hooks/useEvents';
import { useActivities } from '../hooks/useActivities';
import ActivityCard from '../components/shared/ActivityCard';
import PhotoGallery from '../components/shared/PhotoGallery';
import PageTransition from '../components/shared/PageTransition';
import { EventType } from '@common/constants';

const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '40vh',
  minHeight: 250,
  maxHeight: 350,
  width: '100%',
  overflow: 'hidden',
}));

const HeroImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}));

const HeroOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '16px',
});

const EventTypeChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  bottom: 16,
  left: 16,
  fontWeight: 'bold',
  backgroundColor: 'white',
  color: theme.palette.text.primary,
}));

const ContentSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const InfoIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const ActivitySectionContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

// Helper function to get event type text based on EventType enum
const getEventTypeText = (type: number): string => {
  if (type >= 1000 && type < 2000) return 'Sports Event';
  if (type >= 2000 && type < 3000) return 'Cultural Event';
  if (type >= 3000 && type < 4000) return 'Tech Event';
  return 'General Event';
};

// Helper function to get default image based on event type
const getDefaultImage = (eventType: number): string => {
  if (eventType >= 1000 && eventType < 2000) {
    return 'https://picsum.photos/480/360?random';
  } else if (eventType >= 2000 && eventType < 3000) {
    return 'https://picsum.photos/480/360?random';
  } else if (eventType >= 3000) {
    return 'https://picsum.photos/480/360?random';
  } else {
    return 'https://picsum.photos/480/360?random';
  }
};

// Activity list component with React.Suspense
const ActivitiesSection = ({ eventId }: { eventId: string }) => {
  const { data: activities, isLoading } = useActivities(eventId);

  if (isLoading) {
    return (
      <Box>
        {Array(3).fill(0).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <Typography color="text.secondary">No activities found for this event</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {activities.map((activity, index) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          eventId={eventId}
          delay={index}
        />
      ))}
    </Box>
  );
};

function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { data: events, isLoading: eventsLoading } = useEvents();
  
  // Find the current event from events data
  const event = events?.find(e => e.id === eventId);
  
  // Format date for display if event is available
  const formatEventDate = () => {
    if (!event) return { date: '', time: '' };
    
    const startDate = new Date(event.time.start);
    const endDate = new Date(event.time.end);
    
    const date = startDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const startTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endTime = endDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      date,
      dayTime: `${dayOfWeek}, ${startTime} - ${endTime}`
    };
  };
  
  const formattedDate = formatEventDate();
  const eventTypeText = event ? getEventTypeText(event.eventType) : 'Event';
  const heroImage = event ? getDefaultImage(event.eventType) : getDefaultImage(0);
  
  // Loading skeleton for event details
  if (eventsLoading || !event) {
    return (
      <PageTransition>
        <Container maxWidth="lg" sx={{ pt: 2, pb: 8 }}>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rectangular" height={250} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="text" height={60} width="80%" />
          </Box>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ width: '100%' }}>
              <Skeleton variant="text" height={24} width="40%" />
              <Skeleton variant="text" height={20} width="60%" />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" height={24} width="30%" />
          </Box>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" height={30} width="30%" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} width="100%" />
            <Skeleton variant="text" height={20} width="100%" />
            <Skeleton variant="text" height={20} width="80%" />
          </Box>
        </Container>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Hero Section with Background Image */}
      <HeroContainer component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <HeroImage src={heroImage} alt={event.name} />
        <HeroOverlay>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate(-1)}
              sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
              Event Details
            </Typography>
            <Box sx={{ width: 40 }} /> {/* Empty box for spacing */}
          </Box>
          <EventTypeChip label={eventTypeText} />
        </HeroOverlay>
      </HeroContainer>

      <Container maxWidth="lg" sx={{ pt: 3, pb: 8 }}>
        {/* Event Title */}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
          {event.name}
        </Typography>

        {/* Date, Time, Location Info */}
        <InfoIconWrapper>
          <CalendarTodayIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {formattedDate.date}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formattedDate.dayTime}
            </Typography>
          </Box>
        </InfoIconWrapper>

        <InfoIconWrapper>
          <LocationOnIcon sx={{ mr: 2, color: 'text.secondary' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {event.venue}
          </Typography>
        </InfoIconWrapper>

        <Divider sx={{ my: 3 }} />

        {/* About Section */}
        <ContentSection>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            About Event
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {event.description?.length > 150 
              ? `${event.description.substring(0, 150)}... `
              : event.description}
            {event.description?.length > 150 && (
              <Typography 
                component="span" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 'medium',
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Read More
              </Typography>
            )}
          </Typography>
        </ContentSection>

        {/* Activities Section */}
        <ActivitySectionContainer>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Activities
          </Typography>
          <Suspense fallback={
            <Box>
              {Array(3).fill(0).map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                </Box>
              ))}
            </Box>
          }>
            <ActivitiesSection eventId={eventId || ''} />
          </Suspense>
        </ActivitySectionContainer>

        <Divider sx={{ my: 3 }} />

        {/* Photo Gallery Section */}
        <PhotoGallery />

        {/* Back to Home Link */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Typography 
              component={motion.div}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              sx={{ 
                display: 'inline-block',
                fontWeight: 'medium',
                color: 'primary.main',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Back to Home
            </Typography>
          </Link>
        </Box>
      </Container>
    </PageTransition>
  );
}

export default EventPage;
