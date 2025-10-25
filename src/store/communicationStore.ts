import { create } from 'zustand';
import { 
  ConversationData, 
  MessageData, 
  MessageFilterType, 
  NotificationSound,
  OnlineStatus,
  MessageStatus
} from '../types/communication';
import { Notification } from '../types';
import { useAppStore } from './appStore';

interface CommunicationStore {
  // Conversation state
  currentConversationId: string | null;
  conversations: ConversationData[];
  messages: Record<string, MessageData[]>;
  
  // Real-time state
  activeTypingUsers: string[]; // legacy, derived from typingByConversation
  onlineUsers: string[]; // legacy, derived from onlineStatusByUser
  typingByConversation: Record<string, string[]>; // conversationId -> userIds typing
  onlineStatusByUser: Record<string, OnlineStatus>; // userId -> status
  lastSeenTimestamps: Record<string, string>;
  
  // UI state
  messageFilter: MessageFilterType;
  searchQuery: string;
  unreadMessageCount: number;
  
  // Settings
  notificationSound: NotificationSound;
  isNotificationMuted: boolean;
  contactSharedUsers: string[];
  blockedUsers: string[];
  
  // Actions
  setCurrentConversation: (conversationId: string | null) => void;
  addConversation: (conversation: ConversationData) => void;
  updateConversation: (conversationId: string, updates: Partial<ConversationData>) => void;
  
