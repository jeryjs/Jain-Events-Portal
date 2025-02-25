import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { EventType } from '@common/constants';
import Activity from '@common/models/Activity';
import { Link } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const MotionBox = styled(motion.div)({
  display: 'block',
});

interface ActivityCardProps {
  activity: Activity;
  eventId: string;
  delay?: number;
}

// Helper function to get activity type text
const getActivityType = (type: EventType): string => {
  if (type >= 1000 && type < 2000) return 'Sports';
  if (type >= 2000 && type < 3000) return 'Cultural';
  if (type >= 3000 && type < 4000) return 'Technical';
  return 'General';
};

// Helper function to get chip color based on activity type
const getChipColor = (type: EventType): string => {
  if (type >= 1000 && type < 2000) return '#1976d2';
  if (type >= 2000 && type < 3000) return '#dc004e';
  if (type >= 3000 && type < 4000) return '#2e7d32';
  return '#9c27b0';
};

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, eventId, delay = 0 }) => {
  const activityType = getActivityType(activity.eventType);
  const chipColor = getChipColor(activity.eventType);
  const participantCount = activity.participants?.length || 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        delay: delay * 0.1,
        ease: "easeOut" 
      }
    }
  };

  return (
    <MotionBox
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link to={`/${eventId}/${activity.id}`} style={{ textDecoration: 'none' }}>
        <StyledCard>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  {activity.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {participantCount} Participant{participantCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Chip 
                label={activityType} 
                size="small"
                sx={{ 
                  backgroundColor: chipColor,
                  color: 'white',
                  fontWeight: 'medium',
                }}
              />
            </Box>
          </CardContent>
        </StyledCard>
      </Link>
    </MotionBox>
  );
};

export default ActivityCard;
