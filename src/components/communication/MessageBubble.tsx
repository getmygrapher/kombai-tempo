import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { MessageData, MessageStatus } from '../../types/communication';
import { MessageType } from '../../types/enums';
import { formatTime } from '../../utils/formatters';
import { formatMessageStatus } from '../../utils/communicationFormatters';

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

const MessageContainer = styled(Stack)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  alignItems: isOwn ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
  maxWidth: '100%'
}));

const MessageBubble = styled(Paper)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  maxWidth: '75%',
  padding: theme.spacing(1.5, 2),
  borderRadius: 18,
  backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.grey[100],
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary,
  borderBottomRightRadius: isOwn ? 6 : 18,
  borderBottomLeftRadius: isOwn ? 18 : 6,
  position: 'relative',
  '&:hover .message-actions': {
    opacity: 1
  }
}));

const MessageActions = styled(Box)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  position: 'absolute',
  top: -8,
  [isOwn ? 'left' : 'right']: -8,
  opacity: 0,
  transition: 'opacity 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%',
  boxShadow: theme.shadows[2]
}));

const MessageInfo = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  alignItems: 'center',
  gap: theme.spacing(0.5)
}));

const StatusIcon = styled(Box)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  opacity: 0.7,
  fontSize: '0.875rem'
}));

export const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onReport
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleReply = () => {
    onReply?.(message.id);
    handleMenuClose();
  };

  const handleReport = () => {
    onReport?.(message.id);
    handleMenuClose();
  };

  const getMessageTypeChip = () => {
    if (message.type === MessageType.JOB_INQUIRY) {
      return <Chip label="Job Inquiry" size="small" color="primary" variant="outlined" />;
    }
    if (message.type === MessageType.BOOKING_CONFIRMATION) {
      return <Chip label="Booking" size="small" color="success" variant="outlined" />;
    }
    if (message.type === MessageType.CONTACT_SHARE) {
      return <Chip label="Contact Share" size="small" color="info" variant="outlined" />;
    }
    return null;
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    
    switch (message.status) {
      case MessageStatus.SENDING:
        return <CheckIcon fontSize="inherit" />;
      case MessageStatus.SENT:
        return <CheckIcon fontSize="inherit" />;
      case MessageStatus.DELIVERED:
        return <DoneAllIcon fontSize="inherit" />;
      case MessageStatus.READ:
        return <DoneAllIcon fontSize="inherit" color="primary" />;
      case MessageStatus.FAILED:
        return <Typography variant="caption" color="error">!</Typography>;
      default:
        return null;
    }
  };

  return (
    <MessageContainer direction="row" spacing={1} isOwn={isOwn as any}>
      {!isOwn && showAvatar && (
        <Avatar 
          src="https://i.pravatar.cc/150?img=5" 
          sx={{ width: 32, height: 32 }}
        />
      )}
      
      <Stack spacing={0.5} sx={{ maxWidth: '100%' }}>
        {getMessageTypeChip() && (
          <Box sx={{ alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
            {getMessageTypeChip()}
          </Box>
        )}
        
        <MessageBubble isOwn={isOwn as any} elevation={1}>
          <MessageActions className="message-actions" isOwn={isOwn as any}>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </MessageActions>
          
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {message.content}
          </Typography>
          
          <MessageInfo direction="row" justifyContent="flex-end">
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {formatTime(new Date(message.timestamp))}
            </Typography>
            <StatusIcon isOwn={isOwn as any}>
              {getStatusIcon()}
            </StatusIcon>
          </MessageInfo>
        </MessageBubble>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: isOwn ? 'left' : 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: isOwn ? 'left' : 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleReply}>
          <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
          Reply
        </MenuItem>
        {!isOwn && (
          <MenuItem onClick={handleReport} sx={{ color: 'error.main' }}>
            Report
          </MenuItem>
        )}
      </Menu>
    </MessageContainer>
  );
};