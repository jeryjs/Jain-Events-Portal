import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";


export interface HighlightsCarouselProps {
    images: string[];
    autoPlayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
    height?: { xs?: number; sm?: number; md?: number };
    slideRadius?: number;
}

export default function HighlightsCarousel({
    images,
    autoPlayInterval = 5000,
    showControls = true,
    showIndicators = true,
    height = { xs: 200, sm: 250, md: 300 },
    slideRadius = 16
}: HighlightsCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [dragging, setDragging] = useState(false);
    const carouselRef = useRef<HTMLDivElement>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer when manually navigating
    const resetTimer = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            startAutoPlay();
        }
    };

    // Start auto rotation
    const startAutoPlay = () => {
        autoPlayRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, autoPlayInterval);
    };

    // Initialize autoplay and handle cleanup
    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [images, autoPlayInterval]);

    // Navigate to specific slide
    const goToSlide = (index: number) => {
        setCurrent(index);
        resetTimer();
    };

    // Navigate to next/previous slides
    const navigate = (direction: 'prev' | 'next') => {
        setCurrent(prev => {
            if (direction === 'prev') {
                return (prev - 1 + images.length) % images.length;
            } else {
                return (prev + 1) % images.length;
            }
        });
        resetTimer();
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') navigate('prev');
            if (e.key === 'ArrowRight') navigate('next');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Get all indices for rendering
    const prevIndex = (current - 1 + images.length) % images.length;
    const nextIndex = (current + 1) % images.length;

    return (
        <Box sx={{
            position: 'relative',
            height,
            my: 2,
            overflow: 'visible'
        }}>
            {/* Main carousel container */}
            <Box
                ref={carouselRef}
                sx={{
                    position: 'relative',
                    height: '100%',
                    overflow: 'visible',
                    borderRadius: 3,
                    '&:hover .carousel-controls': {
                        opacity: 1
                    }
                }}
            >
                {/* Carousel items container */}
                <Box sx={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    {/* Previous image - positioned behind on mobile */}
                    {showControls && (
                        <motion.div
                            key={`prev-${prevIndex}`}
                            initial={{ opacity: 0, x: '-100%', scale: 0.8 }}
                            animate={{
                                opacity: 0.4,
                                x: window.innerWidth < 600 ? '-50%' : '0%',
                                scale: 0.85,
                                zIndex: 1
                            }}
                            transition={{ duration: 0.5 }}
                            style={{
                                position: 'absolute',
                                left: 0,
                                height: '80%',
                                width: '30%',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                borderRadius: slideRadius,
                                overflow: 'hidden',
                            }}
                            onClick={() => navigate('prev')}
                            whileHover={{ opacity: 0.7, scale: 0.87 }}
                        >
                            <Box component="img"
                                src={images[prevIndex]}
                                alt={`Previous image ${prevIndex + 1}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    backgroundColor: 'rgba(0,0,0,0.03)'
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Current image - maintains aspect ratio */}
                    <motion.div
                        key={`current-${current}`}
                        initial={{ opacity: 0, scale: 0.9, zIndex: 5 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            zIndex: 10
                        }}
                        transition={{ duration: 0.5 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.3}
                        onDragStart={() => setDragging(true)}
                        onDragEnd={(_, info) => {
                            setDragging(false);
                            if (info.offset.x < -100) navigate('next');
                            if (info.offset.x > 100) navigate('prev');
                        }}
                        style={{
                            position: 'relative',
                            width: 'auto',
                            height: '100%',
                            zIndex: 2,
                            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                            borderRadius: slideRadius,
                            overflow: 'hidden',
                            margin: '0 auto', // Center the container
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.03)'
                        }}
                    >
                        <Box
                            component="img"
                            src={images[current]}
                            alt={`Current image ${current + 1}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                width: 'auto',
                                height: '100%',
                                margin: '0 auto', // Ensure the image is centered within its container
                            }}
                        />
                    </motion.div>

                    {/* Next image - positioned behind on mobile */}
                    {showControls && (
                        <motion.div
                            key={`next-${nextIndex}`}
                            initial={{ opacity: 0, x: '100%', scale: 0.8 }}
                            animate={{
                                opacity: 0.4,
                                x: window.innerWidth < 600 ? '50%' : '0%',
                                scale: 0.85,
                                zIndex: 1
                            }}
                            transition={{ duration: 0.5 }}
                            style={{
                                position: 'absolute',
                                right: 0,
                                height: '80%',
                                width: '30%',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                borderRadius: slideRadius,
                                overflow: 'hidden',
                            }}
                            onClick={() => navigate('next')}
                            whileHover={{ opacity: 0.7, scale: 0.87 }}
                        >
                            <Box component="img"
                                src={images[nextIndex]}
                                alt={`Next image ${nextIndex + 1}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    backgroundColor: 'rgba(0,0,0,0.03)'
                                }}
                            />
                        </motion.div>
                    )}
                </Box>

                {/* Navigation controls */}
                {showIndicators && images.length > 1 && (
                    <Box className="carousel-controls" sx={{
                        position: 'absolute',
                        bottom: '-16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        opacity: { xs: 1, sm: 0.3 },
                        transition: 'opacity 0.3s ease',
                        zIndex: 20
                    }}>
                        {images.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => goToSlide(index)}
                                sx={{
                                    width: current === index ? 24 : 12,
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: current === index ? 'secondary.main' : 'primary.main',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: current === index ? 'secondary.main' : 'primary.main'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}


/* 
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";


export interface HighlightsCarouselProps {
    images: string[];
    autoPlayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
    height?: { xs?: number; sm?: number; md?: number };
    slideRadius?: number;
}

export default function HighlightsCarousel({
    images,
    autoPlayInterval = 5000,
    showControls = true,
    showIndicators = true,
    height = { xs: 200, sm: 250, md: 300 },
    slideRadius = 16
}: HighlightsCarouselProps) {
    const [current, setCurrent] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');
    const carouselRef = useRef<HTMLDivElement>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Reset timer when manually navigating
    const resetTimer = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            startAutoPlay();
        }
    };

    // Start auto rotation
    const startAutoPlay = () => {
        autoPlayRef.current = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, autoPlayInterval);
    };

    // Initialize autoplay and handle cleanup
    useEffect(() => {
        startAutoPlay();
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [images, autoPlayInterval]);

    // Navigate to specific slide
    const goToSlide = (index: number) => {
        setCurrent(index);
        resetTimer();
    };

    const navigate = (direction: 'prev' | 'next') => {
        setDirection(direction);
        setCurrent(prev => {
            if (direction === 'prev') {
                return (prev - 1 + images.length) % images.length;
            } else {
                return (prev + 1) % images.length;
            }
        });
        resetTimer();
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') navigate('prev');
            if (e.key === 'ArrowRight') navigate('next');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Get all indices for rendering
    const prevIndex = (current - 1 + images.length) % images.length;
    const nextIndex = (current + 1) % images.length;

    // Define variants for the center image’s circular (yaw) transition
    const slideVariants = {
        initial: (custom: { direction: 'next' | 'prev' }) => ({
            rotateY: custom.direction === 'next' ? 90 : -90,
            opacity: 0,
            scale: 0.85
        }),
        animate: {
            rotateY: 0,
            opacity: 1,
            scale: 1
        },
        exit: (custom: { direction: 'next' | 'prev' }) => ({
            rotateY: custom.direction === 'next' ? -90 : 90,
            opacity: 0,
            scale: 0.85
        })
    };

    return (
        <Box sx={{
            position: 'relative',
            height,
            my: 2,
            overflow: 'visible'
        }}>
            <Box
                ref={carouselRef}
                sx={{
                    position: 'relative',
                    height: '100%',
                    overflow: 'visible',
                    borderRadius: 3,
                    '&:hover .carousel-controls': {
                        opacity: 1
                    }
                }}
            >
                <Box sx={{
                    position: 'relative',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    perspective: '1000px'
                }}>
                    {showControls && (
                        <motion.div
                            key={`prev-${prevIndex}`}
                            initial={{ rotateY: 0, opacity: 0.4, scale: 0.85 }}
                            animate={{ rotateY: 0, opacity: 0.4, scale: 0.85 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                left: 0,
                                height: '80%',
                                width: '30%',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                borderRadius: slideRadius,
                                overflow: 'hidden',
                                transformOrigin: 'center right'
                            }}
                            onClick={() => navigate('prev')}
                            whileHover={{ opacity: 0.7, scale: 0.87 }}
                        >
                            <Box component="img"
                                src={images[prevIndex]}
                                alt={`Previous image ${prevIndex + 1}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    backgroundColor: 'rgba(0,0,0,0.03)'
                                }}
                            />
                        </motion.div>
                    )}
                    <motion.div
                        key={`current-${current}`}
                        custom={{ direction }}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={slideVariants}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.3}
                        onDragStart={() => setDragging(true)}
                        onDragEnd={(_, info) => {
                            setDragging(false);
                            if (info.offset.x < -100) navigate('next');
                            if (info.offset.x > 100) navigate('prev');
                        }}
                        style={{
                            position: 'relative',
                            width: 'auto',
                            height: '100%',
                            zIndex: 2,
                            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                            borderRadius: slideRadius,
                            overflow: 'hidden',
                            margin: '0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.03)'
                        }}
                    >
                        <Box
                            component="img"
                            src={images[current]}
                            alt={`Current image ${current + 1}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                width: 'auto',
                                height: '100%',
                                margin: '0 auto'
                            }}
                        />
                    </motion.div>
                    {showControls && (
                        <motion.div
                            key={`next-${nextIndex}`}
                            initial={{ rotateY: 0, opacity: 0.4, scale: 0.85 }}
                            animate={{ rotateY: 0, opacity: 0.4, scale: 0.85 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                right: 0,
                                height: '80%',
                                width: '30%',
                                cursor: 'pointer',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                borderRadius: slideRadius,
                                overflow: 'hidden',
                                transformOrigin: 'center left'
                            }}
                            onClick={() => navigate('next')}
                            whileHover={{ opacity: 0.7, scale: 0.87 }}
                        >
                            <Box component="img"
                                src={images[nextIndex]}
                                alt={`Next image ${nextIndex + 1}`}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    backgroundColor: 'rgba(0,0,0,0.03)'
                                }}
                            />
                        </motion.div>
                    )}
                </Box>

                {showIndicators && images.length > 1 && (
                    <Box className="carousel-controls" sx={{
                        position: 'absolute',
                        bottom: '-16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        opacity: { xs: 1, sm: 0.3 },
                        transition: 'opacity 0.3s ease',
                        zIndex: 20
                    }}>
                        {images.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => goToSlide(index)}
                                sx={{
                                    width: current === index ? 24 : 12,
                                    height: 12,
                                    borderRadius: 6,
                                    bgcolor: current === index ? 'primary.main' : 'rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: current === index ? 'primary.main' : 'rgba(0,0,0,0.4)'
                                    }
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
*/