import { Box, Container, Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { ColorModeContext } from '../App';

import { EventCard, HomeHeader, Section } from '@components/Home';
import NoEventsDisplay from '@components/Home/NoEventsDisplay';
import ArticlesSection from '@components/Event/ArticlesSection';
import PageTransition from '@components/shared/PageTransition';
import PhotoGallery from '@components/shared/PhotoGallery';
import { useEvents } from '@hooks/useApi';

const HorizontalScroll = styled(motion.div)(({ theme }) => `
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`);

function HomePage() {
  const colorMode = useContext(ColorModeContext);
  const { data: events, isLoading, error } = useEvents();

  const [catTabId, setTabId] = useState([0, 0]);
  const handleTabChange = (newTabId, newCatId) => setTabId([newTabId, newCatId]);

  const filteredEvents = (events ?? [])
    .filter(event => catTabId[1] > 0 ? event.type === catTabId[1] : true)
    .sort((a, b) => a.time.start.getTime() - b.time.start.getTime());

  const ongoingEvents = filteredEvents?.filter((it) => it.time.start < new Date() && it.time.end > new Date()).slice(0, 6) || [];
  const upcomingEvents = filteredEvents?.filter((it) => it.time.start > new Date()).slice(0, 3) || [];
  const pastEvents = filteredEvents?.filter((it) => it.time.end < new Date()).slice(0, 3) || [];

  const renderEventCardShimmers = (count: number, variant: 'horizontal' | 'vertical' = 'vertical') =>
    Array(count).fill(0).map((_, i) => variant === 'horizontal' ? (
      <Box key={i} sx={{ display: 'flex', mb: 2, width: '100%' }}>
        <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
        <Box sx={{ pl: 2, width: '100%' }}>
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Box>
    ) : (
      <Box key={i} sx={{ minWidth: 300, m: 1 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '16px 16px 0 0' }} />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Box>
    ));

  const getTimelineLink = (events) => {
    if (events.length > 0) {
      return `/timeline#${events[0].time.start.getFullYear()}-${events[0].time.start.toLocaleString('en-US', { month: 'long' })}`;
    }
    return '/timeline';
  }

  return (
    <PageTransition>
      <Container maxWidth="lg">
        <HomeHeader tabValue={catTabId[0]} onTabChange={handleTabChange} />

        {/* Ongoing Events Section */}
        <Section title='Happening Now' moreLink={getTimelineLink(ongoingEvents)}>
          <HorizontalScroll whileTap={{ cursor: 'grabbing' }}>
            {isLoading
              ? renderEventCardShimmers(8)
              : ongoingEvents.map((event, idx) => <EventCard key={event.id} event={event} delay={idx} />)}
          </HorizontalScroll>
          {!isLoading && ongoingEvents.length === 0 && !error && (
            <NoEventsDisplay
              message="No events happening right now"
              type="ongoing"
              timelineLink={getTimelineLink(upcomingEvents)}
            />
          )}
          {error && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error">Failed to load events</Typography>
            </Box>
          )}
        </Section>

        {/* Upcoming Events Section */}
        <Section title='Upcoming Events' moreLink={getTimelineLink(upcomingEvents)}>
          <Box sx={{ alignItems: 'flex-start', '&:active': { scale: 0.95 } }}>
            {isLoading
              ? renderEventCardShimmers(3, 'horizontal')
              : upcomingEvents.map((event, idx) => <EventCard key={`${event.id}-${idx}`} event={event} variant="horizontal" delay={idx} />)}
            {!isLoading && upcomingEvents.length === 0 && !error && (
              <NoEventsDisplay
                message="No upcoming events scheduled"
                type="upcoming"
                timelineLink={getTimelineLink(pastEvents)}
              />
            )}
          </Box>
        </Section>

        {/* Past Events Section */}
        <Section title='Past Events' moreLink={getTimelineLink(pastEvents)}>
          <Box sx={{ alignItems: 'flex-start', '&:active': { scale: 0.95 } }}>
            {isLoading
              ? renderEventCardShimmers(3, 'horizontal')
              : pastEvents.map((event, idx) => <EventCard key={`${event.id}-${idx}`} event={event} variant="horizontal" delay={idx} />)}
            {!isLoading && pastEvents.length === 0 && !error && (
              <NoEventsDisplay
                message="No past events available"
                type="past"
                timelineLink={getTimelineLink(upcomingEvents)}
              />
            )}
          </Box>
        </Section>

        {/* Photos Section */}
        <Section title='Photos'>
          <PhotoGallery isLoading={isLoading} />
        </Section>

        <Box sx={{ my: 4 }}>
          <ArticlesSection />
        </Box>

      </Container>
    </PageTransition>
  );
}

export default HomePage;