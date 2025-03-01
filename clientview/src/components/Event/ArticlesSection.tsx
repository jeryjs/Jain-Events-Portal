import React from 'react';
import { Box, Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

// Import articles from shared data
import articles from '../../utils/articlesData';

const SectionTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const HorizontalContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  scrollSnapType: 'x mandatory',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollbarWidth: 'none',
}));

const ArticleCard = styled(Link)(({ theme }) => ({
  minWidth: 280,
  maxWidth: 300,
  flexShrink: 0,
  scrollSnapAlign: 'start',
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': { 
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const ArticlesSection: React.FC = () => {
  // Just show the first 3 articles in the horizontal section
  const displayedArticles = articles.slice(0, 3);
  
  return (
    <>
      <SectionTitle>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Articles</Typography>
        <Button 
          component={Link} 
          to="/articles" 
          endIcon={<ArrowForwardIcon />}
          color="inherit" 
          size="small" 
          sx={{ color: 'text.secondary' }}
        >
          See all
        </Button>
      </SectionTitle>
      <HorizontalContainer 
        whileTap={{ cursor: 'grabbing' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {displayedArticles.map((article, index) => (
          <ArticleCard
            key={article.id}
            
            to={`/articles/${article.id}`}
            sx={{ textDecoration: 'none' }}
          >
            <CardMedia 
              component="img" 
              height="160" 
              image={article.image} 
              alt={article.title}
              sx={{ transition: 'transform 0.5s', '&:hover': { transform: 'scale(1.05)' } }}
            />
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {article.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {article.summary}
              </Typography>
            </CardContent>
          </ArticleCard>
        ))}
      </HorizontalContainer>
    </>
  );
};

export default ArticlesSection;
