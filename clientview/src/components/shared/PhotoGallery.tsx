import React, { useState, useEffect } from 'react';
import { Box, Grid, Skeleton, Dialog, IconButton, Backdrop, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

// Styled components
const GalleryContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const PhotoItem = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  height: '100%',
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

const ExpandedImage = styled(motion.img)(() => ({
  minWidth: '60vw',
  maxWidth: '90vw',
  maxHeight: '90vh',
  objectFit: 'cover',
  borderRadius: '8px',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.25)',
}));

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

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 1,
}));

// Helper function to generate a thumbnail link from imgur link
const getImgurThumbnail = (imgurLink: string, size: 's'|'t'|'m'|'l'|'h') => {
  const lastDotIndex = imgurLink.lastIndexOf('.');
  if (lastDotIndex === -1) return imgurLink;
  const base = imgurLink.substring(0, lastDotIndex);
  const extension = imgurLink.substring(lastDotIndex);
  return `${base}${size}${extension}`;
};

// Sample placeholder images
const placeholderImages = Array.from({ length: 20 }, (_, i) => `https://picsum.photos/480/360?random=${i + 1}`);

// Define the image item interface
interface ImageItem {
  link: string;
  thumbnail?: string;
}

// Normalized image type after processing
interface NormalizedImage {
  link: string;
  thumbnail: string;
}

interface PhotoGalleryProps {
  title?: string;
  images?: (string | ImageItem)[];
  isLoading?: boolean;
  rows?: number;
  columns?: number;
  onSeeAllClick?: () => void;
  imageHeight?: number;
  imageMargin?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  images = placeholderImages,
  isLoading = false,
  rows = 2,
  columns = 3,
  onSeeAllClick,
  imageHeight = 150,
  imageMargin = 1
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragDirection, setDragDirection] = useState<number>(0);

  // Normalize the images to have consistent format
  const normalizeImages = (imgs: (string | ImageItem)[]): NormalizedImage[] => {
    return imgs.map(img => {
      if (typeof img === 'string') {
        return { 
          link: img,
          thumbnail: img.includes('imgur.com') ? getImgurThumbnail(img, 'm') : img
        };
      }
      return {
        link: img.link,
        thumbnail: img.thumbnail || img.link
      };
    });
  };

  // Simple grid size calculation based on 12-column grid
  const gridSize = {
    xs: 12 / columns
  };

  // Calculate the maximum number of images to display
  const calcMaxImagesCount = rows * columns;
  const normalizedImages = normalizeImages(images);
  const hasMoreImages = normalizedImages.length > calcMaxImagesCount;
  const displayedImages = normalizedImages.slice(0, calcMaxImagesCount);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setTimeout(() => setSelectedImageIndex(null), 300); // Reset after animation completes
  };

  const goToNextImage = () => {
    if (selectedImageIndex === null || !displayedImages.length) return;
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % displayedImages.length);
  };

  const goToPreviousImage = () => {
    if (selectedImageIndex === null || !displayedImages.length) return;
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + displayedImages.length) % displayedImages.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogOpen) return;
      
      if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousImage();
      } else if (e.key === 'Escape') {
        handleDialogClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen, selectedImageIndex]);

  // Handle swipe gestures
  const handleDragEnd = (_: never, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Determine if it's a swipe based on velocity or distance
    const isLeftSwipe = offset.x < -100 || (velocity.x < -0.5 && offset.x < 0);
    const isRightSwipe = offset.x > 100 || (velocity.x > 0.5 && offset.x > 0);
    
    if (isLeftSwipe) {
      setDragDirection(1); // Animate exit to left
      setTimeout(goToNextImage, 100);
    } else if (isRightSwipe) {
      setDragDirection(-1); // Animate exit to right
      setTimeout(goToPreviousImage, 100);
    } else {
      setDragDirection(0);
    }
  };

  return (
    <GalleryContainer>
      <Grid container spacing={imageMargin}>
        {isLoading ? (
          // Skeleton loaders
          [...Array(calcMaxImagesCount)].map((_, index) => (
            <Grid item xs={gridSize.xs} key={`skeleton-${index}`}>
              <Box sx={{ height: imageHeight }}>
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </Box>
            </Grid>
          ))
        ) : (
          // Image grid
          displayedImages.map((image, index) => (
            <Grid item xs={gridSize.xs} key={`image-${index}`}>
              <PhotoItem
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleImageClick(index)}
              >
                <Box sx={{ height: imageHeight }}>
                  <Image src={image.thumbnail} alt={`Gallery image ${index + 1}`} />
                </Box>
              </PhotoItem>
            </Grid>
          ))
        )}
      </Grid>

      {/* Image dialog for expanded view */}
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
        <AnimatePresence mode="wait">
          {dialogOpen && selectedImageIndex !== null && (
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}
            >
              <motion.div
                key={selectedImageIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}
                initial={{ opacity: 0, x: dragDirection * 200 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dragDirection * -200 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <ExpandedImage 
                  src={displayedImages[selectedImageIndex].link} 
                  alt={`Expanded view ${selectedImageIndex + 1}`}
                />
              </motion.div>
              
              <CloseButton onClick={handleDialogClose}>
                <CloseIcon />
              </CloseButton>
              
              {/* Navigation buttons */}
              <NavigationButton 
                onClick={goToPreviousImage}
                sx={{ position: 'fixed' ,left: 16 }}
              >
                <ArrowLeftIcon />
              </NavigationButton>
              
              <NavigationButton 
                onClick={goToNextImage}
                sx={{ position: 'fixed', right: 16 }}
              >
                <ArrowRightIcon />
              </NavigationButton>
            </Box>
          )}
        </AnimatePresence>
      </Dialog>
    </GalleryContainer>
  );
};

export default PhotoGallery;
