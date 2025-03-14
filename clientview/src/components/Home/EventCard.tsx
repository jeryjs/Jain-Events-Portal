import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Event from '@common/models/Event';
import { motion } from 'framer-motion';

// Styled components
const StyledCard = styled(Card)(({ theme }) => `
  min-width: 300px;
  margin: ${theme.spacing(1)};
  border-radius: 16px;
  overflow: visible;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${theme.shadows[8]};
  }
`);

const DateBadge = styled(motion.div)(({ theme }) => `
  position: absolute;
  top: 8px;
  left: 8px;
  padding: ${theme.spacing(1)};
  background-color: ${theme.palette.action.hover};
  backdrop-filter: blur(12px);
  color: ${theme.palette.action.active};
  border-radius: 8px;
  z-index: 1;
  box-shadow: ${theme.shadows[4]};
  text-align: center;
  min-width: 60px;
  font-size: ${theme.typography.body2.fontSize};
  &:hover {
    transform: scale(1.1);
    transition: transform 0.2s ease-in-out;
  }
`);

const StyledCardMedia = styled(CardMedia)(`
  height: 200px;
  position: relative;
  border-radius: 16px;
  object-fit: cover;
`);

const Shimmer = styled('div')`
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 16px;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const LocationWrapper = styled(Box)(({ theme }) => `
  display: flex;
  align-items: center;
  margin-top: ${theme.spacing(1)};
  color: ${theme.palette.text.secondary};
`);

const MotionCardWrapper = styled(motion.div)(`
  display: inline-block;
`);

interface EventCardProps {
  event: Event;
  variant?: 'horizontal' | 'vertical';
  delay?: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, variant = 'vertical', delay = 0 }) => {

  // Check the start date year and set date/time accordingly
  const startDate = new Date(event.time.start);
  let formattedDate: string;
  let formattedTime: string;
  let day: number | string;
  let month: string;

  if (startDate.getFullYear() >= 3000) {
    formattedDate = "Coming Soon";
    formattedTime = "Stay tuned for the big reveal!";
    day = "";
    month = "";
  } else {
    formattedDate = startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    });

    formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Extract date parts for badge
    day = startDate.getDate();
    month = startDate.toLocaleString('default', { month: 'short' });
  }

  // Load the event image and show shimmer while loading
  const getEventImage = async () => {
    const imageSrc = event.banner.url ?? `https://admissioncart.in/new-assets/img/university/jain-deemed-to-be-university-online-ju-online_banner.jpeg`;
    try { await fetch(imageSrc) } catch { return imageSrc };  // To figure out how long to show the shimmer for the image on load
    return imageSrc;
  };

  const { isLoading, error, data: imageSrc } = useQuery({
    queryKey: ['eventImage', event.id],
    queryFn: getEventImage,
    staleTime: Infinity,
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    }
  };

  if (variant === 'horizontal') {
    return (
      <MotionCardWrapper
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        sx={{ width: '100%' }}
      >
        <Link to={`/${event.id}`} style={{ textDecoration: 'none' }}>
          <StyledCard sx={{ display: 'flex', mb: 2, borderRadius: 2, width: '100%' }}>
            <Box sx={{
              width: { xs: 130, sm: 220 },
              height: { xs: 130, sm: 160 },
              position: 'relative',
              flexShrink: 0
            }}>
              {isLoading && <Shimmer />}
              <StyledCardMedia
                sx={{ width: '100%', height: '100%', display: 'block' }}
                style={event.eventBannerStyles}
                image={imageSrc}
                title={event.name}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2, overflow: 'hidden', flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', textOverflow: 'ellipsis' }}>
                {event.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formattedDate}, {formattedTime}
              </Typography>
              <LocationWrapper>
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{event.venue}</Typography>
              </LocationWrapper>
            </Box>
          </StyledCard>
        </Link>
      </MotionCardWrapper>
    );
  } else {
    return (
      <MotionCardWrapper
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to={`/${event.id}`} style={{ textDecoration: 'none' }}>
          <StyledCard sx={{ position: 'relative' }}>
            {day && <DateBadge>
              <Typography variant="h6" fontWeight="bold">{day}</Typography>
              <Typography variant="caption">{month}</Typography>
            </DateBadge>}
            <Box sx={{ height: 200, position: 'relative' }}>
              {isLoading
                ? <Shimmer />
                : <StyledCardMedia
                  sx={{ height: '100%', display: 'block' }}
                  style={event.eventBannerStyles}
                  image={imageSrc}
                  title={event.name}
                />
              }
            </Box>
            <CardContent>
              <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {event.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {formattedDate}, {formattedTime}
                </Typography>
              </Box>
              <LocationWrapper>
                <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">{event.venue}</Typography>
              </LocationWrapper>
            </CardContent>
          </StyledCard>
        </Link>
      </MotionCardWrapper>
    );
  }
};

export default EventCard;