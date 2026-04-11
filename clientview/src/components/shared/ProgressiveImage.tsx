import { Box, Skeleton } from '@mui/material';
import { useState } from 'react';

export interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
}

function ProgressiveImage({ src, alt, placeholderSrc }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: 'rgba(0, 0, 0, 0.04)' }}>
      {placeholderSrc && (
        <Box
          component="img"
          src={placeholderSrc}
          alt=""
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 0 : 1,
            filter: 'blur(14px)',
            transform: 'scale(1.06)',
            transition: 'opacity 220ms ease',
          }}
        />
      )}

      <Skeleton
        variant="rectangular"
        animation="wave"
        sx={{
          position: 'absolute',
          inset: 0, height: '100%',
          opacity: loaded ? 0 : 1,
          transition: 'opacity 220ms ease',
        }}
      />

      <Box
        component="img"
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(1.01)',
          transition: 'opacity 260ms ease, transform 260ms ease',
        }}
      />
    </Box>
  );
}

export default ProgressiveImage;