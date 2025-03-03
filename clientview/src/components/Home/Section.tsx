import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

const SectionRoot = styled(Box)(({ theme }) => `
  display: flex;
  flex-direction: column;
  color: ${theme.palette.text.primary};
  margin: ${theme.spacing(4)} 0 ${theme.spacing(2)};
`);

const SectionHeader = styled(Box)(({ theme }) => `
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing(2)};
`);

interface SectionProps {
  title: string;
  moreLink?: string;
  children?: React.ReactNode;
}

const Section: React.FC<SectionProps> = React.memo(({ title, moreLink, children }) => {
  return (
    <SectionRoot>
      <SectionHeader>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        {moreLink && (
          <Button 
            component={Link} 
            to={moreLink} 
            endIcon={<ArrowForwardIcon />} 
            color="inherit" 
            size="small" 
            sx={{ color: 'text.secondary' }}
          >
            See all
          </Button>
        )}
      </SectionHeader>
      <Box sx={{ width: '100%' }}>
        {children}
      </Box>
    </SectionRoot>
  );
});

export default Section;