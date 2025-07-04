import { EventType } from '@common/constants';
import Event, { BannerItem } from '@common/models/Event';
import { getBaseEventType } from '@common/utils';
import ActivityCard from '@components/Event/ActivityCard';
import HighlightsCarousel from '@components/Event/HighlightsCarousel';
import useImgur from '@hooks/useImgur';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Chip,
  Container,
  Dialog,
  Divider,
  IconButton,
  Paper,
  Skeleton,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { generateColorFromString } from '@utils/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageTransition from '../components/shared/PageTransition';
import PhotoGallery from '../components/shared/PhotoGallery';
import { useActivities, useEvent } from '../hooks/useApi';

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
  const [fixtureDialog, setFixtureDialog] = useState<string | Record<string, string> | null>(null);
  const { text: activityTypeText, color } = getEventTypeInfo(activityType);

  /// Hardcoding the fixture data for the sportastica-2025 event temporarily
  const fixtures = eventId === "sportastica-2025" && {
    [EventType.VOLLEYBALL]: "https://i.imgur.com/C67OIyz.png",
    [EventType.FOOTBALL]: "https://i.imgur.com/82B4SjE.png",
    [EventType.BASKETBALL]: { Boys: "https://i.imgur.com/OcsfJnF.png", Girls: "https://i.imgur.com/CVqnbyt.png" },
    [EventType.CRICKET]: "https://i.imgur.com/EsfSrzV.png",
    [EventType.THROWBALL]: "https://i.imgur.com/huZyVGE.png"
  } || {};

  const handleFixtureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fixture = fixtures[activityType];
    fixture && setFixtureDialog(fixture);
  };

  const renderFixtureDialogContent = () =>
    !fixtureDialog ? null : typeof fixtureDialog === "string" ? (
      <motion.img
        src={fixtureDialog}
        alt={`Fixture for ${activityTypeText}`}
        style={{ width: "100%" }}
      />
    ) : (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(fixtureDialog).map(([key, url]) => (
          <Box key={key} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">{key}</Typography>
            <motion.img
              src={url}
              alt={`Fixture ${key} for ${activityTypeText}`}
              style={{ width: "100%" }}
            />
          </Box>
        ))}
      </Box>
    );

  return (
    <>
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}
        sx={{
          mb: 2,
          borderRadius: 2,
          overflow: "hidden",
          "&:before": { display: "none" },
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: alpha(color, 0.1), "& .MuiAccordionSummary-content": { alignItems: "center" } }}>
          <Chip label={activityTypeText} size="small" sx={{ backgroundColor: alpha(color, 0.3), fontWeight: "medium", mr: 2 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            {activities.length}{" "} {getBaseEventType(activityType) === EventType.SPORTS ? "Matches" : activities.length === 1 ? "Activity" : "Activities"}
          </Typography>

          {fixtures[activityType] && (<IconButton onClick={handleFixtureClick} size="small" sx={{ ml: "auto", px: 2, backgroundColor: `${color}50`, borderRadius: "12px" }}>
            <Typography variant="caption">Fixtures</Typography>
          </IconButton>)}
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
      <Dialog open={Boolean(fixtureDialog)} onClose={() => setFixtureDialog(null)} maxWidth="xl" fullWidth>
        {renderFixtureDialogContent()}
      </Dialog>
    </>
  );
};

// Activity list component with React.Suspense
const ActivitiesSection = ({ eventId }: { eventId: string }) => {
  const { data: activities, isLoading } = useActivities(eventId);
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

  // TODO: revert making info activities last after infinity-2025
  // Group activities by event type for non-info activities
  const groupedActivities: Record<number, any[]> = {};

  nonInfoActivities.forEach(activity => {
    const activityType = activity.type;
    if (!groupedActivities[activityType]) {
      groupedActivities[activityType] = [];
    }
    groupedActivities[activityType].push(activity);
  });

  // Prepare info activities as a separate group
  const infoGroup = infoActivities.length > 0 ? { [EventType.INFO]: infoActivities } : {};

  // Merge the groups, making sure the INFO group comes last
  const orderedGroups = [
    ...Object.entries(groupedActivities),
    ...Object.entries(infoGroup)
  ];

  // Return the activities with INFO rendered last if it exists
  return (
    <Box>
      {orderedGroups.map(([type, acts]) => (
        <ActivityAccordion
          key={type}
          activityType={Number(type) as EventType}
          activities={acts}
          eventId={eventId}
        />
      ))}
    </Box>
  );
};

function EventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: imgur, isLoading: imgurLoading } = useImgur(event?.galleryLink || '');

  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

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
  const highlights = eventId === "infinity-2025" ? [
    'https://i.imgur.com/hnY5dx2l.jpeg',
    'https://i.imgur.com/8oNrZuzl.jpeg',
    'https://i.imgur.com/2W2fEIYl.jpeg'
  ] : null;

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
          {highlights && <Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" color='text.primary' sx={{ fontWeight: 'bold', mb: 1 }}>
              Highlights
            </Typography>
            <HighlightsCarousel images={highlights} />
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
      </PageTransition>
    </Suspense>
  );
}

export default EventPage;
