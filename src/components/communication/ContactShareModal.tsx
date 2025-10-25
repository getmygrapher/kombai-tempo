import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Stack,
  Avatar,
  Alert,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import SecurityIcon from '@mui/icons-material/Security';

interface ContactShareModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  professionalName: string;
  professionalAvatar?: string;
  isShared?: boolean;
}

const IconContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main + '0a',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2)
}));

export const ContactShareModal: React.FC<ContactShareModalProps> = ({
  open,
  onClose,
  onConfirm,
  professionalName,
  professionalAvatar = 'https://i.pravatar.cc/150?img=5',
  isShared = false
}) => {
  return (
    <Dialog 
      open={open as any}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        {isShared ? 'Contact Already Shared' : 'Share Contact Information'}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} alignItems="center">
          <IconContainer>
            <ContactMailOutlinedIcon 
              sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} 
            />
            <Avatar 
              src={professionalAvatar} 
              sx={{ width: 64, height: 64 }}
            />
          </IconContainer>

          {isShared ? (
            <Stack spacing={2} sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                Contact Shared with {professionalName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your contact information is already shared with this professional. 
                You can call them directly or continue messaging here.
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                Share contact with {professionalName}?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will share your phone number and email address with the professional. 
                They will also share their contact information with you.
              </Typography>
              
              <Alert 
                severity="info" 
                icon={<SecurityIcon />}
                sx={{ textAlign: 'left' }}
              >
                <Typography variant="body2">
                  <strong>Privacy Notice:</strong> Both parties must consent to share contact information. 
                  You can revoke access anytime from your privacy settings.
                </Typography>
              </Alert>
            </Stack>
          )}

          <Divider sx={{ width: '100%' }} />

          <Stack spacing={1} sx={{ width: '100%', textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              What will be shared:
            </Typography>
            <Typography variant="body2">
              • Your name and phone number
            </Typography>
            <Typography variant="body2">
              • Your email address
            </Typography>
            <Typography variant="body2">
              • Their contact information (mutual sharing)
            </Typography>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          {isShared ? 'Close' : 'Cancel'}
        </Button>
        {!isShared && (
          <Button 
            onClick={onConfirm} 
            variant="contained" 
            fullWidth
            startIcon={<ContactMailOutlinedIcon />}
          >
            Share Contact
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};