import { supabase } from './supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
    ConversationData,
    MessageData,
    ConversationListResponse,
    MessageListResponse,
    ContactSharingResponse,
    MessageStatus,
    ConversationStatus,
    ContactSharingStatus,
    ConversationPriority
} from '../types/communication';
import { MessageType } from '../types/enums';

// Helper function to map errors
function mapError(error: any): Error {
    if (!error) return new Error('Unknown error');
    const message = error.message || error.error_description || 'Unexpected error';
    return new Error(message);
}

// Helper to get current user ID
async function getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw mapError(error);
    const uid = data.user?.id;
    if (!uid) throw new Error('No authenticated user');
    return uid;
}

// Database row types
type ConversationRow = {
    id: string;
    participant_ids: string[];
    job_id: string | null;
    last_message_at: string;
    last_message_preview: string | null;
    created_at: string;
    unread_count: number;
};

type MessageRow = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    attachments: any[];
    read_by: string[];
    sent_at: string;
    edited_at: string | null;
    is_deleted: boolean;
};

type ContactShareRow = {
    id: string;
    from_user_id: string;
    to_user_id: string;
    conversation_id: string;
    status: string;
    requested_at: string;
    responded_at: string | null;
};

// Mapping functions
function mapConversation(row: ConversationRow, currentUserId: string): ConversationData {
    return {
        id: row.id,
        participants: row.participant_ids,
        jobId: row.job_id || undefined,
        lastMessage: {
            id: '',
            conversationId: row.id,
            senderId: '',
            receiverId: '',
            content: row.last_message_preview || '',
            timestamp: row.last_message_at,
            isRead: row.unread_count === 0,
            type: MessageType.TEXT,
            status: MessageStatus.SENT
        },
        unreadCount: row.unread_count || 0,
        isArchived: false,
        isMuted: false,
        status: ConversationStatus.ACTIVE,
        contactSharingStatus: ContactSharingStatus.NOT_REQUESTED,
        priority: ConversationPriority.NORMAL,
        createdAt: row.created_at,
        updatedAt: row.last_message_at
    };
}

function mapMessage(row: MessageRow, currentUserId: string): MessageData {
    const otherParticipantId = ''; // Will be filled from conversation data
    const isRead = row.read_by.includes(currentUserId);

    return {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        receiverId: otherParticipantId,
        content: row.content,
        timestamp: row.sent_at,
        isRead,
        type: row.message_type as MessageType,
        status: isRead ? MessageStatus.READ : MessageStatus.SENT,
        attachments: row.attachments || [],
        isEdited: !!row.edited_at,
        editedAt: row.edited_at || undefined
    };
}

export class CommunicationService {
    private realtimeChannels: Map<string, RealtimeChannel> = new Map();

