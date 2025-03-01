import React from 'react';
import { Box, Typography, Button, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
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
  const theme = useTheme();

  const colors = {
    ongoing: theme.palette.info.main,
    upcoming: theme.palette.info.dark,
    past: theme.palette.secondary.dark,
  };

  const icons = {
    ongoing: <EventIcon sx={{ fontSize: 80, color: colors[type] }} />,
    upcoming: <CalendarTodayIcon sx={{ fontSize: 80, color: colors[type] }} />,
    past: <HistoryIcon sx={{ fontSize: 80, color: colors[type] }} />,
  };

  const actionText = {
    ongoing: 'Check upcoming events',
    upcoming: 'View past events',
    past: 'Browse all events'
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Paper
      component={motion.div}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      elevation={3}
      sx={{
        p: 5,
        textAlign: 'center',
        borderRadius: 4,
        background: (theme) => theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 10px 30px -10px 'rgba(0,0,0,0.2)'`
      }}
    >
      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
        background: `linear-gradient(90deg, ${colors[type]}88 0%, ${colors[type]}22 100%)`
      }} />

      <motion.div
        variants={itemVariants}
        style={{
          position: 'relative',
          padding: '20px',
          borderRadius: '50%',
          background: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.03)',
        }}
      >
        <motion.div
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          {icons[type]}
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            top: -5,
            left: -5,
            right: -5,
            bottom: -5,
            borderRadius: '50%',
            border: `2px solid ${colors[type]}55`,
            zIndex: 0
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.5, 0.7]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>

      <Typography
        variant="h5"
        component={motion.h5}
        variants={itemVariants}
        sx={{
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${colors[type]} 30%, ${theme.palette.text.primary} 90%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        {message}
      </Typography>

      {timelineLink && (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="contained"
            color='inherit'
            size="large"
            sx={{
              mt: 2,
              px: 3,
              py: 1,
              borderRadius: '50px',
              boxShadow: `0 8px 15px -5px ${colors[type]}77`
            }}
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
