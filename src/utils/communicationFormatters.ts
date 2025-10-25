import { MessageStatus, OnlineStatus, TypingStatus, ContactSharingStatus } from '../types/communication';

export const formatMessageStatus = (status: MessageStatus): string => {
  switch (status) {
    case MessageStatus.SENDING:
      return 'Sending...';
    case MessageStatus.SENT:
      return 'Sent';
    case MessageStatus.DELIVERED:
      return 'Delivered';
    case MessageStatus.READ:
      return 'Read';
    case MessageStatus.FAILED:
      return 'Failed to send';
    default:
      return 'Unknown';
  }
};

export const formatOnlineStatus = (status: OnlineStatus): string => {
  switch (status) {
    case OnlineStatus.ONLINE:
      return 'Online';
    case OnlineStatus.OFFLINE:
      return 'Offline';
    case OnlineStatus.AWAY:
      return 'Away';
    case OnlineStatus.BUSY:
      return 'Busy';
    default:
      return 'Unknown';
  }
};

export const formatTypingStatus = (userName: string, status: TypingStatus): string => {
  switch (status) {
    case TypingStatus.TYPING:
      return `${userName} is typing...`;
    case TypingStatus.NOT_TYPING:
    case TypingStatus.STOPPED_TYPING:
      return '';
    default:
      return '';
  }
};

export const formatContactSharingStatus = (status: ContactSharingStatus): string => {
  switch (status) {
    case ContactSharingStatus.NOT_REQUESTED:
      return 'Contact not shared';
    case ContactSharingStatus.REQUESTED:
      return 'Contact requested';
    case ContactSharingStatus.PENDING_CONSENT:
      return 'Waiting for consent';
    case ContactSharingStatus.SHARED:
      return 'Contact shared';
    case ContactSharingStatus.DECLINED:
      return 'Contact request declined';
    case ContactSharingStatus.REVOKED:
      return 'Contact access revoked';
    default:
      return 'Unknown status';
  }
};

export const formatLastSeen = (timestamp: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - timestamp.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return timestamp.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};

export const formatUnreadCount = (count: number): string => {
  if (count === 0) return '';
  if (count > 99) return '99+';
  return count.toString();
};

export const formatMessagePreview = (content: string, maxLength: number = 50): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};