import { EventType, Role } from '@common/constants';
import Event, { BannerItem } from '@common/models/Event';
import { getBaseEventType } from '@common/utils';
import { EventForm } from '@components/admin/EventForm';
import ActivityCard from '@components/Event/ActivityCard';
import HighlightsCarousel from '@components/Event/HighlightsCarousel';
import { useLogin } from '@components/shared';
import PageTransition from '@components/shared/PageTransition';
import PhotoGallery from '@components/shared/PhotoGallery';
import { useDeleteEvent, useUpdateEvent } from '@hooks/admin';
import { useActivities, useAssignManagers, useEvent } from '@hooks/useApi';
import useImgur from '@hooks/useImgur';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Box,
  Chip,
  Container,
  Dialog,
  Divider,
  Fab,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { generateColorFromString } from '@utils/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

const HeroContainer = styled(motion.div)(({ theme }) => `
  position: relative;
  height: 30vh; min-height: 250px; max-height: 350px; width: 100%; overflow: hidden;
`);
const HeroImage = styled(motion.img)(({ theme }) => `
  width: 100%; height: 100%; object-fit: cover; border-radius: 0 0 36px 36px;
`);
const HeroVideo = styled(motion.video)(({ theme }) => `
  width: 100%; height: 100%; border-radius: 0 0 36px 36px;
`);
const HeroOverlay = styled(Box)(({ theme }) => `
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 0 0 36px 36px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 100%);
  display: flex; flex-direction: column; justify-content: space-between; padding: 16px;
`);
const VideoControls = styled(Box)(({ theme }) => `
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  z-index: 5;
`);
const EventTypeChip = styled(Chip)(({ theme }) => `
  position: absolute; margin-top: -30px; left: 50%; transform: translateX(-50%);
  width: 70%; height: 52px; font-size: 24px; font-weight: bold; border-radius: 24px;
  background-color: ${theme.palette.background.paper}; color: ${theme.palette.text.secondary};
`);
const ContentSection = styled(Box)(({ theme }) => `
  color: ${theme.palette.text.primary};
  margin: ${theme.spacing(3)} 0;
`);
const DescriptionText = styled(Typography)(({ theme }) => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  marginBottom: theme.spacing(1)
}));
const IconSquircle = styled(Box)(({ theme }) => `
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background-color: ${theme.palette.action.focus};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${theme.spacing(2)};
`);
const InfoIconWrapper = styled(Box)(({ theme }) => `
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing(3)};
  padding: ${theme.spacing(1.5)};
  border-radius: 12px;
  transition: all 0.2s ease;
  &:hover {
    background-color: ${theme.palette.action.disabledBackground};
  }
`);

const ActivitySectionContainer = styled(Box)(({ theme }) => `
  margin: ${theme.spacing(3)} 0;
`);

// Helper function to get event type text based on EventType enum
const getEventTypeText = (type: number): string => {
  if (type >= EventType.TECH) return 'Tech Event';
  if (type >= EventType.CULTURAL) return 'Cultural Event';
  if (type >= EventType.SPORTS) return 'Sports Event';
  return 'General Event';
};

// Helper function to get default image if banner image is not set
const getDefaultImage = (src): string => {
  return src || 'https://admissioncart.in/new-assets/img/university/jain-deemed-to-be-university-online-ju-online_banner.jpeg';
};


// Helper function to get event type information
const getEventTypeInfo = (type: EventType) => {
  return {
    text: EventType[type],
    color: generateColorFromString(EventType[type]),
  };
};

