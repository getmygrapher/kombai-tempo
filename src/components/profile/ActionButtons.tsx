import React from 'react';
import {
  Button,
  IconButton,
  Stack,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MessageIcon from '@mui/icons-material/Message';
import PhoneIcon from '@mui/icons-material/Phone';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ShareIcon from '@mui/icons-material/Share';
import ReportIcon from '@mui/icons-material/Report';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Professional, ViewerPermissions } from '../../data/profileViewSystemMockData';

interface ActionButtonsProps {
  professional: Professional;
  viewerPermissions: ViewerPermissions;
  onContact: (method: string) => void;
  onBook: () => void;
  onSave: () => void;
  onShare: () => void;
  onReport: () => void;
  isSaved: boolean;
  variant?: 'mobile' | 'desktop';
}

const MobileButtonContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
  '& > *': {
    flex: 1,
  },
}));

const DesktopButtonContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
}));

const SecondaryActions = styled(Stack)(({ theme }) => ({
  justifyContent: 'space-around',
  marginTop: theme.spacing(2),
}));

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  professional,
  viewerPermissions,
  onContact,
  onBook,
  onSave,
  onShare,
  onReport,
  isSaved,
  variant = 'desktop'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const canMessage = viewerPermissions.canSendMessage;
  const canViewContact = viewerPermissions.canViewContact;

  if (variant === 'mobile' || isMobile) {
    return (
      <Stack spacing={2}>
        <MobileButtonContainer direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<MessageIcon />}
            onClick={() => onContact('message')}
            disabled={!canMessage as any}
            aria-label={`Send message to ${professional.name}`}
            fullWidth
          >
            Message
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CalendarTodayIcon />}
            onClick={onBook}
            aria-label={`Book ${professional.name}`}
            fullWidth
          >
            Book
          </Button>
        </MobileButtonContainer>
        
        <SecondaryActions direction="row" spacing={2} justifyContent="center">
          <Tooltip title={isSaved ? 'Remove from saved' : 'Save profile'}>
            <IconButton
              onClick={onSave}
              aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
              color={isSaved ? 'primary' : 'default'}
            >
              {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Call professional">
            <IconButton
              onClick={() => onContact('phone')}
              disabled={!canViewContact as any}
              aria-label={`Call ${professional.name}`}
            >
              <PhoneIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share profile">
            <IconButton
              onClick={onShare}
              aria-label={`Share ${professional.name}'s profile`}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Report profile">
            <IconButton
              onClick={onReport}
              aria-label={`Report ${professional.name}'s profile`}
              color="error"
            >
              <ReportIcon />
            </IconButton>
          </Tooltip>
        </SecondaryActions>
      </Stack>
    );
  }

  return (
    <DesktopButtonContainer spacing={2}>
      {/* Primary Actions */}
      <Button
        variant="contained"
        size="large"
        startIcon={<MessageIcon />}
        onClick={() => onContact('message')}
        disabled={!canMessage as any}
        aria-label={`Send message to ${professional.name}`}
        fullWidth
      >
        Send Message
      </Button>
      
      <Button
        variant="outlined"
        size="large"
        startIcon={<CalendarTodayIcon />}
        onClick={onBook}
        aria-label={`Book ${professional.name}`}
        fullWidth
      >
        Book Now
      </Button>
      
      <Button
        variant="outlined"
        startIcon={<PhoneIcon />}
        onClick={() => onContact('phone')}
        disabled={!canViewContact as any}
        aria-label={`Call ${professional.name}`}
        fullWidth
      >
        Call Now
      </Button>
      
      {/* Secondary Actions */}
      <SecondaryActions direction="row" spacing={1} justifyContent="space-between">
        <Tooltip title={isSaved ? 'Remove from saved' : 'Save profile'}>
          <IconButton
            onClick={onSave}
            aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
            color={isSaved ? 'primary' : 'default'}
          >
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Share profile">
          <IconButton
            onClick={onShare}
            aria-label={`Share ${professional.name}'s profile`}
          >
            <ShareIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Report profile">
          <IconButton
            onClick={onReport}
            aria-label={`Report ${professional.name}'s profile`}
            color="error"
          >
            <ReportIcon />
          </IconButton>
        </Tooltip>
      </SecondaryActions>
    </DesktopButtonContainer>
  );
};