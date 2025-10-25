import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ArchiveIcon from '@mui/icons-material/Archive';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { OnlineStatus, ContactSharingStatus } from '../../types/communication';
import { formatLastSeen } from '../../utils/communicationFormatters';

interface ConversationHeaderProps {
  userName: string;
  userAvatar: string;
  onlineStatus: OnlineStatus;
  lastSeen?: string;
  isTyping?: boolean;
  contactSharingStatus: ContactSharingStatus;
  onBack: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onBlock?: () => void;
  onDelete?: () => void;
  jobTitle?: string;
}

const HeaderContainer = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  minHeight: 64
}));

const OnlineIndicator = styled(FiberManualRecordIcon)<{ status: OnlineStatus }>(({ theme, status }) => ({
  fontSize: 12,
  color: status === OnlineStatus.ONLINE ? theme.palette.success.main : 
         status === OnlineStatus.AWAY ? theme.palette.warning.main : 
         theme.palette.grey[400]
}));

const StatusText = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary
}));

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  userName,
  userAvatar,
  onlineStatus,
  lastSeen,
  isTyping = false,
  contactSharingStatus,
  onBack,
  onCall,
  onVideoCall,
  onArchive,
  onMute,
  onBlock,
  onDelete,
  jobTitle
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const getStatusText = () => {
    if (isTyping) {
      return 'Typing...';
    }
    
    if (onlineStatus === OnlineStatus.ONLINE) {
      return 'Online';
    }
    
    if (lastSeen) {
      return `Last seen ${formatLastSeen(new Date(lastSeen))}`;
    }
    
    return 'Offline';
  };

  const getContactSharingChip = () => {
    if (contactSharingStatus === ContactSharingStatus.SHARED) {
      return <Chip label="Contact Shared" size="small" color="success" variant="outlined" />;
    }
    if (contactSharingStatus === ContactSharingStatus.REQUESTED) {
      return <Chip label="Contact Requested" size="small" color="warning" variant="outlined" />;
    }
    return null;
  };

  return (
    <HeaderContainer direction="row" alignItems="center" spacing={2}>
      {/* Back Button */}
      <IconButton onClick={onBack} edge="start">
        <ArrowBackIcon />
      </IconButton>

      {/* User Info */}
      <Stack direction="row" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        <Avatar src={userAvatar} sx={{ width: 40, height: 40 }} />
        
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium" noWrap>
            {userName}
          </Typography>
          
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <OnlineIndicator status={onlineStatus} />
            <StatusText variant="body2">
              {getStatusText()}
            </StatusText>
          </Stack>
          
          {jobTitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
              Re: {jobTitle}
            </Typography>
          )}
        </Stack>
      </Stack>

      {/* Contact Status */}
      {getContactSharingChip() && (
        <Box>
          {getContactSharingChip()}
        </Box>
      )}

      {/* Action Buttons */}
      <Stack direction="row" spacing={0.5}>
        {contactSharingStatus === ContactSharingStatus.SHARED && (
          <>
            <IconButton onClick={onCall}>
              <CallIcon />
            </IconButton>
            <IconButton onClick={onVideoCall}>
              <VideoCallIcon />
            </IconButton>
          </>
        )}
        
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </Stack>

      {/* More Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { onArchive?.(); handleMenuClose(); }}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={() => { onMute?.(); handleMenuClose(); }}>
          <VolumeOffIcon fontSize="small" sx={{ mr: 1 }} />
          Mute
        </MenuItem>
        <MenuItem onClick={() => { onBlock?.(); handleMenuClose(); }} sx={{ color: 'warning.main' }}>
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          Block User
        </MenuItem>
        <MenuItem onClick={() => { onDelete?.(); handleMenuClose(); }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Conversation
        </MenuItem>
      </Menu>
    </HeaderContainer>
  );
};