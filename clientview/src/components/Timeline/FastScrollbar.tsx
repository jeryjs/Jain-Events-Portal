import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

interface MarkerType {
  year: string;
  month: string;
}

interface FastScrollbarProps {
  markers: MarkerType[];
  activeMarker: MarkerType | null;
  onMarkerSelect: (marker: MarkerType) => void;
  showMarkerLabels?: boolean;
}

// Styled components with cleaner formatting
const ScrollbarContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0, right: 0,
  height: '100%', width: '30px',
  [theme.breakpoints.up('md')]: {
    width: '60px',
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  padding: `${theme.spacing(1)} 0`,
  zIndex: 3,
  cursor: 'pointer',
}));

const ScrollTrack = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '3px', height: '100%',
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
  borderRadius: '6px',
}));

const ScrollThumb = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  width: '5px', height: '60px', left: '-1px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '6px',
  cursor: 'grab',
  '&:active': { cursor: 'grabbing' },
  '&:hover': { backgroundColor: theme.palette.primary.dark },
}));

// Unified base styles for marker labels
const baseMarkerLabelStyles = {
  position: 'absolute',
  right: '15px',
  transform: 'translateY(-50%)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
} as const;

const MarkerLabel = styled(motion.div)(({ theme }) => ({
  ...baseMarkerLabelStyles,
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.action.hover,
  borderRadius: '4px',
  boxShadow: theme.shadows[1],
  zIndex: 3,
}));

const ActiveMarkerLabel = styled(motion.div)(({ theme }) => ({
  ...baseMarkerLabelStyles,
  right: '15px',
  padding: theme.spacing(0.75, 1.5),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: '6px',
  boxShadow: theme.shadows[4],
  zIndex: 4,
  fontWeight: 'bold',
  // [theme.breakpoints.up('md')]: {
  //   right: 'auto',
  //   left: '15px',
  // }
}));

