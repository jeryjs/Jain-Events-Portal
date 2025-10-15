import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import {
  Alert,
  Avatar, AvatarGroup,
  Box,
  Chip,
  Container,
  Dialog,
  Fab,
  IconButton,
  Snackbar,
  Tooltip,
  Typography
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { EventType, Role } from '@common/constants';
import { Activity, CulturalActivity, InfoActivity, SportsActivity, TechnicalActivity } from '@common/models';
import { Sport } from '@common/models/sports/SportsActivity';
import { getBaseEventType } from '@common/utils';
import { ActivitySkeleton, CulturalsView, GeneralView, InfoView, SportsView, TechView } from '@components/Activity';
import { ActivityForm } from '@components/Activity/admin/ActivityForm';
import { useLogin } from '@components/shared';
import PageTransition from '@components/shared/PageTransition';
import { useUpdateActivity, useDeleteActivity } from '@hooks/admin';
import { useActivity, useEvent } from '@hooks/useApi';
import { pascalCase } from '@utils/utils';
import { borderRadius } from '@mui/system';
import { error } from 'console';
import { useState } from 'react';

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
  const navigate = useNavigate();
  const { userData } = useLogin();
  const { eventId, activityId } = useParams<{ eventId: string; activityId: string }>();
  const { data: event } = useEvent(eventId || '');
  const { data: activity, isLoading } = useActivity(eventId || '', activityId || '');
  const { mutateAsync: updateActivity } = useUpdateActivity(eventId);
  const { mutateAsync: deleteActivity } = useDeleteActivity(eventId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  // Get edit state from URL search params
  const isEditMode = searchParams.get('edit') === 'true';

  // Check if user can edit this activity
  const canEdit = userData && (userData.role >= Role.ADMIN || (event?.managers?.includes(userData.username)));

  // Handle activity save
  const handleActivitySave = async (activityData: Activity) => {
    try {
      await updateActivity(activityData);
      setSearchParams(prev => { prev.delete('edit'); return prev; }, { replace: true });
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to update activity'));
      console.error('Failed to update activity:', error);
    }
  };

  // Handle activity delete
  const handleActivityDelete = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      navigate(`/${eventId}`, { replace: true });
    } catch (error) {
      setError((error instanceof Error ? error.message : 'Failed to delete activity'));
      console.error('Failed to delete activity:', error);
    }
  };

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (!isLoading && !activity) {
    return <ActivityNotFound eventId={eventId || ''} />;
  }

  const handleBack = () => {
    navigate(`/${eventId}`);
  };

  // Determine activity type based on EventType enum
  const baseType = getBaseEventType(activity.type);

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
            case EventType.CULTURAL: return <CulturalsView eventId={eventId} activity={activity as CulturalActivity} />;
            case EventType.TECH: return <TechView activity={activity as TechnicalActivity} />;
            default: return null;
          }
        })()}
      </Container>

      {/* Floating Edit Button (Admin/Manager only) */}
      {canEdit && (
        <Tooltip title="Edit This Activity" placement='left' arrow>
          <Fab color="primary" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }} onClick={() => setSearchParams(prev => { prev.set('edit', 'true'); return prev; }, { replace: true })}>
            <EditIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Edit Activity Dialog */}
      <Dialog 
        open={isEditMode} 
        maxWidth="md" 
        fullWidth
        onClose={() => setSearchParams(prev => { prev.delete('edit'); return prev; }, { replace: true })}
      >
        <ActivityForm
          eventId={eventId}
          activity={activity}
          isCreating={false}
          managers={event?.managers || []}
          onSave={handleActivitySave}
          onDelete={handleActivityDelete}
        />
      </Dialog>
      
      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>{error}</Alert>
      </Snackbar>
    </PageTransition>
  );
}

// Activity Header Component
const ActivityHero = ({ activity, baseType, handleBack }: { activity: Activity; baseType: EventType; handleBack: () => void; }) => {
  // Get appropriate background color based on activity type
  const getBgColor = (type: EventType) => {
    switch (type) {
      case EventType.SPORTS: return 'primary.main';
      case EventType.CULTURAL: return 'secondary.main';
      case EventType.TECH: return 'info.main';
      default: return 'text.primary';
    }
  };

  // Get activity type label
  const getActivityTypeLabel = (type: EventType) => {
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
            label={getActivityTypeLabel(activity.type)}
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