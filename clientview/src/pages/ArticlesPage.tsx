import React from 'react';
import { Container, Typography, Card, CardMedia, CardContent, Box, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import PageTransition from '../components/shared/PageTransition';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Grid2 } from '@mui/material';

// Import articles data
import articles from '../utils/articlesData';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '250px',
  width: '100%',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '0 0 24px 24px',
  marginBottom: theme.spacing(4),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}));

const ArticleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s, box-shadow 0.3s',
  overflow: 'hidden',
  textDecoration: 'none',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const ArticleImage = styled(CardMedia)({
  height: 200,
  backgroundSize: 'cover',
  transition: 'transform 0.6s',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

function ArticlesPage() {
  const navigate = useNavigate();
  
  return (
    <PageTransition>
      <HeroSection>
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h3" component="h1" color="white" sx={{ fontWeight: 'bold' }}>
              Articles
            </Typography>
            <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mt: 1 }}>
              Insights & Updates
            </Typography>
          </motion.div>
        </Box>
        
        {/* Background pattern */}
        <Box sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          zIndex: 1
        }} />
      </HeroSection>
      
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid2 container spacing={3}>
          {articles.map((article, index) => (
            <Grid2  key={article.id} size={{xs:12, sm:6, md:4}}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link to={`/articles/${article.id}`} style={{ textDecoration: 'none' }}>
                  <ArticleCard>
                    <ArticleImage image={article.image} title={article.title} />
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                        {article.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {article.summary}
                      </Typography>
                    </CardContent>
                  </ArticleCard>
                </Link>
              </motion.div>
            </Grid2>
          ))}
        </Grid2>
      </Container>
    </PageTransition>
  );
}

export default ArticlesPage;
