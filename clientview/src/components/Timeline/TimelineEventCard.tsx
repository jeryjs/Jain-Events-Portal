import React from 'react';
import { Box, Typography, Paper, Chip, ChipProps, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { EventType } from '@common/constants';
import { Link } from 'react-router-dom';

interface TimelineEventCardProps {
  event: any;
  sx?: {};
}

const CardContainer = styled(motion.create(Paper))(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  cursor: 'pointer',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
  },
}));

const CardBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  zIndex: 0,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)',
    zIndex: 1,
  },
}));

const CardContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(2),
  color: 'white',
}));

interface EventTypeChipProps extends ChipProps {
  type: EventType;
}

const EventTypeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'type',
})<EventTypeChipProps>(({ theme, type }) => {
  const getChipColor = (type: EventType): string => {
    const typeColors = {
      [EventType.TECH]: theme.palette.success.main,
      [EventType.CULTURAL]: theme.palette.error.main,
      [EventType.SPORTS]: theme.palette.info.main,
      [EventType.GENERAL]: theme.palette.secondary.main,
    };
    return typeColors[type] || typeColors[EventType.GENERAL];
  };

  return {
    backgroundColor: getChipColor(type),
    color: 'white',
    fontWeight: 'medium',
    fontSize: '0.75rem',
    height: 20,
    marginBottom: theme.spacing(1),
  };
});

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(1),
  '& svg': {
    fontSize: '1rem',
    marginInlineEnd: theme.spacing(0.5),
    opacity: 0.8,
  },
  '& p': {
    fontSize: '0.8rem',
    opacity: 0.9,
  },
}));

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({ event, sx }) => {
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      ...(useMediaQuery('(max-width:900px)') && { day: 'numeric', month: 'short' }),
    });
  };

  const eventDate = new Date(event.time.start);
  const formattedTime = formatDate(eventDate);

  // Get default banner if not available
  const bannerUrl = event.banner?.url || 'https://admissioncart.in/new-assets/img/university/jain-deemed-to-be-university-online-ju-online_banner.jpeg';

  return (
    <CardContainer
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      sx={sx}
    >
      <Link to={`/${event.id}`} >
        <CardBackground
          style={{
            backgroundImage: `url(${bannerUrl})`,
            ...event.eventBannerStyles
          }}
        />
        <CardContent>
          <EventTypeChip
            label={EventType[event.type].charAt(0).toUpperCase() + EventType[event.type].slice(1).toLowerCase()}
            type={event.type}
            size="small"
          />

          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {event.name}
          </Typography>

          <InfoItem>
            <AccessTimeIcon />
            <Typography variant="body2">{formattedTime}</Typography>
          </InfoItem>

          <InfoItem>
            <LocationOnIcon />
            <Typography variant="body2">{event.venue}</Typography>
          </InfoItem>
        </CardContent>
      </Link >
    </CardContainer>
  );
};

export default TimelineEventCard;
