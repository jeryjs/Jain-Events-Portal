import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Box, Container, Skeleton, Typography, useMediaQuery, useTheme, Chip, FormControl, MenuItem, Select, Card, Stack, Grid, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import PageTransition from '@components/shared/PageTransition';
import FastScrollbar from '@components/Timeline/FastScrollbar';
import TimelineEventCard from '@components/Timeline/TimelineEventCard';

import { useDummyEvents } from '@hooks/useApi';
import { Event } from '@common/models';
import TimelineHeader from '@components/Timeline/TimelineHeader';

// Types
interface MarkerType {
  year: string;
  month: string;
}

interface GroupedEvents {
  [year: string]: {
    [month: string]: Event[];
  };
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

// Styled components
const TimelineContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  height: 'calc(100vh - 120px)',
  overflowY: 'auto',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  paddingBottom: theme.spacing(4),
}));

const TimelineWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  [theme.breakpoints.up('md')]: {
    paddingRight: theme.spacing(4),
  },
}));

const MonthYearHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  position: 'sticky',
  top: 0,
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 0),
  zIndex: 3,
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
}));

const StyledTimelineItem = styled(TimelineItem)(({ theme }) => ({
  minHeight: 'auto',
  marginBottom: theme.spacing(4),
  ':before': {
    flex: 0,
    padding: 0,
  },
  [theme.breakpoints.down('md')]: {
    ':before': {
      display: 'none',
    }
  }
}));

const LoadingPlaceholder = () => (
  <Box sx={{ mt: 4 }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ display: 'flex', mb: 3 }}>
        <Skeleton variant="circular" width={20} height={20} sx={{ mr: 2 }} />
        <Box sx={{ width: '100%' }}>
          <Skeleton variant="text" height={30} width="30%" sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={120} width="100%" sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    ))}
  </Box>
);

