import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { PortfolioItem } from '../../data/profileViewSystemMockData';

interface ImageLightboxProps {
  images: PortfolioItem[];
  open: boolean;
  selectedIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    borderRadius: 0,
    overflow: 'hidden',
  },
  '& .MuiBackdrop-root': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const LightboxContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LightboxImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  borderRadius: theme.spacing(1),
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&:disabled': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.3)',
  },
}));

const CloseButton = styled(ControlButton)(({ theme }) => ({
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
}));

const NavigationButton = styled(ControlButton)(({ theme }) => ({
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 999,
  [theme.breakpoints.down('sm')]: {
    display: 'none', // Hide on mobile, use swipe instead
  },
}));

const ImageInfo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  left: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  color: 'white',
  zIndex: 998,
}));

const ImageCounter = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 2),
  color: 'white',
  fontSize: '0.875rem',
  zIndex: 998,
}));

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  open,
  selectedIndex,
  onClose,
  onIndexChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [imageLoading, setImageLoading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const currentImage = images[selectedIndex];
  const hasPrevious = selectedIndex > 0;
  const hasNext = selectedIndex < images.length - 1;

  // Focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (hasPrevious) {
            onIndexChange(selectedIndex - 1);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (hasNext) {
            onIndexChange(selectedIndex + 1);
          }
          break;
        case 'Home':
          event.preventDefault();
          onIndexChange(0);
          break;
        case 'End':
          event.preventDefault();
          onIndexChange(images.length - 1);
          break;
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, selectedIndex, hasPrevious, hasNext, onClose, onIndexChange, images.length]);

  // Touch/swipe handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && hasNext) {
      onIndexChange(selectedIndex + 1);
    }
    if (isRightSwipe && hasPrevious) {
      onIndexChange(selectedIndex - 1);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
  };

  const handlePrevious = () => {
    if (hasPrevious) {
      onIndexChange(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onIndexChange(selectedIndex + 1);
    }
  };

  if (!currentImage) return null;

  return (
    <StyledDialog
      open={open as any}
      onClose={onClose}
      maxWidth={false as any}
      fullScreen
      aria-modal="true"
      aria-labelledby="lightbox-title"
      aria-describedby="lightbox-description"
    >
      <DialogContent sx={{ p: 0 }}>
        <LightboxContainer
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close Button */}
          <CloseButton
            onClick={onClose}
            aria-label="Close image viewer"
            size="large"
          >
            <CloseIcon />
          </CloseButton>

          {/* Image Counter */}
          <ImageCounter>
            {selectedIndex + 1} / {images.length}
          </ImageCounter>

          {/* Previous Button */}
          <NavigationButton
            sx={{ left: theme.spacing(2) }}
            onClick={handlePrevious}
            disabled={!hasPrevious as any}
            aria-label="Previous image"
            size="large"
          >
            <ArrowBackIosIcon />
          </NavigationButton>

          {/* Next Button */}
          <NavigationButton
            sx={{ right: theme.spacing(2) }}
            onClick={handleNext}
            disabled={!hasNext as any}
            aria-label="Next image"
            size="large"
          >
            <ArrowForwardIosIcon />
          </NavigationButton>

          {/* Image Container */}
          <ImageContainer>
            {imageLoading && (
              <CircularProgress
                sx={{
                  position: 'absolute',
                  color: 'white',
                }}
              />
            )}
            
            <Fade in={!imageLoading} timeout={300}>
              <LightboxImage
                ref={imageRef}
                src={currentImage.url}
                alt={currentImage.title}
                onLoad={handleImageLoad}
                onLoadStart={handleImageLoadStart}
                loading="eager"
                sizes="90vw"
              />
            </Fade>
          </ImageContainer>

          {/* Image Info */}
          <ImageInfo>
            <Typography
              id="lightbox-title"
              variant="h6"
              component="h2"
              gutterBottom
              sx={{ color: 'white' }}
            >
              {currentImage.title}
            </Typography>
            <Typography
              id="lightbox-description"
              variant="body2"
              sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
            >
              {currentImage.description}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Category: {currentImage.category}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Date: {currentImage.date.toLocaleDateString()}
              </Typography>
            </Stack>
            
            {isMobile && (
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  mt: 1,
                  display: 'block',
                  textAlign: 'center'
                }}
              >
                Swipe left or right to navigate
              </Typography>
            )}
          </ImageInfo>
        </LightboxContainer>
      </DialogContent>
    </StyledDialog>
  );
};