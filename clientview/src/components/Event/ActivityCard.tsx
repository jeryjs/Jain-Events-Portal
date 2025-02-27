import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { EventType } from '@common/constants';
import Activity from '@common/models/Activity';
import { Link } from 'react-router-dom';

const StyledCard = styled(Card)(({ theme }) => `
  margin: ${theme.spacing(1)};
  border-radius: ${theme.shape.borderRadius};
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows[4]};
  }
`);

const MotionBox = styled(motion.div)(() => ` display: block; `);

interface ActivityCardProps {
  activity: Activity;
  eventId: string;
  delay?: number;
}

// Helper function to get activity type text
const getActivityType = (type: EventType): string => {
  const activityTypes = {
    [EventType.TECH]: 'Technical',
    [EventType.CULTURAL]: 'Cultural',
    [EventType.SPORTS]: 'Sports',
    [EventType.GENERAL]: 'General'
  };
  return activityTypes[type] || 'General';
};

// Helper function to get chip color based on activity type
const getChipColor = (type: EventType): string => {
  const typeColors = {
    [EventType.TECH]: '#2e7d32',     // Green
    [EventType.CULTURAL]: '#dc004e',  // Pink
    [EventType.SPORTS]: '#1976d2',    // Blue
    [EventType.GENERAL]: '#9c27b0'    // Purple
  };
  return typeColors[type] || typeColors[EventType.GENERAL];
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
