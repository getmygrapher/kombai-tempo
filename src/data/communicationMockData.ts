import { 
  MessageStatus, 
  ConversationStatus, 
  ContactSharingStatus, 
  OnlineStatus,
  TypingStatus,
  MessageReactionType,
  NotificationSound,
  MessageFilterType,
  ConversationPriority,
  MessageTemplateCategory
} from '../types/communication';
import { MessageType } from '../types/enums';

// Data for global state store
export const mockStore = {
  currentConversationId: 'conv_1' as const,
  activeTypingUsers: ['prof_1'] as const,
  onlineUsers: ['prof_1', 'prof_2'] as const,
  notificationSound: NotificationSound.DEFAULT as const,
  messageFilter: MessageFilterType.ALL as const,
  unreadMessageCount: 3,
  isNotificationMuted: false,
  lastSeenTimestamps: {
    'prof_1': '2024-01-15T10:30:00Z',
    'prof_2': '2024-01-15T09:45:00Z'
  } as const
};

// Data returned by API queries  
export const mockQuery = {
  conversations: [
    {
      id: 'conv_1',
      participants: ['user_123', 'prof_1'],
      jobId: 'job_1',
      lastMessage: {
        id: 'msg_1',
        content: 'Hi! I saw your job post for the wedding photography. I have extensive experience with Kerala weddings.',
        timestamp: '2024-01-15T10:30:00Z',
        senderId: 'prof_1',
        receiverId: 'user_123',
        conversationId: 'conv_1',
        isRead: false,
        type: MessageType.JOB_INQUIRY,
        status: MessageStatus.DELIVERED as const
      },
      unreadCount: 2,
      isArchived: false,
      isMuted: false,
      status: ConversationStatus.ACTIVE as const,
      contactSharingStatus: ContactSharingStatus.NOT_REQUESTED as const,
      priority: ConversationPriority.HIGH as const,
      createdAt: '2024-01-14T16:45:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'conv_2', 
      participants: ['user_123', 'prof_2'],
      lastMessage: {
        id: 'msg_2',
        content: 'Thank you for considering me for your project. When would be a good time to discuss the details?',
        timestamp: '2024-01-14T18:20:00Z',
        senderId: 'prof_2',
        receiverId: 'user_123',
        conversationId: 'conv_2',
        isRead: true,
        type: MessageType.TEXT,
        status: MessageStatus.READ as const
      },
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
      status: ConversationStatus.ACTIVE as const,
      contactSharingStatus: ContactSharingStatus.SHARED as const,
      priority: ConversationPriority.NORMAL as const,
      createdAt: '2024-01-14T17:30:00Z',
      updatedAt: '2024-01-14T18:20:00Z'
    },
    {
      id: 'conv_3',
      participants: ['user_123', 'prof_3'],
      lastMessage: {
        id: 'msg_3',
        content: 'I would love to work on your commercial photography project. My portfolio includes similar work.',
        timestamp: '2024-01-13T14:15:00Z',
        senderId: 'prof_3',
        receiverId: 'user_123',
        conversationId: 'conv_3',
        isRead: true,
        type: MessageType.JOB_INQUIRY,
        status: MessageStatus.READ as const
      },
      unreadCount: 0,
      isArchived: false,
      isMuted: false,
      status: ConversationStatus.ACTIVE as const,
      contactSharingStatus: ContactSharingStatus.REQUESTED as const,
      priority: ConversationPriority.NORMAL as const,
      createdAt: '2024-01-13T14:00:00Z',
      updatedAt: '2024-01-13T14:15:00Z'
    }
  ],
  messages: {
    'conv_1': [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: 'prof_1',
        receiverId: 'user_123',
        content: 'Hi! I saw your job post for the wedding photography. I have extensive experience with Kerala weddings.',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false,
        type: MessageType.JOB_INQUIRY,
        status: MessageStatus.DELIVERED,
        jobId: 'job_1'
      },
      {
        id: 'msg_1_reply',
        conversationId: 'conv_1',
        senderId: 'user_123',
        receiverId: 'prof_1',
        content: 'Thank you for your interest! I would love to see some of your Kerala wedding work.',
        timestamp: '2024-01-15T10:45:00Z',
        isRead: true,
        type: MessageType.TEXT,
        status: MessageStatus.READ,
        replyToId: 'msg_1'
      },
      {
        id: 'msg_1_portfolio',
        conversationId: 'conv_1',
        senderId: 'prof_1',
        receiverId: 'user_123',
        content: 'Here are some samples from recent Kerala weddings I\'ve photographed. You can also check my Instagram @kavya_portraits for more work.',
        timestamp: '2024-01-15T11:00:00Z',
        isRead: false,
        type: MessageType.TEXT,
        status: MessageStatus.DELIVERED
      }
    ],
    'conv_2': [
      {
        id: 'msg_2',
        conversationId: 'conv_2',
        senderId: 'prof_2',
        receiverId: 'user_123',
        content: 'Thank you for considering me for your project. When would be a good time to discuss the details?',
        timestamp: '2024-01-14T18:20:00Z',
        isRead: true,
        type: MessageType.TEXT,
        status: MessageStatus.READ
      },
      {
        id: 'msg_2_reply',
        conversationId: 'conv_2',
        senderId: 'user_123',
        receiverId: 'prof_2',
        content: 'I\'m available for a call tomorrow evening. What\'s your rate for a full day commercial shoot?',
        timestamp: '2024-01-14T19:30:00Z',
        isRead: true,
        type: MessageType.TEXT,
        status: MessageStatus.READ
      },
      {
        id: 'msg_2_rate',
        conversationId: 'conv_2',
        senderId: 'prof_2',
        receiverId: 'user_123',
        content: 'My rate for commercial photography is ₹15,000 per day including basic editing. We can discuss additional requirements.',
        timestamp: '2024-01-14T20:00:00Z',
        isRead: true,
        type: MessageType.BOOKING_CONFIRMATION,
        status: MessageStatus.READ
      }
    ]
  },
  messageTemplates: [
    {
      id: 'template_1',
      category: MessageTemplateCategory.JOB_INQUIRY as const,
      title: 'Express Interest',
      content: 'Hi! I\'m interested in your {jobTitle} project. I have {experienceYears} years of experience in {specialization} and would love to discuss this opportunity with you.',
      variables: ['jobTitle', 'experienceYears', 'specialization']
    },
    {
      id: 'template_2', 
      category: MessageTemplateCategory.BOOKING_NEGOTIATION as const,
      title: 'Rate Discussion',
      content: 'Thank you for considering me for this project. Based on the requirements, my rate would be ₹{proposedRate}. I\'m open to discussing the details further.',
      variables: ['proposedRate']
    },
    {
      id: 'template_3',
      category: MessageTemplateCategory.AVAILABILITY_CHECK as const,
      title: 'Check Availability',
      content: 'I\'m available on {availableDate} for your {jobType} project. Would this date work for your schedule?',
      variables: ['availableDate', 'jobType']
    },
    {
      id: 'template_4',
      category: MessageTemplateCategory.PORTFOLIO_SHARE as const,
      title: 'Share Portfolio',
      content: 'Here are some samples of my {workType} work that might be relevant to your project. You can also check my Instagram {instagramHandle} for more examples.',
      variables: ['workType', 'instagramHandle']
    },
    {
      id: 'template_5',
      category: MessageTemplateCategory.FOLLOW_UP as const,
      title: 'Follow Up',
      content: 'Hi! I wanted to follow up on the {jobTitle} opportunity we discussed. Please let me know if you need any additional information from my end.',
      variables: ['jobTitle']
    }
  ],
  userOnlineStatus: {
    'prof_1': OnlineStatus.ONLINE as const,
    'prof_2': OnlineStatus.OFFLINE as const,
    'prof_3': OnlineStatus.AWAY as const,
    'user_123': OnlineStatus.ONLINE as const
  },
  professionals: [
    {
      id: 'prof_1',
      name: 'Kavya Krishnan',
      profilePhoto: 'https://i.pravatar.cc/150?img=5',
      professionalType: 'Portrait Photographer',
      phone: '+919876543201',
      email: 'kavya@example.com'
    },
    {
      id: 'prof_2', 
      name: 'Aditya Menon',
      profilePhoto: 'https://i.pravatar.cc/150?img=8',
      professionalType: 'Wedding Videographer',
      phone: '+919876543202',
      email: 'aditya@example.com'
    },
    {
      id: 'prof_3',
      name: 'Priya Nair',
      profilePhoto: 'https://i.pravatar.cc/150?img=3',
      professionalType: 'Commercial Photographer',
      phone: '+919876543203',
      email: 'priya@example.com'
    }
  ],
  contactSharedUsers: ['prof_2'],
  blockedUsers: [] as string[],
  notificationPreferences: {
    messageNotifications: true,
    jobInquiries: true,
    bookingUpdates: true,
    contactRequests: true,
    readReceipts: true,
    typingIndicators: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationSound: NotificationSound.DEFAULT
  }
};

// Data passed as props to the root component
export const mockRootProps = {
  initialConversationId: 'conv_1' as const,
  enableRealTimeUpdates: true,
  maxMessageLength: 1000,
  allowVoiceMessages: true,
  allowContactSharing: true,
  moderationEnabled: true
};