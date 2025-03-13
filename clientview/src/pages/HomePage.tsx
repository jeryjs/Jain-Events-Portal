import { Box, Container, Skeleton, Typography, CardMedia, CardContent, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { EventCard, HomeHeader, Section } from '@components/Home';
import NoEventsDisplay from '@components/Home/NoEventsDisplay';
import PageTransition from '@components/shared/PageTransition';
import PhotoGallery from '@components/shared/PhotoGallery';
import { useArticles, useEvents } from '@hooks/useApi';
import { EventType } from '@common/constants';
import { Link } from 'react-router-dom';
import React from 'react';
import { pascalCase } from '@utils/utils';

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
  margin: theme.spacing(1),
  height: '100%',
  flexShrink: 0,
  scrollSnapAlign: 'start',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  transition: 'transform 0.3s, box-shadow 0.3s',
  display: 'flex',
  flexDirection: 'column',
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

function HomePage() {
  const mounted = useRef(false);
  useEffect(() => { if (mounted.current) return; else mounted.current = true; }, []);

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

  const EventSection = {
    ongoing: () => (
      <Section title='Happening Now' key='ongoing' moreLink={getTimelineLink(ongoingEvents)}>
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
    ),
    upcoming: () => (
      <Section title='Upcoming Events' key='upcoming' moreLink={getTimelineLink(upcomingEvents)}>
        <HorizontalScroll whileTap={{ cursor: 'grabbing' }}>
          {isEventsLoading
            ? renderEventCardShimmers(8)
            : upcomingEvents.map((event, idx) => <EventCard key={event.id} event={event} delay={idx} />)}
        </HorizontalScroll>
        {!isEventsLoading && upcomingEvents.length === 0 && !error && (
          <NoEventsDisplay
            message={`No upcoming ${getCategoryString(catTabId[1])} scheduled`}
            type="upcoming"
            timelineLink={getTimelineLink(pastEvents)}
          />
        )}
      </Section>
    ),
    past: () => (
      <Section title='Past Events' key='past' moreLink={getTimelineLink(pastEvents)}>
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
    )
  }

  // Memoize the sections to prevent unnecessary re-creation
  const sortedSections = useMemo(() => {
    return [
      { items: ongoingEvents, view: <EventSection.ongoing />, key: 'ongoing' },
      { items: upcomingEvents, view: <EventSection.upcoming />, key: 'upcoming' },
      { items: pastEvents, view: <EventSection.past />, key: 'past' },
    ].sort((a, b) => (a.items.length === 0 ? 1 : 0) - (b.items.length === 0 ? 1 : 0));
  }, [events, catTabId]);


  return (
    <PageTransition>
      <Container maxWidth="lg">
        <HomeHeader tabValue={catTabId[0]} onTabChange={handleTabChange} />

        {/* Dynamically render the Events section with more events first (past tries to be last) */}
        {sortedSections.map(section => (
          <React.Fragment key={section.key}>
            {section.view}
          </React.Fragment>
        ))}

        {/* Photos Section */}
        {/* <Section title='Photos'>
          <PhotoGallery isLoading={isEventsLoading} />
        </Section> */}

        {/* Articles Section */}
        <Section title='Articles' moreLink='/articles'>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <HorizontalScroll 
              whileTap={{ cursor: 'grabbing' }}
              dragConstraints={{ left: 0, right: 0 }}
              drag="x"
            >
              {isArticlesLoading
                ? renderEventCardShimmers(3)
                : (articles || []).map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                  >
                    <ArticleCard to={`/articles/${article.id}`}>
                      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={article.image.url}
                          alt={article.title}
                          sx={{ 
                            transition: 'transform 0.6s ease-in-out',
                            '&:hover': { transform: 'scale(1.08)' } 
                          }}
                        />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          background: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.4))',
                        }}/>
                        <Chip 
                          size="small"
                          label={pascalCase(EventType[article.relatedEventType]) || 'Article'} 
                          sx={{ 
                            position: 'absolute', 
                            top: 12, 
                            right: 12,
                            backgroundColor: 'ButtonShadow',
                            // color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem'
                          }}
                        />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, lineHeight: 1.2 }}>
                            {article.title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              mb: 2
                            }}
                          >
                            {article.summary}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }}/>
                            <Typography variant="caption" color="text.secondary">
                              {article.readingTimeMinutes || 1} min read
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            color: 'primary.main', 
                            display: 'flex', 
                            alignItems: 'center',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}>
                            READ MORE
                            <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 14 }} />
                          </Box>
                        </Box>
                      </CardContent>
                    </ArticleCard>
                  </motion.div>
                ))}
            </HorizontalScroll>
            
            {!isArticlesLoading && (articles || []).length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
                {[...Array(Math.min(5, (articles || []).length))].map((_, i) => (
                  <Box 
                    key={i} 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: 'primary.main',
                      opacity: i === 0 ? 0.8 : 0.3,
                    }} 
                  />
                ))}
              </Box>
            )}
          </Box>
        </Section>

      </Container>
    </PageTransition>
  );
}

export default HomePage;