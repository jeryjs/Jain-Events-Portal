import { Box, Card, CardContent, Typography, alpha } from '@mui/material';
import { Article } from '@common/models';
import { EventType, ItemVisibility } from '@common/constants';
import LockIcon from '@mui/icons-material/Lock';

interface ArticleCardProps {
  article: Article;
  isSelected: boolean;
  collapsed: boolean;
  onClick: () => void;
}

// Define colors for different article types
const eventTypeColors: Record<number, string> = {
  [EventType.GENERAL]: '#6366F1',   // Indigo
  [EventType.SPORTS]: '#10B981',    // Green
  [EventType.CULTURAL]: '#F59E0B',  // Amber
  [EventType.TECH]: '#3B82F6',      // Blue
};

export const ArticleCard = ({ article, isSelected, collapsed, onClick }: ArticleCardProps) => {
  const eventTypeColor = article.relatedEventType !== undefined 
    ? eventTypeColors[article.relatedEventType] || '#6B7280' // Default gray
    : '#6B7280';
  const isPrivate = article.visibility === ItemVisibility.PRIVATE;
    
  return (
    <Card 
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isSelected ? alpha(eventTypeColor, 0.1) : 'background.paper',
        borderLeft: `4px solid ${isSelected ? eventTypeColor : 'transparent'}`,
        ...(isPrivate ? { opacity: 0.72, filter: 'grayscale(1)', border: '1px solid', borderColor: 'divider' } : {}),
        '&:hover': {
          backgroundColor: isSelected ? alpha(eventTypeColor, 0.15) : alpha('#000', 0.02),
        },
      }}
    >
      <CardContent sx={{ 
        p: collapsed ? 1 : 2, 
        '&:last-child': { pb: collapsed ? 1 : 2 } 
      }}>
        {collapsed ? (
          <Box sx={{ 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(eventTypeColor, 0.1),
            borderRadius: '50%',
            color: eventTypeColor,
            fontWeight: 'bold'
          }}>
            {article.title.substring(0, 1).toUpperCase()}
          </Box>
        ) : (
          <>
            <Typography variant="subtitle1" component="h3" noWrap fontWeight={500}>
              {article.title}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {article.dateString}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {isPrivate && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.25,
                      backgroundColor: 'grey.800',
                      color: 'common.white',
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontWeight: 700,
                    }}
                  >
                    <LockIcon sx={{ fontSize: '0.75rem' }} /> PRIVATE
                  </Typography>
                )}
                {article.relatedEventType !== undefined && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      backgroundColor: alpha(eventTypeColor, 0.1), 
                      color: eventTypeColor,
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      fontWeight: 500
                    }}
                  >
                    {article.eventTypeString}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1, 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {article.summary}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};