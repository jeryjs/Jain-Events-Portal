import { Article } from '@common/models';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { Avatar, Box, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import React from 'react';


interface FeaturedArticleCardProps {
  article: Article;
  bookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 3,
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.01)',
    boxShadow: `0 30px 60px ${alpha(theme.palette.common.black, 0.2)}`,
    '& .MuiCardMedia-root': {
      transform: 'scale(1.05)',
    },
  },
}));

const FeaturedImage = styled('div')(({ image, theme }: { image: string; theme?: any }) => ({
  height: 400,
  backgroundImage: `url(${image})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  transition: 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}));

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({
  article,
  bookmarked,
  onToggleBookmark
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <StyledCard elevation={6}>
        {article.eventTypeString && (
          <Chip
            label={article.eventTypeString}
            color="primary"
            size="small"
            sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2, fontWeight: 'bold' }}
          />
        )}
        <IconButton
          onClick={(e) => { e.preventDefault(); onToggleBookmark(article.id); }}
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}
        >
          {bookmarked ? <BookmarkAddedIcon color="primary" /> : <BookmarkAddIcon />}
        </IconButton>
        <FeaturedImage
          image={article.image.url}
          style={article.imageStyles}
          className="MuiCardMedia-root"
        />
        <CardContent sx={{ p: 3, flexGrow: 1 }}>
          <Typography gutterBottom variant="h4" component="h2" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.2 }}>
            {article.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
            {article.summary}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={article.author.avatar} sx={{ width: 36, height: 36, mr: 1 }} />
              <Box>
                <Typography variant="subtitle2">{article.author.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {article.lastUpdatedAt.toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', fontSize: '0.875rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{article.readingTimeMinutes} min read</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography>{article.viewCount} views</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </StyledCard>
    </motion.div>
  );
};

export default FeaturedArticleCard;