import { Box, Paper, Skeleton, SxProps, Theme } from '@mui/material';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

export interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  objectFit?: CSSProperties['objectFit'];
  loading?: 'eager' | 'lazy';
  imageStyle?: CSSProperties;
  sx?: SxProps<Theme>;
}

function ProgressiveImage({ src, alt, placeholderSrc, objectFit = 'cover', loading = 'lazy', imageStyle, sx }: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  placeholderSrc = placeholderSrc || src;
  
  useEffect(() => {
    setLoaded(false);
  }, [src, placeholderSrc]);

  // Create a short hash for the key to improve performance and avoid long strings
  const key = () => {
    const str = `${src}-${placeholderSrc}-${objectFit}-${JSON.stringify(imageStyle)}`;
    let hash = 0, i, chr;
    if (str.length === 0) return '0';
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }


  return (
    <Paper key={key()+'-paper'} sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', bgcolor: 'rgba(0, 0, 0, 0.04)', ...sx }}>
      {placeholderSrc && (
        <Box
          key={key()+'-placeholder'}
          component="img"
          src={placeholderSrc}
          alt=""
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            opacity: loaded ? 0 : 1,
            filter: 'blur(14px)',
            transform: 'scale(1.06)',
            transition: 'opacity 220ms ease',
            // create illusion of side-to-side loading instead of browser default top-to-bottom loading
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            rotate: src === placeholderSrc ? '-90deg' : '0deg',
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
        key={key()+'-image'}
        component="img"
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit,
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(1.01)',
          transition: 'opacity 260ms ease, transform 260ms ease',
        }}
        style={imageStyle}
      />
    </Paper>
  );
}

export default ProgressiveImage;