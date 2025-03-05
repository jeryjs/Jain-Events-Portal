import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import {
  Avatar, AvatarGroup,
  Box,
  Chip,
  Container,
  IconButton,
  Typography
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { EventType } from '@common/constants';
import { SportsActivity } from '@common/models';
import { Sport } from '@common/models/sports/SportsActivity';
import { getBaseEventType } from '@common/utils';
import { ActivitySkeleton, CulturalsView, GeneralView, SportsView, TechView } from '@components/Activity';
import PageTransition from '@components/shared/PageTransition';
import { useActivity } from '@hooks/useApi';

// Styled Components
const HeroContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.08)}`,
}));

const HeaderChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.common.white,
  marginRight: theme.spacing(1),
}));

const InfoIconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  '& svg': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  }
}));

const ParticipantAvatar = styled(Avatar)(({ theme }) => ({
  border: `2px solid ${theme.palette.background.paper}`,
}));

function ActivityPage() {
  const { eventId, activityId } = useParams<{ eventId: string; activityId: string }>();
  const { data: activity, isLoading } = useActivity(eventId || '', activityId || '');
  const navigate = useNavigate();

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (!activity) {
    return <ActivityNotFound eventId={eventId || ''} />;
  }

  const handleBack = () => {
    navigate(`/${eventId}`);
  };

  // Determine activity type based on eventType enum
  const baseType = getBaseEventType(activity.eventType);

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ py: 4, color: 'text.primary' }}>
        {/* Activity Header with Back Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={handleBack}
            sx={{ mr: 2, bgcolor: 'background.paper', boxShadow: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            {activity.name}
          </Typography>
        </Box>

        {/* Activity Hero Section */}
        <ActivityHero activity={activity} baseType={baseType} />

        {/* Activity Content Based on Type */}
        {baseType === EventType.SPORTS && (
          <SportsView activity={activity as SportsActivity<Sport>} />
        )}

        {baseType === EventType.CULTURAL && (
          <CulturalsView activity={activity} />
        )}

        {baseType === EventType.TECH && (
          <TechView activity={activity} />
        )}

        {baseType === EventType.GENERAL && (
          <GeneralView activity={activity} />
        )}

      </Container>
    </PageTransition>
  );
}

// Activity Header Component
const ActivityHero = ({ activity, baseType }) => {
  // Get appropriate background color based on activity type
  const getBgColor = (type) => {
    switch (type) {
      case EventType.SPORTS: return 'primary.main';
      case EventType.CULTURAL: return 'secondary.main';
      case EventType.TECH: return 'info.main';
      default: return 'text.primary';
    }
  };

  // Get activity type label
  const getActivityTypeLabel = (type) => {
    if (type >= EventType.TECH) return 'Tech Activity';
    if (type >= EventType.CULTURAL) return 'Cultural Activity';
    if (type >= EventType.SPORTS) return 'Sports Activity';
    return 'General Activity';
  };

  return (
    <HeroContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <HeaderChip
            label={getActivityTypeLabel(activity.eventType)}
            sx={{ bgcolor: getBgColor(baseType) }}
          />
          <Box sx={{ mt: 2 }}>
            <InfoIconWrapper>
              <CalendarTodayIcon />
              <Typography variant="body1">
                {activity.startTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                })}
              </Typography>
            </InfoIconWrapper>
            <InfoIconWrapper>
              <PeopleIcon />
              {activity.participants?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{activity.participants?.length || 0} Participants</Typography>
                  <AvatarGroup max={5}>
                    {activity.participants.map((participant, i) => (
                      <ParticipantAvatar
                        key={participant.usn || i}
                        alt={participant.name}
                        // src={`https://i.pravatar.cc/150?u=${participant.usn || i}`}
                        // src={`https://robohash.org/${participant.usn || i}?set=set3&size=150`}
                        src={`https://eu.ui-avatars.com/api/?name=${participant.name || i}&size=50`}
                        // src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${participant.usn || i}`}
                        // src={`https://www.gravatar.com/avatar/${window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(participant.usn || i + "@jainuniversity.ac.in"))}?s=150&d=identicon`}
                      />
                    ))}
                  </AvatarGroup>
                </Box>
              )}
            </InfoIconWrapper>
          </Box>
        </Box>
      </Box>
    </HeroContainer>
  );
};

// Not Found Component
const ActivityNotFound = ({ eventId }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, color: 'text.primary' }}>
      <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
        Activity Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        The activity you are looking for does not exist.
        <Link to={`/${eventId}`} style={{ color: 'inherit', fontWeight: 'bold', textDecoration: 'underline' }}>
          Go back to the event page
        </Link>
      </Typography>
    </Container>
  );
};

export default ActivityPage;