const FastScrollbar: React.FC<FastScrollbarProps> = ({ 
  markers, 
  activeMarker, 
  onMarkerSelect, 
  showMarkerLabels = true 
}) => {
  // State management
  const [state, setState] = useState({
    dragging: false,
    thumbPosition: 0,
    showActiveMarker: true
  });
  const [hoverMarker, setHoverMarker] = useState<MarkerType | null>(null);
  
  // Refs
  const refs = {
    track: useRef<HTMLDivElement>(null),
    thumb: useRef<HTMLDivElement>(null),
    container: useRef<HTMLDivElement>(null),
    hideTimeout: useRef<NodeJS.Timeout | null>(null),
    lastDragPos: useRef<number | null>(null),
    dragStabilityTimeout: useRef<NodeJS.Timeout | null>(null)
  };

  // Calculate thumb position based on marker index
  const calculateThumbPosition = useCallback((activeMarkerIndex: number) => {
    if (!refs.track.current || markers.length <= 1) return 0;
    
    const trackHeight = refs.track.current.clientHeight;
    const thumbHeight = refs.thumb.current?.clientHeight || 60;
    const maxThumbPosition = trackHeight - thumbHeight;
    
    return Math.max(0, Math.min((activeMarkerIndex / (markers.length - 1)) * maxThumbPosition, maxThumbPosition));
  }, [markers.length]);

  // Auto-hide active marker after scrolling
  useEffect(() => {
    if (activeMarker || hoverMarker) {
      setState(prev => ({ ...prev, showActiveMarker: true }));
      
      if (refs.hideTimeout.current) clearTimeout(refs.hideTimeout.current);
      
      refs.hideTimeout.current = setTimeout(() => {
        if (!state.dragging) setState(prev => ({ ...prev, showActiveMarker: false }));
      }, 1000);
    }

    return () => {
      if (refs.hideTimeout.current) clearTimeout(refs.hideTimeout.current);
    };
  }, [activeMarker, hoverMarker, state.dragging]);

  // Update thumb position when active marker changes
  useEffect(() => {
    if (activeMarker) {
      const markerIndex = markers.findIndex(
        m => m.year === activeMarker.year && m.month === activeMarker.month
      );
      
      if (markerIndex !== -1) {
        setState(prev => ({ 
          ...prev, 
          thumbPosition: calculateThumbPosition(markerIndex) 
        }));
      }
    }
  }, [activeMarker, markers, calculateThumbPosition]);

  // Core interaction handler for both click and drag
  const handleContainerInteraction = useCallback((clientY: number) => {
    if (!refs.track.current || markers.length === 0) return;

    const trackRect = refs.track.current.getBoundingClientRect();
    const thumbHeight = refs.thumb.current?.clientHeight || 60;
    const clickY = clientY - trackRect.top;
    const maxPosition = trackRect.height - thumbHeight;
    
    // Calculate relative position on track
    const newPosition = Math.max(0, Math.min(clickY - thumbHeight / 2, maxPosition));
    
    // Only update position if significant change or not in rapid drag
    const shouldUpdatePosition = 
      !refs.lastDragPos.current || 
      Math.abs(newPosition - (refs.lastDragPos.current || 0)) > 5 ||
      !state.dragging;
      
    if (shouldUpdatePosition) {
      setState(prev => ({ ...prev, thumbPosition: newPosition }));
      refs.lastDragPos.current = newPosition;
    }

    // Calculate marker based on position
    const markerIndex = Math.min(
      Math.floor((newPosition / maxPosition) * (markers.length - 1) + 0.1),
      markers.length - 1
    );

    return markers[markerIndex];
  }, [markers, state.dragging]);

  // Event handlers - kept separate for clarity
  const eventHandlers = {
    click: (e: React.MouseEvent<HTMLDivElement>) => {
      const selectedMarker = handleContainerInteraction(e.clientY);
      if (selectedMarker) onMarkerSelect(selectedMarker);
    },
    
    dragStart: () => {
      setState(prev => ({ ...prev, dragging: true, showActiveMarker: true }));
      if (refs.dragStabilityTimeout.current) clearTimeout(refs.dragStabilityTimeout.current);
    },
    
    drag: (_: any, info: any) => {
      if (!refs.track.current || markers.length === 0) return;
      
      requestAnimationFrame(() => {
        const selectedMarker = handleContainerInteraction(info.point.y);
        if (selectedMarker) setHoverMarker(selectedMarker);
      });
    },
    
    dragEnd: () => {
      refs.dragStabilityTimeout.current = setTimeout(() => {
        setState(prev => ({ ...prev, dragging: false }));
        refs.lastDragPos.current = null;
        
        if (hoverMarker) {
          onMarkerSelect(hoverMarker);
          setHoverMarker(null);
        }
      }, 50);
    },
    
    mouseMove: useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!state.dragging) {
        const selectedMarker = handleContainerInteraction(e.clientY);
        if (selectedMarker) {
          setHoverMarker(selectedMarker);
          setState(prev => ({ ...prev, showActiveMarker: true }));
        }
      }
    }, [state.dragging, handleContainerInteraction]),
    
    mouseLeave: useCallback(() => {
      if (!state.dragging && activeMarker) {
        const markerIndex = markers.findIndex(
          m => m.year === activeMarker.year && m.month === activeMarker.month
        );
        
        if (markerIndex !== -1) {
          setState(prev => ({ 
            ...prev, 
            thumbPosition: calculateThumbPosition(markerIndex) 
          }));
        }
      }
      setHoverMarker(null);
    }, [state.dragging, activeMarker, markers, calculateThumbPosition])
  };

  // Render year labels
  const renderMarkerLabels = () => {
    if (!refs.track.current || markers.length === 0) return null;
    
    const trackHeight = refs.track.current.clientHeight;
    const visibleMarkers = [];
    let lastYear: string | null = null;

    markers.forEach((marker, index) => {
      if (marker.year !== lastYear) {
        lastYear = marker.year;
        visibleMarkers.push({ 
          ...marker, 
          position: (index / (markers.length - 1)) * trackHeight 
        });
      }
    });

    return visibleMarkers.map(marker => (
      <MarkerLabel
        key={`${marker.year}-${marker.month}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ top: marker.position }}
      >
        <Typography variant="caption" color='text.primary' fontWeight="100">
          {marker.year}
        </Typography>
      </MarkerLabel>
    ));
  };

  // Determine which marker to show
  const displayMarker = hoverMarker || activeMarker;
  const { thumbPosition, showActiveMarker, dragging } = state;

  return (
    <ScrollbarContainer
      ref={refs.container}
      onClick={eventHandlers.click}
      onMouseMove={eventHandlers.mouseMove}
      onMouseLeave={eventHandlers.mouseLeave}
    >
      <ScrollTrack ref={refs.track}>
        <ScrollThumb
          ref={refs.thumb}
          drag="y"
          dragConstraints={refs.track}
          dragElastic={0.1}
          dragMomentum={false}
          dragTransition={{ 
            power: 0.3, 
            timeConstant: 200,
            modifyTarget: target => Math.round(target / 5) * 5 
          }}
          onDragStart={eventHandlers.dragStart}
          onDrag={eventHandlers.drag}
          onDragEnd={eventHandlers.dragEnd}
          animate={{ y: thumbPosition }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            restDelta: 0.5
          }}
          whileTap={{ scale: 1.1 }}
          whileHover={{ scale: 1.1 }}
        />

        {showMarkerLabels && renderMarkerLabels()}

        <AnimatePresence>
          {showActiveMarker && displayMarker && (
            <ActiveMarkerLabel
              key="active-marker"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ top: thumbPosition + 30 }}
            >
              <Typography variant="body2">
                {hoverMarker 
                  ? `${hoverMarker.month} ${hoverMarker.year}`
                  : activeMarker ? `${activeMarker.month} ${activeMarker.year}` : ''}
              </Typography>
            </ActiveMarkerLabel>
          )}
        </AnimatePresence>
      </ScrollTrack>
    </ScrollbarContainer>
  );
};

export default FastScrollbar;
