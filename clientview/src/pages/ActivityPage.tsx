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
import { InfoActivity, SportsActivity } from '@common/models';
import { Sport } from '@common/models/sports/SportsActivity';
import { getBaseEventType } from '@common/utils';
import { ActivitySkeleton, CulturalsView, GeneralView, InfoView, SportsView, TechView } from '@components/Activity';
import PageTransition from '@components/shared/PageTransition';
import { useActivity } from '@hooks/useApi';
import { pascalCase } from '@utils/utils';

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

  if (!isLoading && !activity) {
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
        {/* Activity Hero Section */}
        <ActivityHero activity={activity} baseType={baseType} handleBack={handleBack} />

        {/* Activity Content Based on Type */}
        {(() => {
          switch (baseType) {
            case EventType.GENERAL: return <GeneralView activity={activity} />;
            case EventType.INFO: return <InfoView activity={activity as InfoActivity} />;
            case EventType.SPORTS: return <SportsView activity={activity as SportsActivity<Sport>} />;
            case EventType.CULTURAL: return <CulturalsView eventId={eventId} activity={activity} />;
            case EventType.TECH: return <TechView activity={activity} />;
            default: return null;
          }
        })()}
      </Container>
    </PageTransition>
  );
}

// Activity Header Component
const ActivityHero = ({ activity, baseType, handleBack }) => {
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
    return pascalCase(EventType[type]) + " Activity";
  };

  return (
    <HeroContainer
      sx={{
        bgcolor: (theme) => theme.palette.background.default,
        // color: (theme) => theme.palette.primary.contrastText,
        boxShadow: (theme) => `0 10px 30px ${alpha(theme.palette.primary.dark, 0.3)}`,
      }}
    >
      {/* Activity Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'inherit' }}>
        <IconButton
          onClick={handleBack}
          sx={{
            mr: 2,
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
            boxShadow: 1,
            color: 'inherit',
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.background.paper, 0.3),
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1" fontWeight="bold" color="inherit">
          {activity.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <HeaderChip
            label={getActivityTypeLabel(activity.eventType)}
            sx={{
              bgcolor: (theme) => theme.palette.background.paper,
              color: getBgColor(baseType),
              fontWeight: 'bold',
            }}
          />
          <Box sx={{ mt: 2, color: 'inherit' }}>
            <InfoIconWrapper sx={{ color: 'inherit' }}>
              <CalendarTodayIcon sx={{ color: 'inherit' }} />
              <Typography variant="body2" color="inherit">
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
            {activity.participants?.length > 0 && (<InfoIconWrapper sx={{ color: 'inherit' }}>
              <PeopleIcon sx={{ color: 'inherit' }} />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }} color="inherit">
                  {activity.participants?.length || 0} Participants
                </Typography>
                <AvatarGroup max={5}>
                  {activity.participants.map((participant, i) => (
                    <ParticipantAvatar
                      key={participant.usn || i}
                      alt={participant.name}
                      src={`https://eu.ui-avatars.com/api/?name=${participant.name || i}&size=50`}
                      sx={{
                        borderColor: getBgColor(baseType),
                      }}
                    />
                  ))}
                </AvatarGroup>
              </Box>
            </InfoIconWrapper>
            )}
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