import React, { useEffect, useRef, useState } from 'react';
import {
  Stack,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubbleComponent } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { ContactShareModal } from './ContactShareModal';
import { JobContextCard } from './JobContextCard';
import { MessageData, OnlineStatus, ContactSharingStatus } from '../../types/communication';
import { MessageType } from '../../types/enums';
import { useCommunicationStore } from '../../store/communicationStore';
import { mockQuery } from '../../data/communicationMockData';
import { useAppStore } from '../../store/appStore';

interface ChatWindowProps {
  conversationId: string;
  onBack: () => void;
}

const ChatContainer = styled(Stack)(({ theme }) => ({
  height: '100vh',
  backgroundColor: theme.palette.background.default
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.default,
  '&::-webkit-scrollbar': {
    width: 6
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'transparent'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3
  }
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%'
});

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  onBack
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const {
    conversations,
    messages,
    activeTypingUsers,
    onlineUsers,
    lastSeenTimestamps,
    contactSharedUsers,
    addMessage,
    markConversationAsRead,
    shareContact,
    blockUser,
    archiveConversation,
    muteConversation,
    deleteConversation
  } = useCommunicationStore();

  const currentUser = useAppStore(state => state.user);

  const conversation = conversations.find(conv => conv.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  
  // Mock professional data - in real app this would come from API
  const professional = mockQuery.professionals.find(p => 
    conversation?.participants.includes(p.id)
  );

  useEffect(() => {
    if (conversation && conversation.unreadCount > 0) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, conversation, markConversationAsRead]);

  useEffect(() => {
    // Initial page load if empty
    if ((messages[conversationId] || []).length === 0) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const before = (messages[conversationId]?.[0]?.timestamp) || undefined;
    const res = await useCommunicationStore.getState().fetchMessages(conversationId, { before, limit: 20 });
    setHasMore(res.hasMore);
    setIsLoadingMore(false);
  };

  const handleSendMessage = async (content: string, type: MessageType) => {
    await useCommunicationStore.getState().sendMessage({
      conversationId,
      senderId: currentUser?.id || 'user_123',
      receiverId: professional?.id || '',
      content,
      type
    });
  };

  const handleContactShare = () => {
    setShowContactModal(true);
  };

  const handleContactShareConfirm = () => {
    if (professional) {
      shareContact(professional.id);
      setShowContactModal(false);
      
      // Send system message about contact sharing
      const systemMessage: MessageData = {
        id: `msg_system_${Date.now()}`,
        conversationId,
        senderId: 'system',
        receiverId: professional.id,
        content: 'Contact information has been shared',
        timestamp: new Date().toISOString(),
        isRead: true,
        type: MessageType.CONTACT_SHARE,
        status: 'delivered' as any
      };
      
      addMessage(systemMessage);
    }
  };

  const handleArchive = () => {
    archiveConversation(conversationId);
    onBack();
  };

  const handleMute = () => {
    muteConversation(conversationId);
  };

  const handleBlock = () => {
    if (professional) {
      blockUser(professional.id);
      onBack();
    }
  };

  const handleDelete = () => {
    deleteConversation(conversationId);
    onBack();
  };

  if (!conversation || !professional) {
    return (
      <LoadingContainer>
        <Typography variant="h6" color="text.secondary">
          Conversation not found
        </Typography>
      </LoadingContainer>
    );
  }

  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  const isUserOnline = onlineUsers.includes(professional.id);
  const isUserTyping = activeTypingUsers.includes(professional.id);
  const isContactShared = contactSharedUsers.includes(professional.id);
  const lastSeen = lastSeenTimestamps[professional.id];

  const onlineStatus = isUserOnline ? OnlineStatus.ONLINE : OnlineStatus.OFFLINE;
  const contactSharingStatus = isContactShared 
    ? ContactSharingStatus.SHARED 
    : ContactSharingStatus.NOT_REQUESTED;

  return (
    <ChatContainer>
      {/* Header */}
      <ConversationHeader
        userName={professional.name}
        userAvatar={professional.profilePhoto}
        onlineStatus={onlineStatus}
        lastSeen={lastSeen}
        isTyping={isUserTyping as any}
        contactSharingStatus={contactSharingStatus}
        onBack={onBack}
        onArchive={handleArchive}
        onMute={handleMute}
        onBlock={handleBlock}
        onDelete={handleDelete}
        jobTitle={conversation.jobId ? 'Wedding Photography Project' : undefined}
      />

      {/* Messages */}
      <MessagesContainer onScroll={(e: any) => {
        const top = e.currentTarget.scrollTop;
        if (top < 50) {
          loadMore();
        }
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={1}>
          {conversation.jobId && (
            <JobContextCard jobTitle={'Wedding Photography Project'} />
          )}
          {conversationMessages.map((message, index) => {
            const isOwn = message.senderId === (currentUser?.id || 'user_123');
            const showAvatar = !isOwn && (
              index === 0 || 
              conversationMessages[index - 1]?.senderId !== message.senderId
            );

            return (
              <MessageBubbleComponent
                key={message.id}
                message={message}
                isOwn={isOwn as any}
                showAvatar={showAvatar as any}
                onReply={(messageId) => console.log('Reply to:', messageId)}
                onReport={(messageId) => console.log('Report:', messageId)}
              />
            );
          })}

          {isUserTyping && <TypingIndicator userName={professional.name} />}
          {isLoadingMore && (
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', my: 1 }}>
              Loading earlier messages...
            </Typography>
          )}
          
          <div ref={messagesEndRef} />
        </Stack>
      </MessagesContainer>

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onContactShare={handleContactShare}
        templates={mockQuery.messageTemplates}
        placeholder="Type a message..."
      />

      {/* Contact Share Modal */}
      <ContactShareModal
        open={showContactModal as any}
        onClose={() => setShowContactModal(false)}
        onConfirm={handleContactShareConfirm}
        professionalName={professional.name}
        isShared={isContactShared as any}
      />
    </ChatContainer>
  );
};