    /**
     * Create a new conversation or get existing one
     */
    async createConversation(participantIds: string[], jobId?: string): Promise<{ conversationId: string }> {
        try {
            const { data, error } = await supabase.rpc('create_conversation', {
                participant_ids: participantIds,
                job_id: jobId || null
            });

            if (error) throw mapError(error);

            return { conversationId: data as string };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Send a message in a conversation
     */
    async sendMessage(
        conversationId: string,
        content: string,
        messageType: MessageType = MessageType.TEXT,
        attachments: any[] = []
    ): Promise<{ messageId: string }> {
        try {
            const { data, error } = await supabase.rpc('send_message', {
                conversation_id: conversationId,
                content,
                message_type: messageType,
                attachments: attachments || []
            });

            if (error) throw mapError(error);

            return { messageId: data as string };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Mark messages as read
     */
    async markMessagesRead(conversationId: string, upToMessageId?: string): Promise<{ success: boolean }> {
        try {
            const { data, error } = await supabase.rpc('mark_messages_read', {
                conversation_id: conversationId,
                up_to_message_id: upToMessageId || null
            });

            if (error) throw mapError(error);

            return { success: data as boolean };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Get user's conversations
     */
    async getConversations(limit: number = 50, offset: number = 0): Promise<ConversationListResponse> {
        try {
            const currentUserId = await getCurrentUserId();

            const { data, error } = await supabase.rpc('get_conversations', {
                limit_count: limit,
                offset_count: offset
            });

            if (error) throw mapError(error);

            const conversations = (data as ConversationRow[]).map(row =>
                mapConversation(row, currentUserId)
            );

            return {
                conversations,
                totalCount: conversations.length,
                hasMore: conversations.length === limit
            };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Get messages from a conversation
     */
    async getMessages(
        conversationId: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<MessageListResponse> {
        try {
            const currentUserId = await getCurrentUserId();

            const { data, error } = await supabase.rpc('get_messages', {
                conversation_id: conversationId,
                limit_count: limit,
                offset_count: offset
            });

            if (error) throw mapError(error);

            const messages = (data as MessageRow[]).map(row =>
                mapMessage(row, currentUserId)
            );

            return {
                messages: messages.reverse(), // Reverse to show oldest first
                conversationId,
                hasMore: messages.length === limit
            };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Search messages
     */
    async searchMessages(query: string, conversationId?: string): Promise<MessageData[]> {
        try {
            const currentUserId = await getCurrentUserId();

            const { data, error } = await supabase.rpc('search_messages', {
                query,
                conversation_id: conversationId || null
            });

            if (error) throw mapError(error);

            return (data as MessageRow[]).map(row => mapMessage(row, currentUserId));
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Request to share contact information
     */
    async requestContactShare(toUserId: string, conversationId: string): Promise<{ requestId: string }> {
        try {
            const { data, error } = await supabase.rpc('request_contact_share', {
                to_user_id: toUserId,
                conversation_id: conversationId
            });

            if (error) throw mapError(error);

            return { requestId: data as string };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Respond to a contact share request
     */
    async respondToContactShare(requestId: string, approved: boolean): Promise<ContactSharingResponse> {
        try {
            const { data, error } = await supabase.rpc('respond_to_contact_share', {
                request_id: requestId,
                approved
            });

            if (error) throw mapError(error);

            const contactInfo = data as any;

            if (approved && contactInfo) {
                return {
                    success: true,
                    sharedContact: {
                        userId: requestId,
                        name: contactInfo.full_name || '',
                        phone: contactInfo.phone || '',
                        email: contactInfo.email || ''
                    },
                    message: 'Contact information shared successfully'
                };
            }

            return {
                success: true,
                message: approved ? 'Contact shared' : 'Request declined'
            };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Archive a conversation
     */
    async archiveConversation(conversationId: string): Promise<{ success: boolean }> {
        try {
            const { data, error } = await supabase.rpc('archive_conversation', {
                conversation_id: conversationId
            });

            if (error) throw mapError(error);

            return { success: data as boolean };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Mute/unmute a conversation
     */
    async muteConversation(conversationId: string, muted: boolean): Promise<{ success: boolean }> {
        try {
            const { data, error } = await supabase.rpc('mute_conversation', {
                conversation_id: conversationId,
                muted
            });

            if (error) throw mapError(error);

            return { success: data as boolean };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Delete a message (soft delete)
     */
    async deleteMessage(messageId: string): Promise<{ success: boolean }> {
        try {
            const { data, error } = await supabase.rpc('delete_message', {
                message_id: messageId
            });

            if (error) throw mapError(error);

            return { success: data as boolean };
        } catch (error) {
            throw mapError(error);
        }
    }

    /**
     * Subscribe to new messages in a conversation (real-time)
     */
    subscribeToMessages(
        conversationId: string,
        onMessage: (message: MessageData) => void
    ): () => void {
        const channelName = `conversation:${conversationId}`;

        // Remove existing channel if any
        this.unsubscribeFromMessages(conversationId);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                async (payload) => {
                    const currentUserId = await getCurrentUserId();
                    const message = mapMessage(payload.new as MessageRow, currentUserId);
                    onMessage(message);
                }
            )
            .subscribe();

        this.realtimeChannels.set(conversationId, channel);

        // Return unsubscribe function
        return () => this.unsubscribeFromMessages(conversationId);
    }

    /**
     * Unsubscribe from conversation messages
     */
    unsubscribeFromMessages(conversationId: string): void {
        const channel = this.realtimeChannels.get(conversationId);
        if (channel) {
            supabase.removeChannel(channel);
            this.realtimeChannels.delete(conversationId);
        }
    }

    /**
     * Subscribe to all conversations (for conversation list updates)
     */
    subscribeToConversations(
        onConversationUpdate: (conversation: ConversationData) => void
    ): () => void {
        const channel = supabase
            .channel('conversations:all')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations'
                },
                async (payload) => {
                    const currentUserId = await getCurrentUserId();

                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const conversation = mapConversation(payload.new as ConversationRow, currentUserId);
                        onConversationUpdate(conversation);
                    }
                }
            )
            .subscribe();

        this.realtimeChannels.set('conversations:all', channel);

        return () => {
            supabase.removeChannel(channel);
            this.realtimeChannels.delete('conversations:all');
        };
    }

    /**
     * Subscribe to typing indicators (using presence)
     */
    subscribeToTyping(
        conversationId: string,
        onTypingChange: (userId: string, isTyping: boolean) => void
    ): () => void {
        const channelName = `typing:${conversationId}`;

        const channel = supabase
            .channel(channelName)
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                Object.entries(state).forEach(([userId, presence]: [string, any]) => {
                    const isTyping = presence[0]?.typing || false;
                    onTypingChange(userId, isTyping);
                });
            })
            .subscribe();

        this.realtimeChannels.set(channelName, channel);

        return () => {
            supabase.removeChannel(channel);
            this.realtimeChannels.delete(channelName);
        };
    }

    /**
     * Send typing indicator
     */
    async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
        const channelName = `typing:${conversationId}`;
        const channel = this.realtimeChannels.get(channelName);

        if (channel) {
            const currentUserId = await getCurrentUserId();
            await channel.track({
                user_id: currentUserId,
                typing: isTyping,
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * Cleanup all subscriptions
     */
    cleanup(): void {
        this.realtimeChannels.forEach((channel) => {
            supabase.removeChannel(channel);
        });
        this.realtimeChannels.clear();
    }
}

// Export singleton instance
export const communicationService = new CommunicationService();

// Export query keys for React Query
export const communicationQueries = {
    conversations: () => ['conversations'],
    conversationMessages: (conversationId: string) => ['messages', conversationId],
    searchMessages: (query: string) => ['searchMessages', query]
};
