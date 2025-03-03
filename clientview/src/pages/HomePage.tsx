import { Box, Container, Skeleton, Typography, CardMedia, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { ColorModeContext } from '../App';

import { EventCard, HomeHeader, Section } from '@components/Home';
import NoEventsDisplay from '@components/Home/NoEventsDisplay';
import PageTransition from '@components/shared/PageTransition';
import PhotoGallery from '@components/shared/PhotoGallery';
import { useArticles, useEvents } from '@hooks/useApi';
import { EventType } from '@common/constants';
import { Link } from 'react-router-dom';

const HorizontalScroll = styled(motion.div)(({ theme }) => `
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`);

const ArticleCard = styled(Link)(({ theme }) => ({
  minWidth: 280,
  maxWidth: 300,
  flexShrink: 0,
  scrollSnapAlign: 'start',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

function HomePage() {
  const colorMode = useContext(ColorModeContext);
  const { data: events, isLoading: isEventsLoading, error } = useEvents();
  const { data: articles, isLoading: isArticlesLoading } = useArticles();

  const [catTabId, setTabId] = useState([0, -1]);
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

  const getCategoryString = (catId) => {
    const categories = [
      ...Object.entries(EventType)
        .filter(([key]) => key == '0' || key.endsWith('00'))
        .map(([key, value]) => ({ id: Number(key), label: value })),
    ];
    const category = categories.find((cat) => cat.id === catId);
    return category ? String(category.label).toLowerCase() + ' events' : 'events';
  };

  return (
    <PageTransition>
      <Container maxWidth="lg">
        <HomeHeader tabValue={catTabId[0]} onTabChange={handleTabChange} />

        {/* Ongoing Events Section */}
        <Section title='Happening Now' moreLink={getTimelineLink(ongoingEvents)}>
          <HorizontalScroll whileTap={{ cursor: 'grabbing' }}>
            {isEventsLoading
              ? renderEventCardShimmers(8)
              : ongoingEvents.map((event, idx) => <EventCard key={event.id} event={event} delay={idx} />)}
          </HorizontalScroll>
          {!isEventsLoading && ongoingEvents.length === 0 && !error && (
            <NoEventsDisplay
              message={`No ${getCategoryString(catTabId[1])} happening right now`}
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
          {isEventsLoading
            ? renderEventCardShimmers(3, 'horizontal')
            : upcomingEvents.map((event, idx) => <EventCard key={event.id} event={event} variant="horizontal" delay={idx} />)}
          {!isEventsLoading && upcomingEvents.length === 0 && !error && (
            <NoEventsDisplay
              message={`No upcoming ${getCategoryString(catTabId[1])} scheduled`}
              type="upcoming"
              timelineLink={getTimelineLink(pastEvents)}
            />
          )}
        </Section>

        {/* Past Events Section */}
        <Section title='Past Events' moreLink={getTimelineLink(pastEvents)}>
          {isEventsLoading
            ? renderEventCardShimmers(3, 'horizontal')
            : pastEvents.map((event, idx) => <EventCard key={event.id} event={event} variant="horizontal" delay={idx} />)}
          {!isEventsLoading && pastEvents.length === 0 && !error && (
            <NoEventsDisplay
              message={`No past ${getCategoryString(catTabId[1])} available`}
              type="past"
              timelineLink={getTimelineLink(upcomingEvents)}
            />
          )}
        </Section>

        {/* Photos Section */}
        <Section title='Photos'>
          <PhotoGallery isLoading={isEventsLoading} />
        </Section>

        {/* Articles Section */}
        <Section title='Articles' moreLink='/articles'>
          <HorizontalScroll whileTap={{ cursor: 'grabbing' }}>
            {isEventsLoading
              ? renderEventCardShimmers(3)
              : (articles || []).map((article) => (
                <ArticleCard
                  key={article.id}
                  to={`/articles/${article.id}`}
                  sx={{ textDecoration: 'none' }}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={article.image.url}
                    alt={article.title}
                    sx={{ transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {article.summary}
                    </Typography>
                  </CardContent>
                </ArticleCard>
              ))}
          </HorizontalScroll>
        </Section>

      </Container>
    </PageTransition>
  );
}

export default HomePage;