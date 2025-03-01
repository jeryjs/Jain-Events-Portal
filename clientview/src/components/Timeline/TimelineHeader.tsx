import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Box, Chip, styled, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { EventType } from '@common/constants';

// Types
interface TimelineHeaderProps {
  totalEvents: number;
  selectedEventType: number;
  onEventTypeChange: (eventType: number) => void;
}

// Styled components
const HeaderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  // padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: theme.palette.background.paper,
}));

// Horizontal scrolling container for chips without visible scrollbars
const ChipScroller = styled(Box)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  WebkitOverflowScrolling: 'touch',
  margin: theme.spacing(0, -1),
  padding: theme.spacing(0, 1),
}));

// Event type filters component
const EventTypeFilters: React.FC<
  { selectedType: EventType; onChange: (type: EventType) => void; }
> = ({ selectedType, onChange }) => {
  const eventTypes = useMemo(() => [
    { id: -1, label: 'All Events' },
    ...Object.entries(EventType)
      .filter(([key]) => key.endsWith('00'))
      .map(([key, value]) => ({ id: Number(key), label: value })),
  ], []);

  return (
    <ChipScroller sx={{ mt: 1 }}>
      {eventTypes.map((type) => (
        <Chip
          key={type.id}
          label={type.label}
          color={selectedType === type.id ? "primary" : "default"}
          onClick={() => onChange(type.id)}
          clickable
          size="small"
          sx={{ mr: 0.75, whiteSpace: 'nowrap' }}
        />
      ))}
    </ChipScroller>
  );
};

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  totalEvents,
  selectedEventType,
  onEventTypeChange
}) => {
  const navigate = useNavigate();

  return (
    <HeaderCard elevation={2}>
      <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <ArrowBackIcon onClick={() => navigate(-1)} sx={{ mr: 2, cursor: 'pointer' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme => theme.palette.primary.main }}>
          Timeline
          <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
            ({totalEvents} events)
          </Typography>
        </Typography>
      </Box>
      <EventTypeFilters selectedType={selectedEventType} onChange={onEventTypeChange} />
    </HeaderCard>
  );
};

export default TimelineHeader;