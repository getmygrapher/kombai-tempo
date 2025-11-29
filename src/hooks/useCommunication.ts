import { useEffect, useCallback, useRef } from 'react';
import { communicationService } from '../services/communicationService';
import { useCommunicationStore } from '../store/communicationStore';
import { MessageData, ConversationData } from '../types/communication';
import { MessageType } from '../types/enums';

/**
 * Hook to manage real-time messaging for a conversation
 */
export function useConversationMessages(conversationId: string | null) {
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const { addMessage, markConversationAsRead, fetchMessages } = useCommunicationStore();

    // Subscribe to real-time messages
    useEffect(() => {
        if (!conversationId) return;

        // Subscribe to new messages
        const unsubscribe = communicationService.subscribeToMessages(
            conversationId,
            (message: MessageData) => {
                addMessage(message);
            }
        );

        unsubscribeRef.current = unsubscribe;

        // Fetch initial messages
        fetchMessages(conversationId, { limit: 50 });

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [conversationId, addMessage, fetchMessages]);

    // Mark messages as read when viewing conversation
    useEffect(() => {
        if (!conversationId) return;

        const timer = setTimeout(() => {
            markConversationAsRead(conversationId);
            communicationService.markMessagesRead(conversationId);
        }, 1000);

        return () => clearTimeout(timer);
    }, [conversationId, markConversationAsRead]);

    return {
        loadMore: useCallback(() => {
            if (conversationId) {
                return fetchMessages(conversationId, { limit: 50 });
            }
            return Promise.resolve({ ok: false, hasMore: false });
        }, [conversationId, fetchMessages])
    };
}

/**
 * Hook to manage conversations list with real-time updates
 */
export function useConversations() {
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const { conversations, addConversation, updateConversation } = useCommunicationStore();

    // Fetch conversations on mount
    useEffect(() => {
        const loadConversations = async () => {
            try {
                const result = await communicationService.getConversations(50, 0);
                result.conversations.forEach(conv => {
                    const existing = conversations.find(c => c.id === conv.id);
                    if (existing) {
                        updateConversation(conv.id, conv);
                    } else {
                        addConversation(conv);
                    }
                });
            } catch (error) {
                console.error('Failed to load conversations:', error);
            }
        };

        loadConversations();

        // Subscribe to conversation updates
        const unsubscribe = communicationService.subscribeToConversations(
            (conversation: ConversationData) => {
                const existing = conversations.find(c => c.id === conversation.id);
                if (existing) {
                    updateConversation(conversation.id, conversation);
                } else {
                    addConversation(conversation);
                }
            }
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, []);

    return {
        conversations,
        refresh: useCallback(async () => {
            const result = await communicationService.getConversations(50, 0);
            return result.conversations;
        }, [])
    };
}

/**
 * Hook to manage typing indicators
 */
export function useTypingIndicator(conversationId: string | null) {
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const { setTypingStatusInConversation, typingByConversation } = useCommunicationStore();
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!conversationId) return;

        const unsubscribe = communicationService.subscribeToTyping(
            conversationId,
            (userId: string, isTyping: boolean) => {
                setTypingStatusInConversation(conversationId, userId, isTyping);
            }
        );

        unsubscribeRef.current = unsubscribe;

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [conversationId, setTypingStatusInConversation]);

    const sendTypingIndicator = useCallback((isTyping: boolean) => {
        if (!conversationId) return;

        communicationService.sendTypingIndicator(conversationId, isTyping);

        // Auto-stop typing after 3 seconds
        if (isTyping) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                communicationService.sendTypingIndicator(conversationId, false);
            }, 3000);
        }
    }, [conversationId]);

    return {
        typingUsers: conversationId ? (typingByConversation[conversationId] || []) : [],
        sendTypingIndicator
    };
}

/**
 * Hook to send messages with optimistic updates
 */
export function useSendMessage(conversationId: string | null) {
    const { sendMessage } = useCommunicationStore();

    return useCallback(
        async (content: string, type: MessageType = MessageType.TEXT, attachments: any[] = []) => {
            if (!conversationId) {
                throw new Error('No conversation selected');
            }

            return sendMessage({
                conversationId,
                senderId: '', // Will be filled by store
                receiverId: '', // Will be filled by store
                content,
                type,
                attachments
            });
        },
        [conversationId, sendMessage]
    );
}

/**
 * Hook to create a new conversation
 */
export function useCreateConversation() {
    const { addConversation, setCurrentConversation } = useCommunicationStore();

    return useCallback(
        async (participantIds: string[], jobId?: string) => {
            try {
                const result = await communicationService.createConversation(participantIds, jobId);

                // Fetch the conversation details
                const conversations = await communicationService.getConversations(1, 0);
                const newConversation = conversations.conversations.find(c => c.id === result.conversationId);

                if (newConversation) {
                    addConversation(newConversation);
                    setCurrentConversation(result.conversationId);
                }

                return result.conversationId;
            } catch (error) {
                console.error('Failed to create conversation:', error);
                throw error;
            }
        },
        [addConversation, setCurrentConversation]
    );
}

/**
 * Hook to manage contact sharing
 */
export function useContactSharing(conversationId: string | null) {
    return {
        requestContactShare: useCallback(
            async (toUserId: string) => {
                if (!conversationId) {
                    throw new Error('No conversation selected');
                }
                return communicationService.requestContactShare(toUserId, conversationId);
            },
            [conversationId]
        ),
        respondToContactShare: useCallback(
            async (requestId: string, approved: boolean) => {
                return communicationService.respondToContactShare(requestId, approved);
            },
            []
        )
    };
}

/**
 * Hook to search messages
 */
export function useMessageSearch() {
    return useCallback(
        async (query: string, conversationId?: string) => {
            if (!query.trim()) return [];
            return communicationService.searchMessages(query, conversationId);
        },
        []
    );
}
