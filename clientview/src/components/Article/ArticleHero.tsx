import React from 'react';
import { Box, Typography, Chip, Avatar, IconButton } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '50vh',
  minHeight: 400,
  maxHeight: 600,
  width: '100%',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  borderRadius: '0 0 32px 32px',
  [theme.breakpoints.down('md')]: {
    height: '40vh',
    minHeight: 300,
  },
}));

const HeroBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(to bottom, ${alpha(theme.palette.common.black, 0.2)}, ${alpha(theme.palette.common.black, 0.8)})`,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(4, 3),
  color: 'white',
  zIndex: 2,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(6, 4),
  },
}));

interface ArticleHeroProps {
  article: any;
  onBack: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const ArticleHero: React.FC<ArticleHeroProps> = ({ article, onBack, onToggleTheme, isDarkMode }) => {
  return (
    <HeroSection>
      <HeroBackground sx={{ backgroundImage: `url(${article.image.url})`, ...(article.imageStyles || {}) }} />
      <Box sx={{
        position: 'absolute',
        top: 16,
        px: 2,
        zIndex: 3,
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between'
      }}>
        <IconButton
          onClick={onBack}
          sx={{
            color: 'white',
            bgcolor: alpha('#fff', 0.2),
            '&:hover': { bgcolor: alpha('#fff', 0.3) }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <IconButton onClick={onToggleTheme} sx={{ color: 'white' }}>
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
      <HeroContent>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            {article.eventTypeString && (
              <Chip 
                label={article.eventTypeString} 
                color="primary" 
                size="small" 
                sx={{ fontWeight: 'bold', height: 24 }} 
              />
            )}
            {article.isTrending && (
              <Chip 
                label="TRENDING" 
                color="error" 
                size="small" 
                sx={{ fontWeight: 'bold', height: 24 }} 
              />
            )}
            {article.isRecent && (
              <Chip 
                label="NEW" 
                color="success" 
                size="small" 
                sx={{ fontWeight: 'bold', height: 24 }} 
              />
            )}
          </Box>
          <Typography variant="h3" component="h1" sx={{
            fontWeight: 800,
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' }
          }}>
            {article.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={article.author.avatar} alt={article.author.name} sx={{ width: 36, height: 36, mr: 1, border: '2px solid white' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                  {article.author.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>
      </HeroContent>
    </HeroSection>
  );
};

export default ArticleHero;