// Banner Media Component with automatic rotation
const BannerMedia = ({ items }: { items: BannerItem[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];
  const currentCssStyles = Event.parse().getBannerStyles(currentItem);

  // Toggle fullscreen for video
  const toggleFullscreen = () => {
    if (videoRef.current) {
      document.fullscreenElement
        ? document.exitFullscreen()
        : videoRef.current.requestFullscreen();
    }
  };

  // Auto switch banner items
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      const videoElm = containerRef.current.querySelector("video");
      if (videoElm?.ended || videoElm?.paused || !videoElm)
        setCurrentIndex(prev => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items, currentIndex]);

  // Touch gesture handlers for navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const delta = touchStartRef.current - e.changedTouches[0].clientX;
    if (delta > 50) setCurrentIndex(prev => (prev + 1) % items.length);
    else if (delta < -50)
      setCurrentIndex(prev => (prev === 0 ? items.length - 1 : prev - 1));
    touchStartRef.current = null;
  };

  if (!items.length) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          bgcolor: '#F0F0F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography>No banner media available</Typography>
      </Box>
    );
  }

  const fadeVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial="enter"
          animate="center"
          exit="exit"
          variants={fadeVariants}
          style={{ width: '100%', height: '100%' }}
        >
          {currentItem.type === 'video' && currentItem.url ? (
            <>
              <HeroVideo
                ref={videoRef}
                src={currentItem.url}
                autoPlay
                muted={muted}
                loop={false}
                style={currentCssStyles}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  display: 'flex',
                  gap: 1,
                  zIndex: 5
                }}
              >
                <IconButton
                  onClick={() => setMuted(prev => !prev)}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                  size="small"
                >
                  {muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}
                </IconButton>
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                  size="small"
                >
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          ) : (
            <HeroImage
              src={currentItem.url ? getDefaultImage(currentItem.url) : getDefaultImage('')}
              alt="Event banner"
              style={currentCssStyles}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
            zIndex: 2
          }}
        >
          {items.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// Activity Accordion Component
interface ActivityAccordionProps {
  activityType: EventType;
  activities: any[];
  eventId: string;
}

const ActivityAccordion: React.FC<ActivityAccordionProps> = ({ activityType, activities, eventId }) => {
  const [expanded, setExpanded] = useState(activities.length <= 3);
  const { text, color } = getEventTypeInfo(activityType);

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        '&:before': { display: 'none' },
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: alpha(color, 0.1),
          '& .MuiAccordionSummary-content': {
            alignItems: 'center'
          }
        }}
      >
        <Chip
          label={text}
          size="small"
          sx={{
            backgroundColor: color,
            color: 'white',
            fontWeight: 'medium',
            mr: 2
          }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          {activities.length} {getBaseEventType(activityType) === EventType.SPORTS ? 'Matches' : activities.length === 1 ? 'Activity' : 'Activities'}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1 }}>
        {activities.map((activity, index) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            eventId={eventId}
            delay={index}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

// Activity list component with React.Suspense
const ActivitiesSection = ({ eventId }: { eventId: string }) => {
  const { activities, isLoading } = useActivities(eventId);
  const len = activities && Array.isArray(activities) ? activities.length : 0;

  if (isLoading) {
    return (
      <Box>
        {Array(3).fill(0).map((_, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Box>
    );
  }

  if (!activities || len === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <Typography color="text.secondary">No activities found for this event</Typography>
      </Paper>
    );
  }

  // Separate info activities from other activities
  const infoActivities = activities.filter(activity => getBaseEventType(activity.type) === EventType.INFO);
  const nonInfoActivities = activities.filter(activity => getBaseEventType(activity.type) !== EventType.INFO);

  // Group activities by event type
  const groupedActivities: Record<number, any[]> = {};

  // First handle INFO activities if they exist
  if (infoActivities.length > 0) {
    groupedActivities[EventType.INFO] = infoActivities;
  }

  // Then handle the rest of activity types
  nonInfoActivities.forEach(activity => {
    const activityType = activity.type;
    if (!groupedActivities[activityType]) {
      groupedActivities[activityType] = [];
    }
    groupedActivities[activityType].push(activity);
  });

  // Return the activities, now with INFO guaranteed to be first if it exists
  return (
    <Box>
      {Object.entries(groupedActivities)
        .map(([type, acts]) => (
          <ActivityAccordion
            key={type}
            activityType={Number(type) as EventType}
            activities={acts}
            eventId={eventId}
          />
        ))
      }
    </Box>
  );
};

function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { userData } = useLogin();
  const { mutateAsync: assignManagers } = useAssignManagers();
  const { mutateAsync: updateEvent } = useUpdateEvent();
  const { mutateAsync: deleteEvent } = useDeleteEvent();

  const { data: event, isLoading: eventLoading, refetch } = useEvent(eventId);
  const { data: imgur, isLoading: imgurLoading } = useImgur(event?.galleryLink || '');

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  // Get edit state from URL search params
  const isEditMode = searchParams.get('edit') === 'true';

  // Check if user can edit this event
  const canEdit = userData && (
    userData.role >= Role.ADMIN ||
    (event?.managers && event.managers.includes(userData.username))
  );

  // Handle event save
  const handleEventSave = async (eventData: Partial<Event>) => {
    try {
      if (!eventId) throw new Error('Event ID is required');
      await updateEvent(eventData);
      setSearchParams(prev => { prev.delete('edit'); return prev; }, { replace: true });
      refetch();
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to save event'));
      console.error('Failed to save event:', error);
    }
  };

  // Handle event delete
  const handleEventDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
      navigate('/');
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to delete event'));
      console.error('Failed to delete event:', error);
    }
  };

  // Check if description is truncated
  useEffect(() => {
    if (descriptionRef.current && event?.description) {
      const element = descriptionRef.current;
      setIsDescriptionTruncated(
        element.scrollHeight > element.clientHeight ||
        element.offsetHeight < element.scrollHeight
      );
    }
  }, [event?.description]);

  const formatEventDate = () => {
    if (!event) return { date: '', dayTime: '' };
    const start = new Date(event.time.start);
    const end = new Date(event.time.end);
    // If the event year is greater than 3000, use a special "Coming Soon" message and a fancy tagline
    if (start.getFullYear() >= 3000) {
      return { date: "Coming Soon", dayTime: "Stay tuned for the big reveal!" };
    }
    const date = start.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const dayOfWeek = start.toLocaleDateString('en-US', { weekday: 'long' });
    const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return { date, dayTime: `${dayOfWeek}, ${startTime} - ${endTime}` };
  };
  const formattedDate = formatEventDate();
  const eventTypeText = event ? getEventTypeText(event.type) : 'Event';

  // Loading skeleton for event details
  if (eventLoading || !event) {
    return (
      <PageTransition>
        <Container maxWidth="lg" sx={{ pt: 2, pb: 8 }}>
          <Box sx={{ mb: 2 }}>
            <Skeleton variant="rounded" height={250} />
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

  // temp for ininity: Hardcode the highlights-

  return (
    <Suspense fallback={null}>
      <PageTransition>
        {/* Hero Section with Background Image */}
        <Box>
          <HeroContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Banner Image/Video */}
            <BannerMedia items={event.banner || []} />
            <HeroOverlay>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <IconButton onClick={() => navigate(-1)} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: '500', ml: 3 }}>
                  Event Details
                </Typography>
              </Box>
            </HeroOverlay>
          </HeroContainer>
          <EventTypeChip label={eventTypeText} />
        </Box>

        <Container maxWidth="lg" sx={{ pt: 3, pb: 8 }}>
          {/* Event Title */}
          <Typography variant="h4" sx={{ fontWeight: '500', my: 3, color: 'text.primary' }}>
            {event.name}
          </Typography>

          {/* Date, Time, Location Info */}
          <InfoIconWrapper>
            <IconSquircle>
              <CalendarTodayIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            </IconSquircle>
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
                {formattedDate.date}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {formattedDate.dayTime}
              </Typography>
            </Box>
          </InfoIconWrapper>

          <InfoIconWrapper>
            <IconSquircle>
              <LocationOnIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            </IconSquircle>
            <Box>
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold' }}>
                {event.venue}
              </Typography>
              {/* <Typography variant="subtitle1" color="text.secondary">
              Tap for directions
            </Typography> */}
            </Box>
          </InfoIconWrapper>

          <Divider sx={{ my: 3 }} />

          {/* About Section */}
          <ContentSection>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              About Event
            </Typography>
            {showFullDescription ? (
              <Typography variant="body1" color="text.secondary" paragraph>
                {event.description}
                {isDescriptionTruncated && (
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'medium',
                      cursor: 'pointer',
                      display: 'block',
                      mt: 1,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => setShowFullDescription(false)}
                  >
                    Show Less
                  </Typography>
                )}
              </Typography>
            ) : (
              <>
                <DescriptionText
                  variant="body1"
                  color="text.secondary"
                  ref={descriptionRef}
                >
                  {event.description}
                </DescriptionText>
                {isDescriptionTruncated && (
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'medium',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                    onClick={() => setShowFullDescription(true)}
                  >
                    Read More
                  </Typography>
                )}
              </>
            )}
          </ContentSection>

          {/*  Temp Infinity Highlights section */}
          {event.highlights && <Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" color='text.primary' sx={{ fontWeight: 'bold', mb: 1 }}>
              Highlights
            </Typography>
            <HighlightsCarousel images={event.highlights.split(',').map(url => url.trim())} />
          </Box>}

          <Divider sx={{ my: 3 }} />

          {/* Activities Section */}
          <ActivitySectionContainer>
            <Typography variant="h6" color='text.primary' sx={{ fontWeight: 'bold', mb: 2 }}>
              {getBaseEventType(event.type) === EventType.SPORTS ? 'Matches' : 'Activities'}
            </Typography>
            <Suspense fallback={
              <Box>
                {Array(3).fill(0).map((_, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Skeleton variant="rounded" height={80} sx={{ borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>
            }>
              <ActivitiesSection eventId={eventId || ''} />
            </Suspense>
          </ActivitySectionContainer>

          <Divider sx={{ my: 3 }} />

          {/* Photo Gallery Section */}
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            Event Gallery
          </Typography>
          <PhotoGallery
            images={
              eventId === "sportastica-2025" ?
                (imgur ? [...imgur].reverse().map(it => it.link) : []) :
                (imgur ? imgur.map(it => it.link) : [])
            }
            isLoading={imgurLoading}
            rows={2}
            columns={4}
          />
        </Container>

        {/* Floating Edit Button (Admin/Manager only) */}
        {canEdit && (
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
            onClick={() => setSearchParams(prev => ({ ...prev, edit: 'true' }))}
          >
            <EditIcon />
          </Fab>
        )}

        {/* Fullscreen Edit Dialog */}
        <Dialog open={isEditMode} maxWidth={false} fullScreen>
          <EventForm
            event={event}
            isCreating={false}
            onSave={handleEventSave}
            onDelete={handleEventDelete}
            onCancel={() => setSearchParams(prev => { prev.delete('edit'); return prev; }, { replace: true })}
          />
        </Dialog>

        {/* Error Notification */}
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </PageTransition>
    </Suspense>
  );
}

export default EventPage;
