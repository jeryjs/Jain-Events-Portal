import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import { Box, IconButton, InputBase, Typography } from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import React from 'react';

interface ArticlesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  backgroundColor: theme.palette.common.black,
  borderRadius: '0 0 32px 32px',
  marginBottom: theme.spacing(6),
  overflow: 'hidden',
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(6, 2),
  zIndex: 2,
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(8, 4),
  },
}));

const SearchBar = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 50,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  marginTop: theme.spacing(4),
  display: 'flex',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: alpha(theme.palette.common.white, 0.7),
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: theme.palette.common.white,
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1.5, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.7),
      opacity: 1,
    }
  },
}));

const overlayStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  zIndex: 1,
};

const ArticlesHeader: React.FC<ArticlesHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onBack,
}) => {
  return (
    <HeroSection>
      <Box sx={{
          position: 'absolute',
          top: 16,
          px: 2,
          zIndex: 3,
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between'
        }}
      >
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
      </Box>
      <HeroContent>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" component="h1" color="white" sx={{
              fontWeight: 800,
              textAlign: 'center',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}>
            Articles & Insights
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mt: 1, textAlign: 'center' }}>
            Explore the latest updates and stories from Jain FET!
          </Typography>
          <SearchBar>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </SearchBar>
        </motion.div>
      </HeroContent>
      <Box sx={overlayStyle} />
    </HeroSection>
  );
};

export default ArticlesHeader;