import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Typography, Card, CardMedia, CardContent, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import Event from '@common/models/Event';
import { motion } from 'framer-motion';

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 350,
  minWidth: 300,
  margin: theme.spacing(1),
  borderRadius: '16px',
  overflow: 'visible',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const DateBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.secondary.main,
  color: '#fff',
  borderRadius: '8px',
  zIndex: 1,
  boxShadow: theme.shadows[4],
  textAlign: 'center',
  minWidth: '60px',
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: 200,
  position: 'relative',
  borderTopLeftRadius: '16px',
  borderTopRightRadius: '16px',
}));

const LocationWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const MotionCardWrapper = styled(motion.div)({
  display: 'inline-block',
});

interface EventCardProps {
  event: Event;
  variant?: 'horizontal' | 'vertical';
  delay?: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, variant = 'vertical', delay = 0 }) => {
  // Format date for display
  const startDate = new Date(event.time.start);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Extract date parts for badge
  const day = startDate.getDate();
  const month = startDate.toLocaleString('default', { month: 'short' });

  // Default image based on event type
  const getDefaultImage = () => {
    // Using placeholder images based on event type
    const eventTypeNumber = event.eventType;
    if (eventTypeNumber >= 1000 && eventTypeNumber < 2000) {
      return 'https://picsum.photos/480/360?random';
    } else if (eventTypeNumber >= 2000 && eventTypeNumber < 3000) {
      return 'https://picsum.photos/480/360?random';
    } else if (eventTypeNumber >= 3000) {
      return 'https://picsum.photos/480/360?random';
    } else {
      return 'https://picsum.photos/480/360?random';
    }
  };

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
      >
        <Link to={`/${event.id}`} style={{ textDecoration: 'none' }}>
          <Card sx={{ display: 'flex', mb: 2, borderRadius: 2 }}>
            <CardMedia
              component="img"
              sx={{ width: 120, height: 120 }}
              image={getDefaultImage()}
              alt={event.name}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography component="div" variant="h6" sx={{ fontWeight: 'bold' }}>
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
          </Card>
        </Link>
      </MotionCardWrapper>
    );
  }

  return (
    <MotionCardWrapper
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/${event.id}`} style={{ textDecoration: 'none' }}>
        <StyledCard>
          <Box sx={{ position: 'relative' }}>
            <DateBadge>
              <Typography variant="h6" fontWeight="bold">{day}</Typography>
              <Typography variant="caption">{month}</Typography>
            </DateBadge>
            <StyledCardMedia
              component="img"
              image={getDefaultImage()}
              alt={event.name}
            />
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
};

export default EventCard;
