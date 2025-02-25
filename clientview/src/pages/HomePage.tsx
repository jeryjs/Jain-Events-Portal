import React, { useState, useContext } from 'react';
import { Container, Box, Typography, Button, IconButton, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { HomeHeader, EventCard } from '../components/Home';
import PageTransition from '../components/shared/PageTransition';
import { useEvents } from '../hooks/useApi';
import { ColorModeContext } from '../App';
import { styled } from '@mui/material/styles';

const SectionHeader = styled(Box)(({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${theme.palette.text.primary};
  margin: ${theme.spacing(4)} 0 ${theme.spacing(2)};
`);

const HorizontalScroll = styled(motion.div)(({ theme }) => `
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
  &::-webkit-scrollbar { display: none; }
  scrollbar-width: none;
`);

const GallerySection = styled(Box)(({ theme }) => `
  margin: ${theme.spacing(4)} 0;
  padding: 24px; border-radius: 8px;
  background-color: #262626;
  text-align: center;
`);

function HomePage() {
  const colorMode = useContext(ColorModeContext);
  const { data: events, isLoading, error } = useEvents();
  
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);
  
  
  const latestEvents = events?.slice(0, 3) || [];
  const upcomingEvents = events?.slice(0, 5) || [];

  const renderEventCardShimmers = (count: number, variant: 'horizontal' | 'vertical' = 'vertical') => 
    Array(count).fill(0).map((_, i) => variant==='horizontal' ? (
      <Box key={i} sx={{ display:'flex', mb:2, width:'100%' }}>
        <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
        <Box sx={{ pl:2, width:'100%' }}>
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mt:1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt:1 }} />
        </Box>
      </Box>
    ) : (
      <Box key={i} sx={{ minWidth:300, m:1 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius:'16px 16px 0 0' }} />
        <Box sx={{ p:2 }}>
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mt:1 }} />
          <Skeleton variant="text" width="40%" height={20} sx={{ mt:1 }} />
        </Box>
      </Box>
    ));

  return (
    <PageTransition>
      <Container maxWidth="lg">
        <HomeHeader tabValue={tabValue} onTabChange={handleTabChange} />

        <SectionHeader>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Happening Now</Typography>
          <Button endIcon={<ArrowForwardIcon />} color="inherit" size="small" sx={{ color:'text.secondary' }}>
            See all
          </Button>
        </SectionHeader>

        <HorizontalScroll whileTap={{ cursor:'grabbing' }}>
          {isLoading 
            ? renderEventCardShimmers(3) 
            : latestEvents.map((event, idx) => <EventCard key={event.id} event={event} delay={idx} />)}
          {!isLoading && latestEvents.length===0 && !error && (
            <Box sx={{ p:4, textAlign:'center' }}>
              <Typography>No events available</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ p:4, textAlign:'center' }}>
              <Typography color="error">Failed to load events</Typography>
            </Box>
          )}
        </HorizontalScroll>

        <SectionHeader>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Upcoming Events</Typography>
          <Button endIcon={<ArrowForwardIcon />} color="inherit" size="small" sx={{ color:'text.secondary' }}>
            See all
          </Button>
        </SectionHeader>

        <Box sx={{ alignItems:'flex-start', '&:active':{ scale:0.95 } }}>
          {isLoading 
            ? renderEventCardShimmers(3, 'horizontal') 
            : upcomingEvents.map((event, idx) => <EventCard key={`${event.id}-${idx}`} event={event} variant="horizontal" delay={idx} />)}
          {!isLoading && upcomingEvents.length===0 && !error && (
            <Box sx={{ p:4, textAlign:'center' }}>
              <Typography>No upcoming events</Typography>
            </Box>
          )}
        </Box>

        <SectionHeader>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Photos</Typography>
          <Button endIcon={<ArrowForwardIcon />} color="inherit" size="small" sx={{ color:'text.secondary' }}>
            See all
          </Button>
        </SectionHeader>

        <GallerySection>
          <Typography variant="h6" gutterBottom>Gallery</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Photo gallery coming soon! This section will showcase event photos and memories.
          </Typography>
          <Button variant="outlined" color="primary">View Demo Gallery</Button>
        </GallerySection>
        {/* ...existing admin link commented out... */}
      </Container>
    </PageTransition>
  );
}

export default HomePage;