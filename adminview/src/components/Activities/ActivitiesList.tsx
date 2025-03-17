import { EventType } from '@common/constants';
import { Activity, CulturalActivity, SportsActivity } from '@common/models';
import { getBaseEventType } from '@common/utils';
import { useEventActivities } from '@hooks/App';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Box, Button, Chip, Divider, IconButton, LinearProgress, Paper, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { generateColorFromString } from '@utils/utils';

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

// Activity type chip component - memoized
const ActivityTypeChip = memo(({ type }: { type: EventType }) => {
  // Use useMemo to avoid recomputing the color on every render
  const color = useMemo(() => generateColorFromString(EventType[type]), [type]);

  return (
    <Chip
      size="small"
      label={EventType[type]}
      style={{ backgroundColor: `${color}50` }}
    />
  );
});

// Format time for display - memoized
const formatTime = (date: Date) => {
  return dayjs(date).format('h:mm a');
};

// Activity item component - memoized
const ActivityItem = memo(({
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

  // Get additional details based on activity type - memoized
  const activityDetails = useMemo(() => {
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
  }, [activity]);

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
        {activityDetails}
      </ActivityCard>
    </Box>
  );
});

// Date header component - memoized
const DateHeader = memo(({ date }: { date: string }) => (
  <Box sx={{ ml: 4, mb: 2, mt: 1 }}>
    <Typography variant="overline" fontWeight="bold" color="primary">
      {dayjs(new Date(date)).format('dddd, MMMM D')}
    </Typography>
  </Box>
));

// Activity group component - memoized
const ActivityGroup = memo(({
  date,
  activities,
  selectedActivityId,
  onSelectActivity
}: {
  date: string,
  activities: Activity[],
  selectedActivityId?: string,
  onSelectActivity: (id: string) => void
}) => {
  return (
    <Box key={date} sx={{ mb: 4 }}>
      <DateHeader date={date} />
      {activities.map(activity => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          isSelected={activity.id === selectedActivityId}
          onSelect={() => onSelectActivity(activity.id)}
        />
      ))}
    </Box>
  );
});

// Empty state component - memoized
const EmptyState = memo(({ onCreateActivity }: { onCreateActivity: () => void }) => (
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
));

// Loading state component - memoized
const LoadingState = memo(() => (
  <Box sx={{ p: 3, textAlign: 'center' }}>
    <LinearProgress sx={{ mb: 2 }} />
    <Typography variant="subtitle2" color="text.secondary">
      Loading activities...
    </Typography>
  </Box>
));

export const ActivitiesList = ({ eventId, selectedActivityId, onSelectActivity, onCreateActivity }: ActivitiesListProps) => {
  const { activities = [], isLoading, refetch } = useEventActivities(eventId);
  const [filter, setFilter] = useState<EventType>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<number | null>(null);

  // Memoize filtered activities to avoid recalculation
  const filteredActivities = useMemo(() =>
    filter === undefined
      ? activities
      : activities.filter(activity => activity.eventType === filter),
    [activities, filter]
  );

  // Memoize grouped activities for better performance
  const groupedActivities = useMemo(() => {
    const groups = filteredActivities.reduce((acc: Record<string, Activity[]>, activity) => {
      const dateKey = dayjs(activity.startTime).format('YYYY-MM-DD');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(activity);
      return acc;
    }, {});

    return Object.entries(groups);
  }, [filteredActivities]);

  // Scroll to selected activity with a smooth animation
  useEffect(() => {
    if (selectedActivityId && scrollContainerRef.current) {
      // Find the selected activity element by ID
      const selectedElement = scrollContainerRef.current.querySelector(`[data-activity-id="${selectedActivityId}"]`);
      if (selectedElement) {
        // Give the DOM time to render before scrolling
        setTimeout(() => {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    }
  }, [selectedActivityId]);

  // Handle refresh with useCallback to stabilize reference
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      // Use setTimeout to ensure minimum visual feedback
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [refetch, refreshing]);

  // Handle filter change with useCallback
  const handleFilterChange = useCallback((e: React.MouseEvent<HTMLElement>, newFilter: EventType) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  }, []);

  // Handle scroll event to add visual feedback
  const handleScroll = useCallback(() => {
    if (!isScrolling) {
      setIsScrolling(true);
    }

    // Clear any existing timer
    if (scrollTimerRef.current !== null) {
      window.clearTimeout(scrollTimerRef.current);
    }

    // Set a new timer to stop the scrolling state
    scrollTimerRef.current = window.setTimeout(() => {
      setIsScrolling(false);
      scrollTimerRef.current = null;
    }, 150);
  }, [isScrolling]);

  // Cleanup any animations or effects on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending animations or timeouts
      setRefreshing(false);
      if (scrollTimerRef.current !== null) {
        window.clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  // Create unique event types list - memoized
  const uniqueEventTypes = useMemo(() =>
    Array.from(new Set(activities.map(activity => activity.eventType))),
    [activities]
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Activities</Typography>
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              size="small"
              sx={{ ml: 1 }}
              color="primary"
              disabled={isLoading || refreshing}
            >
              <RefreshIcon
                fontSize="small"
                className={refreshing ? 'spin-animation' : ''}
              />
            </IconButton>
          </Tooltip>
        </Box>
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

      {/* Add a CSS rule for the spinning animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>

      <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2, position: 'relative' }}>
        {/* Activity Filter UI - optimized with lazy loading */}
        <Box
          sx={{
            mb: 2,
            overflow: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
            position: 'sticky',
            top: 0,
            zIndex: 2,
            backgroundColor: 'background.paper',
            pb: 1
          }}
        >
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={filter}
            exclusive
            onChange={handleFilterChange}
          >
            <ToggleButton value={undefined}>All</ToggleButton>
            {uniqueEventTypes.map(eventType => (
              <ToggleButton key={eventType} value={eventType}>
                {EventType[eventType]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {isLoading ? (
          <LoadingState />
        ) : filteredActivities.length === 0 ? (
          <EmptyState onCreateActivity={onCreateActivity} />
        ) : (
          <Box
            ref={scrollContainerRef}
            onScroll={handleScroll}
            sx={{
              position: 'relative',
              ml: 1,
              height: 'calc(100% - 50px)',
              overflowY: 'auto',
              opacity: isScrolling ? 0.8 : 1,
              transition: 'opacity 0.2s',
              scrollBehavior: 'smooth',
              // Apply custom scrollbar styling
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }
              }
            }}
          >
            <TimelineConnector />

            {groupedActivities.map(([date, activities]) => (
              <ActivityGroup
                key={date}
                date={date}
                activities={activities}
                selectedActivityId={selectedActivityId}
                onSelectActivity={onSelectActivity}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};