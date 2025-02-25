import React from 'react';
import { Box, Typography, Button, Grid, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { motion } from 'framer-motion';

const GalleryContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const TitleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const ImageGrid = styled(Grid)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1, 0),
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
}));

const PhotoItem = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  marginRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
}));

const Image = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
});

// Sample placeholder images
const placeholderImages = [
  'https://picsum.photos/480/360?random=1',
  'https://picsum.photos/480/360?random=2',
  'https://picsum.photos/480/360?random=3',
  'https://picsum.photos/480/360?random=4',
];

interface PhotoGalleryProps {
  title?: string;
  images?: string[];
  isLoading?: boolean;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  title = "Photo Gallery", 
  images = placeholderImages,
  isLoading = false 
}) => {

  return (
    <GalleryContainer>
      <TitleContainer>
        <Typography variant="h6" color='text.primary' fontWeight="bold">{title}</Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          color="inherit"
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          See all
        </Button>
      </TitleContainer>

      <ImageGrid container sx={{ '&:active': { scale: 0.95 } }}>
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Box key={index} sx={{ width: 150, height: 150, mr: 1 }}>
              <Skeleton variant="rectangular" width={150} height={150} />
            </Box>
          ))
        ) : (
          images.map((image, index) => (
            <PhotoItem 
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box sx={{ width: 150, height: 150 }}>
                <Image src={image} alt={`Gallery image ${index + 1}`} />
              </Box>
            </PhotoItem>
          ))
        )}
      </ImageGrid>
    </GalleryContainer>
  );
};

export default PhotoGallery;