function TimelinePage() {
  const theme = useTheme();
  const { data: events, isLoading } = useDummyEvents(20);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeMarker, setActiveMarker] = useState<MarkerType | null>(null);
  const [itemRefs, setItemRefs] = useState<Record<string, React.RefObject<HTMLElement>>>({});
  const isWideScreen = useMediaQuery('(min-width: 900px)');
  const [selectedEventType, setSelectedEventType] = useState(-1);

  // Memoize expensive calculations
  const groupedEvents = useMemo<GroupedEvents>(() => {
    if (!events || !Array.isArray(events)) return {};

    // Filter events if an event type is selected
    const filteredEvents = selectedEventType === -1
      ? events 
      : events.filter(event => event.type === selectedEventType);

    return filteredEvents.reduce((groups: GroupedEvents, event) => {
      const date = new Date(event.time.start);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      if (!groups[year]) {
        groups[year] = {};
      }

      if (!groups[year][month]) {
        groups[year][month] = [];
      }

      groups[year][month].push(event);
      return groups;
    }, {});
  }, [events, selectedEventType]);

  // Extract available years for the dropdown
  const availableYears = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => parseInt(b) - parseInt(a));
  }, [groupedEvents]);

  // Total number of events
  const totalEventCount = useMemo(() => {
    return events?.length || 0;
  }, [events]);

  // Handle year selection from dropdown
  const handleYearSelect = useCallback((year: string) => {
    if (!year || !groupedEvents[year]) return;
    
    // Find the first month in the selected year
    const firstMonth = Object.keys(groupedEvents[year])[0];
    if (firstMonth) {
      scrollToSection({ year, month: firstMonth });
    }
  }, [groupedEvents]);

  // Create timeline markers for the scrollbar
  const timelineMarkers = useMemo<MarkerType[]>(() => {
    const markers: MarkerType[] = [];
    Object.entries(groupedEvents).forEach(([year, months]) => {
      Object.keys(months).forEach((month) => {
        markers.push({ year, month });
      });
    });
    return markers;
  }, [groupedEvents]);

  // Initialize refs for sections
  useEffect(() => {
    if (events && events.length > 0) {
      const refs: Record<string, React.RefObject<HTMLElement>> = {};
      Object.keys(groupedEvents).forEach(year => {
        Object.keys(groupedEvents[year]).forEach(month => {
          refs[`${year}-${month}`] = React.createRef<HTMLElement>();
        });
      });
      setItemRefs(refs);

      // Set initial active marker if none is set
      if (!activeMarker && timelineMarkers.length > 0) {
        setActiveMarker(timelineMarkers[0]);
      }
    }
  }, [events, groupedEvents, activeMarker, timelineMarkers]);

  // Handle scrolling to a section
  const scrollToSection = useCallback((marker: MarkerType) => {
    const key = `${marker.year}-${marker.month}`;
    if (itemRefs[key]?.current) {
      const topOffset = 20; // Adjust for header padding
      const elementTop = itemRefs[key].current.getBoundingClientRect().top;
      const scrollTop = timelineRef.current?.scrollTop || 0;

      timelineRef.current?.scrollTo({
        top: scrollTop + elementTop - topOffset,
        behavior: 'smooth'
      });
    }
    setActiveMarker(marker);
  }, [itemRefs]);

  // Handle timeline scroll to update active marker
  const handleTimelineScroll = useCallback(() => {
    if (!timelineRef.current) return;

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const scrollPosition = timelineRef.current?.scrollTop || 0;
      const viewportHeight = timelineRef.current?.clientHeight || 0;
      const viewportMid = scrollPosition + viewportHeight / 3; // 1/3 from the top

      let closestElement = null;
      let minDistance = Infinity;

      // Find the closest section to the viewport mid
      Object.entries(itemRefs).forEach(([key, ref]) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const elementTop = rect.top + scrollPosition;
          const distance = Math.abs(elementTop - viewportMid);

          if (distance < minDistance) {
            minDistance = distance;
            closestElement = key;
          }
        }
      });

      if (closestElement) {
        const [year, month] = closestElement.split('-');
        const newMarker = { year, month };

        if (!activeMarker || activeMarker.year !== year || activeMarker.month !== month) {
          setActiveMarker(newMarker);
        }
      }
    });
  }, [timelineRef, itemRefs, activeMarker]);

  // Determine the direction of timeline items for alternating layout
  const itemDirection = useCallback((event: Event): 'left' | 'right' => {
    if (!isWideScreen) return 'right';
    return events.indexOf(event) % 2 === 0 ? 'left' : 'right';
  }, [events, isWideScreen]);

  // Format date for display
  const formatEventDate = useCallback((date: Date): string => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  }, []);

  return (
    <PageTransition>
      <Container maxWidth="lg" sx={{ pt: 2, pb: 2 }}>

        <Typography variant="h4" color='text.primary' sx={{ mb: 1, fontWeight: 'bold' }}>
          Timeline
        </Typography>

        {isLoading ? (
          <LoadingPlaceholder />
        ) : (
          <TimelineContainer
            ref={timelineRef}
            onScroll={handleTimelineScroll}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TimelineWrapper>
              <Timeline position="alternate" sx={{ p: 0 }}>
                {Object.entries(groupedEvents).map(([year, months]) => (
                  <React.Fragment key={year}>
                    {Object.entries(months).map(([month, monthEvents]) => (
                      <Box
                        component="section"
                        id={`${year}-${month}`}
                        key={`${year}-${month}`}
                        ref={itemRefs[`${year}-${month}`]}
                      >
                        <MonthYearHeader variant="h5" color="text.secondary">
                          {month} {year}
                        </MonthYearHeader>

                        {monthEvents.map((event) => (
                          <motion.div key={event.id} variants={itemVariants}>
                            <StyledTimelineItem position={itemDirection(event)}>
                              <TimelineOppositeContent sx={{
                                display: { xs: 'none', md: 'block' },
                                margin: 'auto 0',
                                color: theme.palette.text.secondary,
                                fontWeight: 500,
                              }}>
                                {formatEventDate(new Date(event.time.start))}
                              </TimelineOppositeContent>

                              <TimelineSeparator>
                                <TimelineConnector />
                                <TimelineDot variant="outlined" sx={{ my: 0.5 }} />
                                <TimelineConnector />
                              </TimelineSeparator>

                              <TimelineContent sx={{ py: '12px', px: 2 }}>
                                <TimelineEventCard 
                                  event={event}
                                  sx={{ direction: itemDirection(event) === 'left' ? 'rtl' : 'ltr' }} />
                              </TimelineContent>
                            </StyledTimelineItem>
                          </motion.div>
                        ))}
                      </Box>
                    ))}
                  </React.Fragment>
                ))}
              </Timeline>
            </TimelineWrapper>

            <FastScrollbar
              markers={timelineMarkers}
              activeMarker={activeMarker}
              onMarkerSelect={scrollToSection}
              showMarkerLabels={isWideScreen}
            />
          </TimelineContainer>
        )}
      </Container>
    </PageTransition>
  );
}

export default TimelinePage;