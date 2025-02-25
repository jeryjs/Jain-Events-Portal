import React, { useContext } from 'react';
import { Box, Typography, Container, Button, IconButton, Tab, Tabs, Skeleton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useEvents } from '../hooks/useApi';
import EventCard from '../components/shared/EventCard';
import PageTransition from '../components/shared/PageTransition';
import { ColorModeContext } from '../App';
import { motion } from 'framer-motion';

// Styled components
const AppHeader = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(2),
}));

const TabsContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '& .MuiTabs-flexContainer': {
    overflowX: 'auto',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  margin: theme.spacing(0, 0.5),
  fontWeight: 'medium',
  textTransform: 'none',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
}));

const HorizontalScroll = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  padding: theme.spacing(1, 0),
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
}));

const GallerySection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
  textAlign: 'center',
}));

// Categories for the tabs
const categories = [
  { id: 'discover', label: 'Discover' },
  { id: 'sports', label: 'Sports' },
  { id: 'tech', label: 'Tech' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'other', label: 'Other' },
];

function HomePage() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [tabValue, setTabValue] = React.useState(0);
  const { data: events, isLoading, error } = useEvents<Event[]>();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Event categories
  const latestEvents = events?.slice(0, 3) || [];
  const upcomingEvents = events?.slice(0, 5) || [];
  
  // Loading states
  const renderEventCardShimmers = (count: number, variant: 'horizontal' | 'vertical' = 'vertical') => {
    return Array(count).fill(0).map((_, index) => {
      if (variant === 'horizontal') {
        return (
          <Box key={index} sx={{ display: 'flex', mb: 2, width: '100%' }}>
            <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
            <Box sx={{ pl: 2, width: '100%' }}>
              <Skeleton variant="text" width="80%" height={30} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            </Box>
          </Box>
        );
      }
      return (
        <Box key={index} sx={{ minWidth: 300, m: 1 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: '16px 16px 0 0' }} />
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="80%" height={30} />
            <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
          </Box>
        </Box>
      );
    });
  };

  return (
    <PageTransition>
      <Container maxWidth="lg">
        {/* Header with theme toggle */}
        <AppHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">Jain FET-Hub</Typography>
              <Typography variant="subtitle1" color="text.secondary">The Pulse of Jain FET</Typography>
            </Box>
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
          
          {/* Category Tabs */}
          <TabsContainer>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              TabIndicatorProps={{ style: { display: 'none' } }}
            >
              {categories.map((category, index) => (
                <StyledTab 
                  key={category.id} 
                  label={category.label}
                  disableRipple
                  sx={{
                    bgcolor: tabValue === index ? 'primary.main' : 'action.hover',
                    color: tabValue === index ? 'white' : 'text.primary',
                    '&:hover': {
                      bgcolor: tabValue === index ? 'primary.dark' : 'action.selected',
                    }
                  }}
                />
              ))}
            </Tabs>
          </TabsContainer>
        </AppHeader>

        {/* Latest Events Section */}
        <SectionHeader>
          <Typography variant="h6" fontWeight="bold">Latest Events</Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            color="inherit"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            See all
          </Button>
        </SectionHeader>

        <HorizontalScroll component={motion.div} whileTap={{ cursor: 'grabbing' }}>
          {isLoading ? 
            renderEventCardShimmers(3) :
            latestEvents.map((event, index) => (
              <EventCard key={event.id} event={event} delay={index} />
            ))
          }
          {!isLoading && latestEvents.length === 0 && !error && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No events available</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error">Failed to load events</Typography>
            </Box>
          )}
        </HorizontalScroll>

        {/* Upcoming Events Section */}
        <SectionHeader>
          <Typography variant="h6" fontWeight="bold">Upcoming Events</Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            color="inherit"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            See all
          </Button>
        </SectionHeader>

        <Box 
          sx={{ 
            '&:active': {
              scale: 0.95
            }
          }}
        >
          {isLoading ? 
            renderEventCardShimmers(3, 'horizontal') :
            upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} variant="horizontal" delay={index} />
            ))
          }
          {!isLoading && upcomingEvents.length === 0 && !error && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography>No upcoming events</Typography>
            </Box>
          )}
        </Box>

        {/* Gallery Section (TODO placeholder) */}
        <SectionHeader>
          <Typography variant="h6" fontWeight="bold">Photos</Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            color="inherit"
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            See all
          </Button>
        </SectionHeader>

        <GallerySection>
          <Typography variant="h6" gutterBottom>Gallery</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Photo gallery coming soon! This section will showcase event photos and memories.
          </Typography>
          <Button variant="outlined" color="primary">
            View Demo Gallery
          </Button>
        </GallerySection>

        {/* Admin Link */}
        {/* <Box sx={{ textAlign: 'center', my: 4 }}>
          <Button
            variant="contained"
            color="secondary"
            component="a"
            href={process.env.NODE_ENV === 'development' ? 'http://localhost:5781/admin/' : '/admin'}
          >
            Go to Admin Dashboard
          </Button>
        </Box> */}
      </Container>
    </PageTransition>
  );
}

export default HomePage;