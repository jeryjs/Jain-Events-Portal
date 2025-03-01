import React from 'react';
import { Container, Typography, Box, Divider, Paper, Button, IconButton, Avatar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PageTransition from '../components/shared/PageTransition';
import { motion } from 'framer-motion';

// Import articles data
import articles from '../utils/articlesData';

// Generate a random date in the past 30 days
const getRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

function ArticleDetailPage() {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  
  const article = articles.find(a => a.id.toString() === articleId);
  
  if (!article) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4">Article not found</Typography>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/articles')} 
          sx={{ mt: 2 }}
        >
          Back to Articles
        </Button>
      </Container>
    );
  }
  
  return (
    <PageTransition>
      <Box 
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          width: '100%',
          height: '400px',
          backgroundImage: `url(${article.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton 
              onClick={() => navigate(-1)}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Box>
              <IconButton sx={{ color: 'white' }}>
                <ShareIcon />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <BookmarkBorderIcon />
              </IconButton>
            </Box>
          </Box>
          
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                color="white" 
                sx={{ 
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  mb: 1
                }}
              >
                {article.title}
              </Typography>
              <Typography variant="subtitle1" color="rgba(255,255,255,0.85)" sx={{ mb: 3 }}>
                {article.summary}
              </Typography>
            </motion.div>
          </Container>
        </Box>
      </Box>
      
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Paper elevation={2} sx={{ mt: -5, p: { xs: 3, md: 5 }, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={`https://i.pravatar.cc/150?u=${article.id}`} sx={{ width: 50, height: 50, mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {article.id % 2 === 0 ? 'Alex Johnson' : 'Maya Patel'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Published on {getRandomDate()}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. `.repeat(12)}
            </Typography>
            
            <Typography variant="h5" sx={{ fontWeight: 'bold', my: 3 }}>
              Key Insights
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {`Nulla facilisi. Fusce at est euismod, placerat lorem at, consequat urna. In hac habitasse platea dictumst. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed eget odio eget justo aliquam iaculis. `.repeat(8)}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/articles')}
                sx={{ mr: 2 }}
              >
                Back to Articles
              </Button>
              <Button 
                variant="contained" 
                startIcon={<ShareIcon />}
              >
                Share Article
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </PageTransition>
  );
}

export default ArticleDetailPage;
