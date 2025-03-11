import { EventType } from '@common/constants';
import { Activity, CulturalActivity, SportsActivity } from '@common/models';
import { getBaseEventType } from '@common/utils';
import { useEventActivities } from '@hooks/App';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { Box, Button, Chip, Divider, LinearProgress, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { generateColorFromString } from '../../utils/utils';

interface ActivitiesListProps {
  eventId: string;
  selectedActivityId?: string;
  onSelectActivity: (id: string) => void;
  onCreateActivity: () => void;
}

// Style constants
const cardBorderRadius = 2;
const timelineWidth = 2;

// Timeline connector style
const TimelineConnector = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 12,
  top: 0,
  bottom: 0,
  width: timelineWidth,
  backgroundColor: theme.palette.divider,
  zIndex: 0,
}));

// Timeline dot style
const TimelineDot = styled('div', {
  shouldForwardProp: (prop) => prop !== 'active' && prop !== 'status'
})<{ active?: boolean, status: 'completed' | 'ongoing' | 'upcoming' }>(
  ({ theme, active, status }) => ({
    position: 'absolute',
    left: 12,
    top: 24,
    width: 12,
    height: 12,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1,
    backgroundColor: active
      ? theme.palette.secondary.main
      : status === 'completed'
        ? theme.palette.success.main
        : status === 'ongoing'
          ? theme.palette.warning.main
          : theme.palette.grey[400],
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: active ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
  })
);

// Activity Card Component
const ActivityCard = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    padding: theme.spacing(2),
    marginLeft: theme.spacing(4),
    marginBottom: theme.spacing(2),
    position: 'relative',
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius * cardBorderRadius,
    transition: 'all 0.2s ease-in-out',
    border: `1px solid ${selected
      ? theme.palette.primary.main
      : theme.palette.divider
      }`,
    '&:hover': {
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
      transform: 'translateY(-2px)',
    },
    ...(selected && {
      boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.25)}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
    }),
  })
);

// Activity type chip component
const ActivityTypeChip = ({ type }: { type: EventType }) => {
  const color = generateColorFromString(EventType[type]);
  return (
    <Chip
      size="small"
      label={EventType[type]}
      style={{ backgroundColor: `${color}50` }}
    />
  );
}

// Format time for display
const formatTime = (date: Date) => {
  return dayjs(date).format('h:mm a');
};

// Activity item component
const ActivityItem = ({
  activity,
  isSelected,
  onSelect
}: {
  activity: Activity,
  isSelected: boolean,
  onSelect: () => void
}) => {
  const now = new Date();
  const hasEnded = activity.endTime && activity.endTime < now;
  const isStarted = activity.startTime < now;
  const isOngoing = isStarted && !hasEnded;

  // Determine status for timeline dot
  const status = hasEnded ? 'completed' : isOngoing ? 'ongoing' : 'upcoming';

  // Get additional details based on activity type
  const getActivityDetails = () => {
    const baseType = getBaseEventType(activity.eventType);

    if (baseType === EventType.SPORTS && activity instanceof SportsActivity) {
      const teamsCount = activity.teams?.length || 0;
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {teamsCount > 0 ? `${teamsCount} teams competing` : 'No teams assigned'}
        </Typography>
      );
    }

    if (baseType === EventType.CULTURAL && 'performanceDetails' in activity) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {(activity as CulturalActivity).performanceDetails || 'No performance details'}
        </Typography>
      );
    }

    return null;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <TimelineDot active={isSelected} status={status} />

      <ActivityCard
        selected={isSelected}
        onClick={onSelect}
        elevation={isSelected ? 2 : 1}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography textAlign='left' sx={{ mr: 2 }}>
              {activity.name}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Stack direction="row" spacing={3} sx={{ mt: 1, justifyContent: 'space-between' }}>
          <Tooltip title="Time">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2">
                {formatTime(activity.startTime)}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Participants">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="body2">{activity.participants.length}</Typography>
            </Box>
          </Tooltip>

          <ActivityTypeChip type={activity.eventType} />
        </Stack>
        {getActivityDetails()}
      </ActivityCard>
    </Box>
  );
};

export const ActivitiesList = ({ eventId, selectedActivityId, onSelectActivity, onCreateActivity }: ActivitiesListProps) => {
  const { activities, isLoading } = useEventActivities(eventId);

  // Group activities by date for the timeline
  const groupedActivities = activities.reduce((acc: Record<string, Activity[]>, activity) => {
    const dateKey = dayjs(activity.startTime).format('YYYY-MM-DD');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(activity);
    return acc;
  }, {});

  return (
    <Paper
      elevation={4}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="h6" fontWeight="bold">Activities</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateActivity}
          size="small"
          sx={{ borderRadius: cardBorderRadius, px: 2 }}
        >
          Create Activity
        </Button>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, position: 'relative' }}>
        {isLoading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="subtitle2" color="text.secondary">
              Loading activities...
            </Typography>
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary" fontWeight="medium">
              No activities found
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
              Create your first activity to get started
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={onCreateActivity}
              sx={{ borderRadius: cardBorderRadius }}
            >
              Create Activity
            </Button>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', ml: 1 }}>
            <TimelineConnector />

            {Object.entries(groupedActivities).map(([dateKey, dateActivities]) => (
              <Box key={dateKey} sx={{ mb: 4 }}>
                <Box sx={{ ml: 4, mb: 2 }}>
                  <Typography variant="overline" fontWeight="bold" color="primary">
                    {dayjs(new Date(dateKey)).format('dddd, MMMM D')}
                  </Typography>
                </Box>

                {dateActivities.map(activity => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    isSelected={activity.id === selectedActivityId}
                    onSelect={() => onSelectActivity(activity.id)}
                  />
                ))}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};