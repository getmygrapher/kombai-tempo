import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Typography,
  TextField,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Professional } from '../../data/profileViewSystemMockData';
import { analyticsService } from '../../utils/analyticsEvents';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  professional: Professional;
}

const ShareButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  padding: theme.spacing(1.5, 2),
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.shape.borderRadius * 2,
    maxWidth: 500,
    width: '100%',
    margin: theme.spacing(2),
  },
}));

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  onClose,
  professional
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [copySuccess, setCopySuccess] = React.useState(false);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const profileUrl = `${window.location.origin}/profile/${professional.id}`;
  const shareText = `Check out ${professional.name}, a talented ${professional.professionalType} from ${professional.location.city}!`;

  // Focus management
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus first button after dialog opens
      setTimeout(() => {
        firstButtonRef.current?.focus();
      }, 100);
    } else if (previousFocusRef.current) {
      // Return focus to trigger element
      previousFocusRef.current.focus();
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopySuccess(true);
      analyticsService.trackShareClicked(professional.id, 'copy_link', 'share_modal');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSocialShare = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${profileUrl}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      analyticsService.trackShareClicked(professional.id, platform, 'share_modal');
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <StyledDialog
        open={open}
        onClose={handleClose}
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-description"
        fullScreen={isMobile}
      >
        <DialogTitle 
          id="share-dialog-title"
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            pb: 1
          }}
        >
          <Typography variant="h6" component="h2">
            Share Profile
          </Typography>
          <IconButton
            onClick={handleClose}
            aria-label="Close share dialog"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent id="share-dialog-description">
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Share {professional.name}'s profile with others
            </Typography>

            {/* Copy Link */}
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                Copy Link
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  value={profileUrl}
                  variant="outlined"
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  aria-label="Profile URL"
                />
                <Button
                  ref={firstButtonRef}
                  variant="outlined"
                  onClick={handleCopyLink}
                  startIcon={<ContentCopyIcon />}
                  aria-label="Copy profile link to clipboard"
                >
                  Copy
                </Button>
              </Stack>
            </Stack>

            {/* Social Media */}
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                Share on Social Media
              </Typography>
              <Stack spacing={1}>
                <ShareButton
                  startIcon={<FacebookIcon sx={{ color: '#1877F2' }} />}
                  onClick={() => handleSocialShare('facebook')}
                  aria-label="Share on Facebook"
                >
                  Facebook
                </ShareButton>
                
                <ShareButton
                  startIcon={<TwitterIcon sx={{ color: '#1DA1F2' }} />}
                  onClick={() => handleSocialShare('twitter')}
                  aria-label="Share on Twitter"
                >
                  Twitter
                </ShareButton>
                
                <ShareButton
                  startIcon={<LinkedInIcon sx={{ color: '#0A66C2' }} />}
                  onClick={() => handleSocialShare('linkedin')}
                  aria-label="Share on LinkedIn"
                >
                  LinkedIn
                </ShareButton>
                
                <ShareButton
                  startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                  onClick={() => handleSocialShare('whatsapp')}
                  aria-label="Share on WhatsApp"
                >
                  WhatsApp
                </ShareButton>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined" fullWidth>
            Close
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopySuccess(false)} 
          severity="success"
          variant="filled"
        >
          Profile link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};