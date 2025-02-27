import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Skeleton, Dialog, IconButton, Backdrop } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const GalleryContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const ImageGrid = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(2),
}));

const ImageRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  marginBottom: theme.spacing(1),
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

const ExpandedImage = styled(motion.img)({
  minWidth: '60vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'cover',
  borderRadius: '8px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.25)',
});

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}));

// Sample placeholder images
const placeholderImages = Array.from({ length: 8 }, (_, i) => `https://picsum.photos/480/360?random=${i + 1}`);

interface PhotoGalleryProps {
  title?: string;
  images?: string[];
  isLoading?: boolean;
  rows?: number;
  columns?: number;
  onSeeAllClick?: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  title = "Photo Gallery", 
  images = placeholderImages,
  isLoading = false,
  rows = 2,
  columns = 4,
  onSeeAllClick
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleSeeAllClick = () => {
    if (onSeeAllClick) {
      onSeeAllClick();
    }
  };

  // Calculate the maximum number of images to display
  const maxImagesToShow = rows * columns;
  const hasMoreImages = images.length > maxImagesToShow;
  const displayedImages = images.slice(0, maxImagesToShow);

  // Create array of rows
  const imageRows = [];
  for (let i = 0; i < rows; i++) {
    const startIndex = i * columns;
    const endIndex = startIndex + columns;
    const rowImages = displayedImages.slice(startIndex, endIndex);
    if (rowImages.length > 0) {
      imageRows.push(rowImages);
    }
  }

  return (
    <GalleryContainer>
      <ImageGrid>
        {isLoading ? (
          Array(Math.min(rows, 2)).fill(0).map((_, rowIndex) => (
            <ImageRow key={`row-${rowIndex}`}>
              {Array(Math.min(columns, 4)).fill(0).map((_, colIndex) => (
                <Box key={`skeleton-${rowIndex}-${colIndex}`} sx={{ width: 150, height: 150, mr: 1 }}>
                  <Skeleton variant="rectangular" width={150} height={150} />
                </Box>
              ))}
            </ImageRow>
          ))
        ) : (
          imageRows.map((rowImages, rowIndex) => (
            <ImageRow key={`row-${rowIndex}`}>
              {rowImages.map((image, colIndex) => (
                <PhotoItem 
                  key={`image-${rowIndex}-${colIndex}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleImageClick(image)}
                >
                  <Box sx={{ width: 150, height: 150 }}>
                    <Image src={image} alt={`Gallery image ${rowIndex * columns + colIndex + 1}`} />
                  </Box>
                </PhotoItem>
              ))}
            </ImageRow>
          ))
        )}
      </ImageGrid>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth={false}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'hidden'
          }
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)'
          }
        }}
      >
        <AnimatePresence>
          {dialogOpen && selectedImage && (
            <Box sx={{ position: 'relative' }}>
              <ExpandedImage 
                src={selectedImage} 
                alt="Expanded view"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <CloseButton onClick={handleDialogClose}>
                <CloseIcon />
              </CloseButton>
            </Box>
          )}
        </AnimatePresence>
      </Dialog>
    </GalleryContainer>
  );
};

export default PhotoGallery;
