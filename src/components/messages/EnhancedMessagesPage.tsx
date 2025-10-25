import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Stack,
  Box,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import { ConversationList } from '../communication/ConversationList';
import { ChatWindow } from '../communication/ChatWindow';
import { DeveloperRealtimePanel } from '../communication/DeveloperRealtimePanel';
import { useCommunicationStore } from '../../store/communicationStore';
import { mockQuery } from '../../data/communicationMockData';

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10), // Space for bottom navigation
  height: '100vh',
  display: 'flex',
  flexDirection: 'column'
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper
}));

const ConversationPanel = styled(Box)<{ isVisible: boolean }>(({ theme, isVisible }) => ({
  width: '100%',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: isVisible ? 'flex' : 'none',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    width: 380,
    display: 'flex'
  }
}));

const ChatPanel = styled(Box)<{ isVisible: boolean }>(({ theme, isVisible }) => ({
  flex: 1,
  display: isVisible ? 'flex' : 'none',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center'
}));

const NewChatFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(12), // Above bottom navigation
  right: theme.spacing(2),
  zIndex: 1000
}));

export const EnhancedMessagesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const {
    currentConversationId,
    conversations,
    setCurrentConversation,
    addConversation,
    updateUnreadCount
  } = useCommunicationStore();

  const [showChat, setShowChat] = useState(false);

  // Initialize conversations from mock data
  useEffect(() => {
    mockQuery.conversations.forEach(conv => {
      addConversation(conv);
    });
    updateUnreadCount();
  }, [addConversation, updateUnreadCount]);

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversation(conversationId);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowChat(false);
      setCurrentConversation(null);
    }
  };

  const handleNewChat = () => {
    // In a real app, this would open a professional search/selection modal
    console.log('Start new conversation');
  };

  const showConversationList = !isMobile || !showChat;
  const showChatWindow = (!isMobile && !!currentConversationId) || (isMobile && showChat && !!currentConversationId);

  return (
    <StyledContainer maxWidth="xl">
      <Stack spacing={3} sx={{ height: '100%' }}>
        {/* Header */}
        {showConversationList && (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Messages
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.length} conversations
            </Typography>
          </Stack>
        )}

        {/* Messages Interface */}
        <MessagesContainer>
          {/* Conversation List Panel */}
          <ConversationPanel isVisible={showConversationList as any}>
            <ConversationList onConversationSelect={handleConversationSelect} />
          </ConversationPanel>

          {/* Chat Panel */}
          <ChatPanel isVisible={showChatWindow as any}>
            {currentConversationId ? (
              <ChatWindow
                conversationId={currentConversationId}
                onBack={handleBackToList}
              />
            ) : (
              <EmptyState>
                <ChatBubbleOutlinedIcon 
                  sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} 
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Select a conversation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a conversation from the list to start messaging
                </Typography>
              </EmptyState>
            )}
          </ChatPanel>
        </MessagesContainer>

        {/* Dev-only realtime panel (toggle by env flag) */}
        {import.meta?.env?.DEV && (
          <Box>
            <DeveloperRealtimePanel />
          </Box>
        )}
      </Stack>

      {/* New Chat FAB */}
      <NewChatFab 
        color="primary" 
        onClick={handleNewChat}
        size={isMobile ? 'medium' : 'large'}
      >
        <ChatBubbleOutlinedIcon />
      </NewChatFab>
    </StyledContainer>
  );
};