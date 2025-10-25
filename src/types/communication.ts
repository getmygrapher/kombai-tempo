// Communication system enums
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent', 
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
  DELETED = 'deleted'
}

export enum ContactSharingStatus {
  NOT_REQUESTED = 'not_requested',
  REQUESTED = 'requested',
  PENDING_CONSENT = 'pending_consent',
  SHARED = 'shared',
  DECLINED = 'declined',
  REVOKED = 'revoked'
}

export enum TypingStatus {
  NOT_TYPING = 'not_typing',
  TYPING = 'typing',
  STOPPED_TYPING = 'stopped_typing'
}

export enum OnlineStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  AWAY = 'away',
  BUSY = 'busy'
}

export enum MessageReactionType {
  LIKE = 'like',
  LOVE = 'love',
  LAUGH = 'laugh',
  WOW = 'wow',
  SAD = 'sad',
  ANGRY = 'angry'
}

export enum NotificationSound {
  DEFAULT = 'default',
  CHIME = 'chime',
  BELL = 'bell',
  PING = 'ping',
  NONE = 'none'
}

export enum MessageFilterType {
  ALL = 'all',
  UNREAD = 'unread',
  JOB_RELATED = 'job_related',
  BOOKING_RELATED = 'booking_related',
  CONTACT_REQUESTS = 'contact_requests',
  ARCHIVED = 'archived'
}

export enum ConversationPriority {
  LOW = 'low',
  NORMAL = 'normal', 
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum MessageTemplateCategory {
  JOB_INQUIRY = 'job_inquiry',
  BOOKING_NEGOTIATION = 'booking_negotiation',
  FOLLOW_UP = 'follow_up',
  PORTFOLIO_SHARE = 'portfolio_share',
  AVAILABILITY_CHECK = 'availability_check'
}

// Communication system type definitions

// Props types (data passed to components)
export interface ChatWindowProps {
  conversationId: string;
  onSendMessage: (content: string, type: MessageType) => void;
  onContactShare: (userId: string) => void;
  onBlockUser: (userId: string) => void;
}

export interface ConversationData {
  id: string;
  participants: string[];
  jobId?: string;
  lastMessage: MessageData;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  status: ConversationStatus;
  contactSharingStatus: ContactSharingStatus;
  priority: ConversationPriority;
  createdAt: string;
  updatedAt: string;
}

export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: MessageType;
  status: MessageStatus;
  jobId?: string;
  attachments?: MessageAttachment[];
  replyToId?: string;
  isEdited?: boolean;
  editedAt?: string;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  type: 'voice' | 'image' | 'document';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  duration?: number; // for voice messages
}

export interface MessageReaction {
  emoji: MessageReactionType;
  userId: string;
  timestamp: string;
}

export interface MessageTemplate {
  id: string;
  category: MessageTemplateCategory;
  title: string;
  content: string;
  variables?: string[];
}

// Store types (global state data)
export interface CommunicationStore {
  currentConversationId: string | null;
  conversations: ConversationData[];
  messages: Record<string, MessageData[]>;
  activeTypingUsers: string[];
  onlineUsers: string[];
  messageFilter: MessageFilterType;
  searchQuery: string;
  unreadMessageCount: number;
  notificationSound: NotificationSound;
  isNotificationMuted: boolean;
  lastSeenTimestamps: Record<string, string>;
  contactSharedUsers: string[];
  blockedUsers: string[];
}

// Query types (API response data)
export interface ConversationListResponse {
  conversations: ConversationData[];
  totalCount: number;
  hasMore: boolean;
}

export interface MessageListResponse {
  messages: MessageData[];
  conversationId: string;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ContactSharingResponse {
  success: boolean;
  sharedContact?: {
    userId: string;
    name: string;
    phone: string;
    email: string;
  };
  message: string;
}

export interface NotificationPreferencesData {
  messageNotifications: boolean;
  jobInquiries: boolean;
  bookingUpdates: boolean;
  contactRequests: boolean;
  readReceipts: boolean;
  typingIndicators: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationSound: NotificationSound;
}

// Import from existing types
import { MessageType } from './enums';