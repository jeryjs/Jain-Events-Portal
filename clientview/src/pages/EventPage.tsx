import { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, IconButton, Chip, Divider, Skeleton, Paper,
  Accordion, AccordionSummary, AccordionDetails, alpha,
  Dialog
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { useActivities, useEvent } from '../hooks/useApi';
import ActivityCard from '@components/Event/ActivityCard';
import PhotoGallery from '../components/shared/PhotoGallery';
import PageTransition from '../components/shared/PageTransition';
import { EventType } from '@common/constants';
import { getBaseEventType } from '@common/utils';
import { generateColorFromString } from '@utils/utils';
import useImgur from '@hooks/useImgur';

const HeroContainer = styled(motion.div)(({ theme }) => `
  position: relative;
  height: 30vh; min-height: 250px; max-height: 350px; width: 100%; overflow: hidden;
`);
const HeroImage = styled('img')(({ theme }) => `
  width: 100%; height: 100%; object-fit: cover; border-radius: 0 0 36px 36px;
`);
const HeroOverlay = styled(Box)(({ theme }) => `
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 0 0 36px 36px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%,rgba(0,0,0,0.3) 100%);
  display: flex; flex-direction: column; justify-content: space-between; padding: 16px;
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

// Helper function to generate a unique color based on the event type
const generateColor = (type: EventType): string => {
  // Use a simple hash function to generate a unique hue for each event type
  const hue = (type * 137.5) % 360; // 137.5 is a good golden angle approximation
  return `hsl(${hue}, 60%, 50%)`; // Return an HSL color string
};

// Helper function to get event type information
const getEventTypeInfo = (type: EventType) => {
  return {
    text: EventType[type],
    color: generateColorFromString(EventType[type]),
  };
};

// Activity Accordion Component
interface ActivityAccordionProps {
  eventType: EventType;
  activities: any[];
  eventId: string;
}

const ActivityAccordion: React.FC<ActivityAccordionProps> = ({ eventType, activities, eventId }) => {
  const [expanded, setExpanded] = useState(activities.length <= 3);
  const [fixtureDialog, setFixtureDialog] = useState<string | Record<string, string> | null>(null);
  const { text: activityType, color } = getEventTypeInfo(eventType);

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
    const fixture = fixtures[eventType];
    fixture && setFixtureDialog(fixture);
  };

  const renderFixtureDialogContent = () =>
    !fixtureDialog ? null : typeof fixtureDialog === "string" ? (
      <motion.img
        src={fixtureDialog}
        alt={`Fixture for ${activityType}`}
        style={{ width: "100%" }}
      />
    ) : (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(fixtureDialog).map(([key, url]) => (
          <Box key={key} sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2">{key}</Typography>
            <motion.img
              src={url}
              alt={`Fixture ${key} for ${activityType}`}
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
          <Chip label={activityType} size="small" sx={{ backgroundColor: alpha(color, 0.3), fontWeight: "medium", mr: 2 }} />

          <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
            {activities.length}{" "} {getBaseEventType(eventType) === EventType.SPORTS ? "Matches" : activities.length === 1 ? "Activity" : "Activities"}
          </Typography>

          {fixtures[eventType] && (<IconButton onClick={handleFixtureClick} size="small" sx={{ ml: "auto", px: 2, backgroundColor: `${color}50`, borderRadius: "12px" }}>
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

  // Group activities by event type
  const groupedActivities = activities.reduce((acc, activity) => {
    const activityType = activity.eventType;
    if (!acc[activityType]) {
      acc[activityType] = [];
    }
    acc[activityType].push(activity);
    return acc;
  }, {} as Record<number, any[]>);

  // Sort the groups by event type (so they appear in a consistent order)
  return (
    <Box>
      {Object.entries(groupedActivities)
        .sort(([typeA], [typeB]) => Number(typeA) - Number(typeB))
        .map(([type, acts]) => (
          <ActivityAccordion
            key={type}
            eventType={Number(type) as EventType}
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
  const { data: event, isLoading: eventLoading } = useEvent(eventId);
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

  return (
    <Suspense fallback={null}>
      <PageTransition>
        {/* Hero Section with Background Image */}
        <Box>
          <HeroContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <HeroImage
              src={getDefaultImage(event.banner.url)}
              alt={event.name}
              style={event.eventBannerStyles}
            />
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
          <Typography variant="h6" color='text.primary' sx={{ fontWeight: 'bold', mb: 2 }}>
            Photos
          </Typography>
          <PhotoGallery />

        </Container>
      </PageTransition>
    </Suspense>
  );
}

export default EventPage;
