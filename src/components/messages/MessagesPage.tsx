import React, { useState } from 'react';
import {
  Container,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Message } from '../../types';
import { MessageType } from '../../types/enums';
import { mockQuery } from '../../data/getMyGrapherMockData';
import { formatDateTime } from '../../utils/formatters';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
}));

const ConversationItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const MessagesPage: React.FC = () => {
  const [messages] = useState<Message[]>(mockQuery.messages);

  // Group messages by conversation
  const conversations = messages.reduce((acc, message) => {
    const conversationId = message.conversationId;
    if (!acc[conversationId]) {
      acc[conversationId] = [];
    }
    acc[conversationId].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  const getMessageTypeLabel = (type: MessageType) => {
    switch (type) {
      case MessageType.JOB_INQUIRY:
        return 'Job Inquiry';
      case MessageType.BOOKING_CONFIRMATION:
        return 'Booking';
      case MessageType.CONTACT_SHARE:
        return 'Contact Share';
      default:
        return 'Message';
    }
  };

  const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
      case MessageType.JOB_INQUIRY:
        return 'primary';
      case MessageType.BOOKING_CONFIRMATION:
        return 'success';
      case MessageType.CONTACT_SHARE:
        return 'info';
      default:
        return 'default';
    }
  };

  if (Object.keys(conversations).length === 0) {
    return (
      <StyledContainer>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No messages yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start applying to jobs or posting your own to begin conversations
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <Stack spacing={3}>
        {/* Header */}
        <Typography variant="h5" fontWeight="bold">
          Messages
        </Typography>

        {/* Conversations List */}
        <Paper>
          <List sx={{ p: 0 }}>
            {Object.entries(conversations).map(([conversationId, conversationMessages]) => {
              const latestMessage = conversationMessages[conversationMessages.length - 1];
              const unreadCount = conversationMessages.filter(m => !m.isRead).length;
              
              return (
                <ConversationItem key={conversationId}>
                  <ListItemAvatar>
                    <Badge badgeContent={unreadCount} color="error">
                      <Avatar src="https://i.pravatar.cc/150?img=5">
                        {latestMessage.senderId.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight="medium">
                          Kavya Krishnan
                        </Typography>
                        <Chip
                          label={getMessageTypeLabel(latestMessage.type)}
                          size="small"
                          color={getMessageTypeColor(latestMessage.type) as any}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {latestMessage.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(new Date(latestMessage.timestamp))}
                        </Typography>
                      </Stack>
                    }
                  />
                </ConversationItem>
              );
            })}
          </List>
        </Paper>
      </Stack>
    </StyledContainer>
  );
};