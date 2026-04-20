import { Box, Paper, Skeleton, SxProps, Theme } from '@mui/material';
import type { CSSProperties, ComponentPropsWithoutRef } from 'react';
import { useEffect, useState } from 'react';

type NativeImgProps = Omit<
  ComponentPropsWithoutRef<'img'>,
  'src' | 'alt' | 'style' | 'onLoad' | 'onError'
>;

export interface ProgressiveImageProps extends NativeImgProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  objectFit?: CSSProperties['objectFit'];
  loading?: 'eager' | 'lazy';
  imageStyle?: CSSProperties;
  style?: CSSProperties;
  sx?: SxProps<Theme>;
  onLoad?: ComponentPropsWithoutRef<'img'>['onLoad'];
  onError?: ComponentPropsWithoutRef<'img'>['onError'];
}

function ProgressiveImage({
  src,
  alt,
  placeholderSrc: placeholderSrcProp,
  objectFit = 'cover',
  loading = 'lazy',
  imageStyle,
  style,
  sx,
  width,
  height,
  onLoad,
  onError,
  ...imgProps
}: ProgressiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const placeholderSrc = placeholderSrcProp || src;
  const hasNativeSizing =
    width !== undefined ||
    height !== undefined ||
    style?.width === 'auto' ||
    style?.height === 'auto' ||
    imageStyle?.width === 'auto' ||
    imageStyle?.height === 'auto';
  const useNativeLayout = hasNativeSizing;
  
  // useEffect(() => {
  //   setLoaded(false);
  // }, [src, placeholderSrc]);

  // Create a short hash for the key to improve performance and avoid long strings
  const key = () => {
    const str = `${src}-${placeholderSrc}-${objectFit}-${alt}`;
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
    <Paper
      key={key()+'-paper'}
      sx={{
        position: 'relative',
        display: useNativeLayout ? 'inline-block' : 'block',
        width: useNativeLayout ? 'fit-content' : '100%',
        height: useNativeLayout ? 'fit-content' : '100%',
        overflow: 'hidden',
        bgcolor: 'rgba(0, 0, 0, 0.04)',
        ...sx,
      }}
    >
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
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setLoaded(true);
          onError?.(event);
        }}
        sx={{
          position: useNativeLayout ? 'relative' : 'absolute',
          inset: useNativeLayout ? 'auto' : 0,
          display: 'block',
          ...(useNativeLayout
            ? {
                ...(width === undefined ? { width: 'auto' } : {}),
                ...(height === undefined ? { height: 'auto' } : {}),
              }
            : {
                width: '100%',
                height: '100%',
              }),
          objectFit,
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'scale(1)' : 'scale(1.01)',
          transition: 'opacity 260ms ease, transform 260ms ease',
        }}
        style={{ ...imageStyle, ...style }}
        {...imgProps}
      />
    </Paper>
  );
}

export default ProgressiveImage;