import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Link } from 'react-router-dom';

interface NoEventsDisplayProps {
  message?: string;
  type?: 'ongoing' | 'upcoming' | 'past';
  timelineLink?: string;
}

const NoEventsDisplay: React.FC<NoEventsDisplayProps> = ({
  message = 'No events to display',
  type = 'ongoing',
  timelineLink,
}) => {
  const icons = {
    ongoing: <EventIcon sx={{ fontSize: 60, opacity: 0.6 }} />,
    upcoming: <CalendarTodayIcon sx={{ fontSize: 60, opacity: 0.6 }} />,
    past: <EventIcon sx={{ fontSize: 60, opacity: 0.6 }} />,
  };

  const actionText = {
    ongoing: 'Check upcoming events',
    upcoming: 'View past events',
    past: 'Browse all events'
  };

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={2}
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 2,
        background: (theme) => theme.palette.mode === 'dark'
          ? 'linear-gradient(145deg, #2a2a2a 0%, #212121 100%)'
          : 'linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 100%)',
        my: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
      >
        {icons[type]}
      </motion.div>

      <Typography variant="h6" component={motion.h6}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {message}
      </Typography>

      {timelineLink && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            component={Link}
            to={timelineLink}
          >
            {actionText[type]}
          </Button>
        </motion.div>
      )}
    </Paper>
  );
};

export default NoEventsDisplay;
