import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  IconButton,
  Typography,
  Fab
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSwipeable } from 'react-swipeable';
import SwipeUpIcon from '@mui/icons-material/SwipeUp';
import MessageIcon from '@mui/icons-material/Message';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';
import { ActionButtons } from './ActionButtons';

interface MobileProfileViewProps {
  professional: Professional;
  viewerPermissions: ViewerPermissions;
  onContact: (method: string) => void;
  onBook: () => void;
  onSave: () => void;
  onShare: () => void;
  onReport: () => void;
  isSaved: boolean;
  children: React.ReactNode;
}

const MobileContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  paddingBottom: theme.spacing(10), // Space for action bar
  [theme.breakpoints.up('md')]: {
    display: 'none', // Hide on desktop
  },
}));

const StickyActionBar = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(1.5, 2),
  borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
  boxShadow: theme.shadows[8],
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const QuickActionFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(12),
  right: theme.spacing(2),
  zIndex: theme.zIndex.fab,
}));

const SwipeIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -theme.spacing(4),
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: theme.zIndex.tooltip,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
  boxShadow: theme.shadows[2],
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

const ActionDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
    maxHeight: '50vh',
    padding: theme.spacing(2),
  },
}));

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  professional,
  viewerPermissions,
  onContact,
  onBook,
  onSave,
  onShare,
  onReport,
  isSaved,
  children
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [actionDrawerOpen, setActionDrawerOpen] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [lastScrollY, setLastScrollY] = useState<number>(0);
  const [actionBarVisible, setActionBarVisible] = useState(true);

  // Handle scroll to show/hide action bar
  useEffect(() => {
    if (!isMobile) return; // Avoid listeners on desktop

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrollThreshold = 50;

      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        setActionBarVisible(!scrollingDown || currentScrollY < 100);
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, lastScrollY]);

  // Hide swipe hint after first interaction
  useEffect(() => {
    if (!isMobile) return; // Only relevant for mobile view

    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isMobile]);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      setActionDrawerOpen(true);
      setShowSwipeHint(false);
    },
    onSwipedDown: () => {
      setActionDrawerOpen(false);
    },
    trackMouse: true,
    trackTouch: true,
  });

  const handleQuickMessage = () => {
    onContact('message');
  };

  const handleQuickBook = () => {
    onBook();
  };

  const handleDrawerOpen = () => {
    setActionDrawerOpen(true);
    setShowSwipeHint(false);
  };

  const handleDrawerClose = () => {
    setActionDrawerOpen(false);
  };

  // Hide component on desktop AFTER hooks to satisfy rules-of-hooks
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <MobileContainer>
      {/* Main Content */}
      <Box {...swipeHandlers}>
        {children}
      </Box>

      {/* Quick Action FAB */}
      {viewerPermissions.canSendMessage && (
        <QuickActionFab
          color="primary"
          onClick={handleQuickMessage}
          aria-label={`Send message to ${professional.name}`}
          sx={{
            transform: actionBarVisible ? 'translateY(0)' : 'translateY(100px)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <MessageIcon />
        </QuickActionFab>
      )}

      {/* Sticky Action Bar */}
      <StickyActionBar
        sx={{
          transform: actionBarVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Swipe Indicator */}
        {showSwipeHint && (
          <SwipeIndicator>
            <SwipeUpIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              Swipe up for more actions
            </Typography>
          </SwipeIndicator>
        )}

        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={handleQuickMessage}
            disabled={!viewerPermissions.canSendMessage as any}
            aria-label={`Send message to ${professional.name}`}
            sx={{ 
              flex: 1,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <MessageIcon />
              <Typography variant="caption">Message</Typography>
            </Stack>
          </IconButton>

          <IconButton
            onClick={handleQuickBook}
            aria-label={`Book ${professional.name}`}
            sx={{ 
              flex: 1,
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
              '&:hover': {
                backgroundColor: 'secondary.dark',
              },
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <CalendarTodayIcon />
              <Typography variant="caption">Book</Typography>
            </Stack>
          </IconButton>

          <IconButton
            onClick={handleDrawerOpen}
            aria-label="More actions"
            sx={{ 
              flex: 1,
              backgroundColor: 'background.default',
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Stack alignItems="center" spacing={0.5}>
              <SwipeUpIcon />
              <Typography variant="caption">More</Typography>
            </Stack>
          </IconButton>
        </Stack>
      </StickyActionBar>

      {/* Actions Drawer */}
      <ActionDrawer
        anchor="bottom"
        open={actionDrawerOpen}
        onClose={handleDrawerClose}
        onOpen={handleDrawerOpen}
        disableSwipeToOpen={false}
        ModalProps={{ keepMounted: true }}
      >
        <ActionButtons
          professional={professional}
          viewerPermissions={viewerPermissions}
          onContact={onContact}
          onBook={onBook}
          onSave={onSave}
          onShare={onShare}
          onReport={onReport}
          isSaved={isSaved}
          onClose={handleDrawerClose}
        />
      </ActionDrawer>
    </MobileContainer>
  );
};