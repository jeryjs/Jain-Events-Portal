import { motion } from 'framer-motion';
import React, { memo } from 'react';
import { Link } from 'react-router-dom';

// MUI Components
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Typography,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';

// MUI Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';

// Article Model
import { Article } from '@common/models';


type variant = 'featured' | 'list';

export interface ArticleCardProps {
  variant: variant;
  article: Article;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

// Styled components
const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'cardVariant'
})<{ cardVariant: variant }>(({ cardVariant }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: cardVariant === 'featured' ? 24 : 16,
  position: 'relative',
  boxShadow: cardVariant === 'featured'
    ? '0 20px 40px rgba(0, 0, 0, 0.15)'
    : '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: `translateY(${cardVariant === 'featured' ? -8 : -6}px)`,
    boxShadow: cardVariant === 'featured'
      ? '0 30px 60px rgba(0, 0, 0, 0.2)'
      : '0 8px 16px rgba(0, 0, 0, 0.12)',
  },
}));

const StyledMedia = styled(CardMedia, {
  shouldForwardProp: (prop) => prop !== 'variant'
})<{ variant: variant }>(({ variant }) => ({
  width: '100%',
  height: variant === 'featured' ? 400 : 240,
  transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}));

const TruncatedText = styled(Typography)({
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  textOverflow: 'ellipsis'
});

// Sub-components
const StatusChips: React.FC<{ article: Article, variant: variant }> = ({ article, variant }) => {
  if (variant === 'featured' && article.eventTypeString) {
    return (
      <Chip
        label={article.eventTypeString}
        color="primary"
        size="small"
        sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2, fontWeight: 'bold' }}
      />
    );
  }

  return (
    <>
      {variant === 'list' && article.isRecent && (
        <Chip
          label="NEW"
          color="error"
          size="small"
          sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, fontWeight: 'bold' }}
        />
      )}
      {variant === 'list' && article.isTrending && (
        <Chip
          label="TRENDING"
          color="success"
          size="small"
          sx={{
            position: 'absolute',
            top: article.isRecent ? 42 : 8,
            left: 8,
            zIndex: 2,
            fontWeight: 'bold'
          }}
        />
      )}
    </>
  );
};

const ArticleCard = memo<ArticleCardProps>(({
  variant,
  article,
  bookmarked,
  onToggleBookmark
}) => {
  const isWideScreen = useMediaQuery('(min-width:600px)');

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleBookmark(article.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: variant === 'featured' ? 0.6 : 0.4 }}
    >
      <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
        <StyledCard cardVariant={variant}>
          <Box sx={{ position: 'relative' }}></Box>
          <StatusChips article={article} variant={variant} />

          <IconButton
            onClick={handleBookmarkClick}
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
          >
            {bookmarked ? <BookmarkAddedIcon color="primary" /> : <BookmarkAddIcon />}
          </IconButton>

          <StyledMedia
            variant={variant}
            image={article.image.url}
            title={article.title}
            style={article.imageStyles}
          />

          <CardContent sx={{ p: 3, flexGrow: 1 }}>
            <TruncatedText
              gutterBottom
              variant={variant === 'featured' ? 'h4' : 'h6'}
              // component="h2"
              sx={{
                fontWeight: 700,
                mb: 2
              }}
            >
              {article.title}
            </TruncatedText>

            <TruncatedText
              variant={variant === 'featured' ? 'subtitle1' : 'body2'}
              color={variant === 'featured' ? 'text.primary' : 'text.secondary'}
              sx={{ mb: 2 }}
            >
              {article.summary}
            </TruncatedText>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
              {variant === 'featured' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {article.author.avatar && (
                    <Avatar src={article.author.avatar} sx={{ width: 36, height: 36, mr: 1 }} />
                  )}
                  <Box>
                    <Typography variant="subtitle2">{article.author.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {article.lastUpdatedAt?.toLocaleDateString() || ''}
                    </Typography>
                  </Box>
                </Box>
              )}

              {variant === 'featured' && isWideScreen && (
                <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    <Typography>{article.readingTimeMinutes} min read</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
                    <Typography>{article.viewCount} views</Typography>
                  </Box>
                </Box>
              )}

              {variant === 'list' && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ display: 'flex', mr: 2 }}>
                      <AccessTimeIcon sx={{ mr: 0.5 }} fontSize="small" />
                      <Typography variant="body2">{article.readingTimeMinutes} min</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{article.publishedAt?.toLocaleDateString() || ''}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', mr: 1.5 }}>
                      <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
                      <Typography variant="body2">{article.viewCount}</Typography>
                    </Box>
                    {article.eventTypeString && (<Chip label={article.eventTypeString} size="small" />)}
                  </Box>
                </Box>
              )}
            </Box>
          </CardContent>
        </StyledCard>
      </Link>
    </motion.div >
  );
});

export default ArticleCard;