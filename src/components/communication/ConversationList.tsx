import React, { useState } from 'react';
import {
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Badge,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArchiveIcon from '@mui/icons-material/Archive';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { ConversationData, MessageFilterType, OnlineStatus, ContactSharingStatus } from '../../types/communication';
import { MessageType } from '../../types/enums';
import { formatTime, formatTimeAgo } from '../../utils/formatters';
import { formatMessagePreview, formatUnreadCount } from '../../utils/communicationFormatters';
import { useCommunicationStore } from '../../store/communicationStore';
import { mockQuery } from '../../data/communicationMockData';

interface ConversationListProps {
  onConversationSelect: (conversationId: string) => void;
}

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const ConversationItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5, 1),
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  },
  '&.unread': {
    backgroundColor: theme.palette.primary.main + '05'
  }
}));

const OnlineIndicator = styled(FiberManualRecordIcon)(({ theme }) => ({
  fontSize: 12,
  color: theme.palette.success.main,
  position: 'absolute',
  bottom: 2,
  right: 2,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%'
}));

const filterTabs = [
  { value: MessageFilterType.ALL, label: 'All' },
  { value: MessageFilterType.UNREAD, label: 'Unread' },
  { value: MessageFilterType.JOB_RELATED, label: 'Jobs' },
  { value: MessageFilterType.CONTACT_REQUESTS, label: 'Contacts' }
];

export const ConversationList: React.FC<ConversationListProps> = ({
  onConversationSelect
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const {
    conversations,
    messageFilter,
    searchQuery,
    onlineUsers,
    setMessageFilter,
    setSearchQuery,
    archiveConversation,
    muteConversation,
    deleteConversation
  } = useCommunicationStore();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversationId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversationId(conversationId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversationId(null);
  };

  const handleArchive = () => {
    if (selectedConversationId) {
      archiveConversation(selectedConversationId);
    }
    handleMenuClose();
  };

  const handleMute = () => {
    if (selectedConversationId) {
      muteConversation(selectedConversationId);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedConversationId) {
      deleteConversation(selectedConversationId);
    }
    handleMenuClose();
  };

  const getFilteredConversations = () => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => {
        const professional = mockQuery.professionals.find(p => 
          conv.participants.includes(p.id)
        );
        return professional?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Apply message type filter
    switch (messageFilter) {
      case MessageFilterType.UNREAD:
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case MessageFilterType.JOB_RELATED:
        filtered = filtered.filter(conv => 
          conv.jobId || conv.lastMessage.type === MessageType.JOB_INQUIRY
        );
        break;
      case MessageFilterType.CONTACT_REQUESTS:
        filtered = filtered.filter(conv => 
          conv.contactSharingStatus === ContactSharingStatus.REQUESTED ||
          conv.lastMessage.type === MessageType.CONTACT_SHARE
        );
        break;
      default:
        // Show all active conversations
        filtered = filtered.filter(conv => !conv.isArchived);
    }

    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  };

  const getMessageTypeChip = (conversation: ConversationData) => {
    if (conversation.lastMessage.type === MessageType.JOB_INQUIRY) {
      return <Chip label="Job" size="small" color="primary" variant="outlined" />;
    }
    if (conversation.lastMessage.type === MessageType.BOOKING_CONFIRMATION) {
      return <Chip label="Booking" size="small" color="success" variant="outlined" />;
    }
    if (conversation.lastMessage.type === MessageType.CONTACT_SHARE) {
      return <Chip label="Contact" size="small" color="info" variant="outlined" />;
    }
    return null;
  };

  const getProfessionalInfo = (conversation: ConversationData) => {
    return mockQuery.professionals.find(p => 
      conversation.participants.includes(p.id)
    );
  };

  const filteredConversations = getFilteredConversations();

  return (
    <Stack sx={{ height: '100%' }}>
      {/* Search */}
      <SearchContainer>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      </SearchContainer>

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={messageFilter}
          onChange={(_, value) => setMessageFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {filterTabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      {/* Conversations List */}
      <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
        {filteredConversations.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </Typography>
          </Box>
        ) : (
          filteredConversations.map((conversation) => {
            const professional = getProfessionalInfo(conversation);
            const isOnline = professional && onlineUsers.includes(professional.id);
            const unreadCount = conversation.unreadCount;
            
            if (!professional) return null;

            return (
              <ConversationItem
                key={conversation.id}
                className={unreadCount > 0 ? 'unread' : ''}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <ListItemAvatar>
                  <Badge 
                    badgeContent={formatUnreadCount(unreadCount)} 
                    color="error"
                    overlap="circular"
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={professional.profilePhoto} />
                      {isOnline && <OnlineIndicator />}
                    </Box>
                  </Badge>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={unreadCount > 0 ? 'bold' : 'medium'}
                        noWrap
                      >
                        {professional.name}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {getMessageTypeChip(conversation)}
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(new Date(conversation.lastMessage.timestamp))}
                        </Typography>
                      </Stack>
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        noWrap
                        fontWeight={unreadCount > 0 ? 'medium' : 'normal'}
                      >
                        {formatMessagePreview(conversation.lastMessage.content, 60)}
                      </Typography>
                      {conversation.jobId && (
                        <Typography variant="caption" color="primary.main">
                          Re: Wedding Photography Project
                        </Typography>
                      )}
                    </Stack>
                  }
                />

                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, conversation.id)}
                  sx={{ ml: 1 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </ConversationItem>
            );
          })
        )}
      </List>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleArchive}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleMute}>
          <VolumeOffIcon fontSize="small" sx={{ mr: 1 }} />
          Mute
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Stack>
  );
};