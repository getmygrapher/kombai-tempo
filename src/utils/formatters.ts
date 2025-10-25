import { UrgencyLevel, JobStatus, ApplicationStatus, BudgetType } from '../types/enums';

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatJobBudget = (min: number, max: number): string => {
  return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
};

export const formatJobDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatJobTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatJobDateTime = (date: Date): string => {
  return `${formatJobDate(date)} at ${formatJobTime(date)}`;
};

export const formatUrgencyLevel = (urgency: UrgencyLevel): string => {
  switch (urgency) {
    case UrgencyLevel.NORMAL:
      return 'Normal';
    case UrgencyLevel.URGENT:
      return 'Urgent';
    case UrgencyLevel.EMERGENCY:
      return 'Emergency';
    default:
      return 'Normal';
  }
};

export const formatJobStatus = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.DRAFT:
      return 'Draft';
    case JobStatus.ACTIVE:
      return 'Active';
    case JobStatus.CLOSED:
      return 'Closed';
    case JobStatus.EXPIRED:
      return 'Expired';
    case JobStatus.COMPLETED:
      return 'Completed';
    default:
      return 'Unknown';
  }
};

export const formatApplicationStatus = (status: ApplicationStatus): string => {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 'Pending';
    case ApplicationStatus.UNDER_REVIEW:
      return 'Under Review';
    case ApplicationStatus.SHORTLISTED:
      return 'Shortlisted';
    case ApplicationStatus.REJECTED:
      return 'Rejected';
    case ApplicationStatus.HIRED:
      return 'Hired';
    case ApplicationStatus.WITHDRAWN:
      return 'Withdrawn';
    default:
      return 'Unknown';
  }
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    return `${diffInDays}d ago`;
  }
};

export const formatBudgetType = (type: BudgetType): string => {
  switch (type) {
    case BudgetType.FIXED:
      return 'Fixed Price';
    case BudgetType.HOURLY:
      return 'Per Hour';
    case BudgetType.PROJECT:
      return 'Per Project';
    default:
      return 'Fixed Price';
  }
};

// New: Formats numeric distances into a human-friendly string (e.g., "2.1 km" or "850 m")
export const formatDistance = (distance: number): string => {
  if (distance == null || Number.isNaN(distance)) return '';

  if (distance < 1 && distance >= 0) {
    // Show meters for sub-kilometer distances
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  }

  // For >= 1km, show one decimal for small values, whole number for larger
  const formatted = distance >= 10 ? distance.toFixed(0) : distance.toFixed(1);
  return `${formatted} km`;
};

// Formats numeric rating to one decimal place (e.g., 4.8/5)
export const formatRating = (rating: number): string => {
  if (rating == null || Number.isNaN(rating)) return '';
  const clamped = Math.max(0, Math.min(5, rating));
  return `${clamped.toFixed(1)}/5`;
};