  addMessage: (message: MessageData) => void;
  updateMessage: (messageId: string, updates: Partial<MessageData>) => void;
  markMessageAsRead: (messageId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  
  setTypingStatus: (userId: string, isTyping: boolean) => void;
  setOnlineStatus: (userId: string, status: OnlineStatus) => void;
  updateLastSeen: (userId: string, timestamp: string) => void;
  setTypingStatusInConversation: (conversationId: string, userId: string, isTyping: boolean) => void;
  
  setMessageFilter: (filter: MessageFilterType) => void;
  setSearchQuery: (query: string) => void;
  
  shareContact: (userId: string) => void;
  revokeContactSharing: (userId: string) => void;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  
  archiveConversation: (conversationId: string) => void;
  muteConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  
  updateUnreadCount: () => void;

  // Message lifecycle
  sendMessage: (message: Omit<MessageData, 'id' | 'status' | 'timestamp' | 'isRead'> & { id?: string }) => Promise<{ ok: boolean; id: string }>;
  retryMessage: (messageId: string) => Promise<{ ok: boolean }>;

  // Pagination
  fetchMessages: (conversationId: string, opts?: { before?: string; limit?: number }) => Promise<{ ok: boolean; hasMore: boolean }>;
}

export const useCommunicationStore = create<CommunicationStore>((set, get) => ({
  // Initial state
  currentConversationId: null,
  conversations: [],
  messages: {},
  activeTypingUsers: [],
  onlineUsers: [],
  typingByConversation: {},
  onlineStatusByUser: {},
  lastSeenTimestamps: {},
  messageFilter: MessageFilterType.ALL,
  searchQuery: '',
  unreadMessageCount: 0,
  notificationSound: NotificationSound.DEFAULT,
  isNotificationMuted: false,
  contactSharedUsers: [],
  blockedUsers: [],

  // Actions
  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),
  
  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations]
  })),
  
  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, ...updates } : conv
    )
  })),
  
  addMessage: (message) => set((state) => {
    const conversationMessages = state.messages[message.conversationId] || [];
    const updatedMessages = {
      ...state.messages,
      [message.conversationId]: [...conversationMessages, message]
    };

    // Resolve current user id from app store (fallback maintained for backward compatibility)
    const currentUserId = useAppStore.getState().user?.id ?? 'user_123';

    // Update conversation's last message and unread count
    const updatedConversations = state.conversations.map(conv =>
      conv.id === message.conversationId
        ? {
            ...conv,
            lastMessage: message,
            updatedAt: message.timestamp,
            unreadCount: message.senderId !== currentUserId ? conv.unreadCount + 1 : conv.unreadCount
          }
        : conv
    );

    // Push in-app notification for incoming messages when not muted
    const notifications: Notification[] = [];
    if (message.senderId !== currentUserId && !state.isNotificationMuted) {
      notifications.push({
        id: `notif_${message.id}`,
        title: 'New message',
        message: message.content,
        timestamp: message.timestamp,
        isRead: false,
        type: 'message'
      } as any);
    }

    // Emit notifications via app store
    notifications.forEach(n => useAppStore.getState().addNotification(n));

    return {
      messages: updatedMessages,
      conversations: updatedConversations
    };
  }),
  
  updateMessage: (messageId, updates) => set((state) => {
    const updatedMessages = { ...state.messages };

    // Track which conversation's lastMessage may need updating
    let lastMessageConversationId: string | null = null;

    Object.keys(updatedMessages).forEach(conversationId => {
      updatedMessages[conversationId] = updatedMessages[conversationId].map(msg => {
        if (msg.id === messageId) {
          // If this message is currently the conversation's lastMessage, remember to sync it below
          const conversation = state.conversations.find(c => c.id === conversationId);
          if (conversation && conversation.lastMessage.id === messageId) {
            lastMessageConversationId = conversationId;
          }
          return { ...msg, ...updates };
        }
        return msg;
      });
    });

    // Sync conversations.lastMessage when applicable
    let updatedConversations = state.conversations;
    if (lastMessageConversationId) {
      const latest = updatedMessages[lastMessageConversationId].find(m => m.id === messageId);
      if (latest) {
        updatedConversations = state.conversations.map(conv =>
          conv.id === lastMessageConversationId ? { ...conv, lastMessage: { ...conv.lastMessage, ...updates } } : conv
        );
      }
    }

    return { messages: updatedMessages, conversations: updatedConversations };
  }),
  
  markMessageAsRead: (messageId) => {
    get().updateMessage(messageId, { isRead: true, status: MessageStatus.READ });
  },
  
  markConversationAsRead: (conversationId) => set((state) => {
    const conversationMessages = state.messages[conversationId] || [];
    const currentUserId = useAppStore.getState().user?.id ?? 'user_123';
    const updatedMessages = {
      ...state.messages,
      [conversationId]: conversationMessages.map(msg => ({
        ...msg,
        isRead: true,
        // Only set READ status for messages received by the current user
        status: msg.senderId !== currentUserId ? MessageStatus.READ : msg.status
      }))
    };

    const updatedConversations = state.conversations.map(conv =>
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    );

    return {
      messages: updatedMessages,
      conversations: updatedConversations
    };
  }),
  
  setTypingStatus: (userId, isTyping) => set((state) => ({
    activeTypingUsers: isTyping
      ? [...state.activeTypingUsers.filter(id => id !== userId), userId]
      : state.activeTypingUsers.filter(id => id !== userId)
  })),
  
  setOnlineStatus: (userId, status) => set((state) => ({
    onlineStatusByUser: { ...state.onlineStatusByUser, [userId]: status },
    // Keep legacy array in sync for backward compatibility
    onlineUsers: status === OnlineStatus.ONLINE
      ? [...state.onlineUsers.filter(id => id !== userId), userId]
      : state.onlineUsers.filter(id => id !== userId)
  })),
  
  updateLastSeen: (userId, timestamp) => set((state) => ({
    lastSeenTimestamps: { ...state.lastSeenTimestamps, [userId]: timestamp }
  })),

  setTypingStatusInConversation: (conversationId, userId, isTyping) => set((state) => {
    const existing = state.typingByConversation[conversationId] || [];
    const next = isTyping
      ? [...existing.filter(id => id !== userId), userId]
      : existing.filter(id => id !== userId);
    // Derive legacy flat array
    const merged: Record<string, string[]> = { ...state.typingByConversation, [conversationId]: next };
    const flattened: string[] = Object.values(merged).flatMap((ids: string[]) => ids);
    const allTyping = new Set<string>(flattened);
    return {
      typingByConversation: { ...state.typingByConversation, [conversationId]: next },
      activeTypingUsers: Array.from(allTyping)
    };
  }),
  
  setMessageFilter: (filter) => set({ messageFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Simple preference: mute notifications
  // Note: keeping function signature minimal to avoid breaking callers
  // Consumers can call set({ isNotificationMuted: true }) directly if needed as well
  
  shareContact: (userId) => set((state) => ({
    contactSharedUsers: [...state.contactSharedUsers.filter(id => id !== userId), userId]
  })),
  
  revokeContactSharing: (userId) => set((state) => ({
    contactSharedUsers: state.contactSharedUsers.filter(id => id !== userId)
  })),
  
  blockUser: (userId) => set((state) => ({
    blockedUsers: [...state.blockedUsers.filter(id => id !== userId), userId],
    contactSharedUsers: state.contactSharedUsers.filter(id => id !== userId)
  })),
  
  unblockUser: (userId) => set((state) => ({
    blockedUsers: state.blockedUsers.filter(id => id !== userId)
  })),
  
  archiveConversation: (conversationId) => {
    get().updateConversation(conversationId, { isArchived: true });
  },
  
  muteConversation: (conversationId) => {
    get().updateConversation(conversationId, { isMuted: true });
  },
  
  deleteConversation: (conversationId) => set((state) => ({
    conversations: state.conversations.filter(conv => conv.id !== conversationId),
    messages: Object.fromEntries(
      Object.entries(state.messages).filter(([id]) => id !== conversationId)
    ),
    currentConversationId: state.currentConversationId === conversationId 
      ? null 
      : state.currentConversationId
  })),
  
  updateUnreadCount: () => set((state) => {
    const totalUnread = state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
    return { unreadMessageCount: totalUnread };
  }),

  // Message lifecycle with optimistic updates and simulated network
  sendMessage: async (input) => {
    const currentUserId = useAppStore.getState().user?.id ?? 'user_123';
    const tempId = input.id || `temp_${Date.now()}`;
    const message: MessageData = {
      id: tempId,
      conversationId: input.conversationId,
      senderId: input.senderId || currentUserId,
      receiverId: input.receiverId,
      content: input.content,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: input.type,
      status: MessageStatus.SENDING
    };

    // Optimistically add
    get().addMessage(message);

    try {
      // Simulate network latency and success/failure
      await new Promise((resolve) => setTimeout(resolve, 500));
      const succeed = true; // Replace with real API result
      if (!succeed) throw new Error('failed');

      // Mark as delivered
      get().updateMessage(tempId, { status: MessageStatus.DELIVERED });
      return { ok: true, id: tempId };
    } catch (e) {
      get().updateMessage(tempId, { status: MessageStatus.FAILED });
      return { ok: false, id: tempId } as any;
    }
  },

  retryMessage: async (messageId) => {
    get().updateMessage(messageId, { status: MessageStatus.SENDING });
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const succeed = true;
      if (!succeed) throw new Error('failed');
      get().updateMessage(messageId, { status: MessageStatus.DELIVERED });
      return { ok: true };
    } catch (e) {
      get().updateMessage(messageId, { status: MessageStatus.FAILED });
      return { ok: false };
    }
  }
  ,

  // Simple pagination against existing in-memory messages
  fetchMessages: async (conversationId, opts) => {
    const limit = opts?.limit ?? 20;
    const before = opts?.before ? new Date(opts.before).getTime() : Number.POSITIVE_INFINITY;
    const state = get();
    const all = state.messages[conversationId] || [];
    const older = all
      .filter(m => new Date(m.timestamp).getTime() < before)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
    // Prepend older messages if not already in list (ids unique)
    if (older.length > 0) {
      set((s) => ({
        messages: {
          ...s.messages,
          [conversationId]: [...older.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), ...((s.messages[conversationId]) || [])]
        }
      }));
    }
    const remaining = all.filter(m => new Date(m.timestamp).getTime() < (older[older.length - 1]?.timestamp ? new Date(older[older.length - 1].timestamp).getTime() : before)).length;
    return { ok: true, hasMore: remaining > 0 };
  }
}));

// Ensure unread count stays consistent after key mutations
useCommunicationStore.subscribe((state, prev) => {
  // If conversations array length or any unreadCount changed, recompute total
  const prevTotal = prev?.conversations?.reduce((t, c) => t + c.unreadCount, 0) ?? 0;
  const nextTotal = state.conversations.reduce((t, c) => t + c.unreadCount, 0);
  if (prevTotal !== nextTotal) {
    useCommunicationStore.getState().updateUnreadCount();
  }
});