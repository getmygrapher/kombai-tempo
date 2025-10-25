import React, { useMemo, useState } from 'react';
import { Stack, Card, CardContent, Typography, Button, Divider, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useCommunicationStore } from '../../store/communicationStore';
import { MessageType } from '../../types/enums';

export const DeveloperRealtimePanel: React.FC = () => {
  const {
    conversations,
    setTypingStatusInConversation,
    setOnlineStatus,
    addMessage,
    markConversationAsRead
  } = useCommunicationStore();

  const [conversationId, setConversationId] = useState<string>('');
  const conversationOptions = useMemo(() => conversations.map(c => ({ id: c.id })), [conversations]);

  const simulateTyping = () => {
    if (!conversationId) return;
    const otherUserId = getOtherParticipant(conversationId);
    if (!otherUserId) return;
    setTypingStatusInConversation(conversationId, otherUserId, true);
    setTimeout(() => setTypingStatusInConversation(conversationId, otherUserId, false), 1500);
  };

  const simulatePresence = () => {
    const otherUserId = getOtherParticipant(conversationId);
    if (!conversationId || !otherUserId) return;
    setOnlineStatus(otherUserId, 0 as any); // OnlineStatus.ONLINE without import to keep lightweight
  };

  const simulateIncomingMessage = () => {
    if (!conversationId) return;
    const otherUserId = getOtherParticipant(conversationId);
    if (!otherUserId) return;
    addMessage({
      id: `dev_${Date.now()}`,
      conversationId,
      senderId: otherUserId,
      receiverId: 'user_123',
      content: 'Dev: incoming message',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: MessageType.TEXT,
      status: 2 as any // DELIVERED
    });
  };

  const simulateRead = () => {
    if (!conversationId) return;
    markConversationAsRead(conversationId);
  };

  return (
    <Card variant="outlined" sx={{ p: 0 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle2">Developer Realtime Panel</Typography>
          <Divider />
          <FormControl size="small">
            <InputLabel id="conv-label">Conversation</InputLabel>
            <Select
              labelId="conv-label"
              label="Conversation"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
            >
              {conversationOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.id}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={simulateTyping}>Typing</Button>
            <Button variant="outlined" onClick={simulatePresence}>Presence</Button>
            <Button variant="outlined" onClick={simulateIncomingMessage}>Incoming</Button>
            <Button variant="outlined" onClick={simulateRead}>Read</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

function getOtherParticipant(conversationId: string): string | null {
  const { conversations } = useCommunicationStore.getState();
  const conv = conversations.find(c => c.id === conversationId);
  if (!conv) return null;
  const other = conv.participants.find(p => p !== 'user_123');
  return other || null;
}

