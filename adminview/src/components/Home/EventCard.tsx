import { useState } from 'react';
import { Card, CardContent, Typography, Box, Chip, CardMedia } from '@mui/material';
import { styled } from '@mui/material/styles';

import Event from '@common/models/Event';
import { EventType } from '@common/constants';

interface EventCardProps {
  event: Event;
  isSelected: boolean;
  collapsed: boolean;
  onClick: () => void;
}

interface StyledCardProps {
  isSelected: boolean;
  collapsed: boolean;
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'collapsed',
})<StyledCardProps>(({ theme, isSelected, collapsed }) => ({
  position: 'relative',
  mb: 2,
  cursor: 'pointer',
  color: isSelected ? 'white' : 'inherit',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  borderRadius: collapsed ? '50%' : theme.spacing(1),
  minWidth: collapsed ? theme.spacing(6) : 'auto',
  width: collapsed ? theme.spacing(6) : '100%',
  height: collapsed ? theme.spacing(6) : 'auto',
  '&:hover': {
    transform: !collapsed ? 'translateY(-4px)' : 'none',
    boxShadow: theme.shadows[5],
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: isSelected ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)',
    zIndex: 1,
  },
}));

const StyledCardMedia = styled(CardMedia)({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  zIndex: 0,
  backgroundSize: 'cover',
  transform: 'scale(1.1)',
  transition: 'transform 0.3s ease',
  filter: 'brightness(0.6)',
  '&:hover': {
    transform: 'scale(1.2)',
  },
});

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

export const EventCard = ({ event, isSelected, collapsed, onClick }: EventCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    onClick();
  };

  if (!event) {
    return null;
  }

  const firstLetter = event.name.charAt(0).toUpperCase();

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <StyledCard isSelected={isSelected} collapsed={collapsed} onClick={handleClick}>
      {event.banner?.url && <StyledCardMedia image={event.banner.url} title={event.name} />}
      {collapsed ? (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            color: 'white',
            scale: isSelected ? 1.5 : 1,
          }}
        >
          <Typography variant="h6">{firstLetter}</Typography>
        </Box>
      ) : (
        <StyledCardContent>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {event.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Chip
                label={EventType[event.type]}
                size="small"
                sx={{
                  bgcolor: isSelected ? 'rgba(255, 255, 255, 0.3)' : 'primary.dark',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {formatDate(event.time.start)}
              </Typography>
            </Box>
          </Box>
          {expanded && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
                Venue: {event.venue}
              </Typography>
              <Typography variant="body2" sx={{ m2: 1, textAlign: 'justify' }}>
                {event.description.length > 100 ? `${event.description.substring(0, 100)}...` : event.description}
              </Typography>
            </Box>
          )}
        </StyledCardContent>
      )}
    </StyledCard>
  );
};
