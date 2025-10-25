// Profile Management theme extensions
const profileManagementTheme = {
  // Profile editing colors
  profileEdit: {
    sectionBorder: '#E5E7EB',
    sectionBackground: '#FAFAFA',
    activeTab: '#6366F1',
    inactiveTab: '#9CA3AF',
    validationError: '#EF4444',
    validationSuccess: '#10B981'
  },
  
  // Equipment management colors
  equipment: {
    categoryColors: {
      cameras: '#3B82F6',
      lenses: '#8B5CF6',
      lighting: '#F59E0B',
      supportGear: '#10B981',
      audio: '#EF4444',
      other: '#6B7280'
    },
    conditionColors: {
      new: '#10B981',
      excellent: '#3B82F6',
      good: '#F59E0B',
      fair: '#EF4444'
    }
  },
  
  // Pricing colors
  pricing: {
    rateBackground: '#EFF6FF',
    negotiableChip: '#10B981',
    fixedChip: '#6B7280',
    previewBorder: '#D1D5DB'
  },
  
  // Portfolio colors
  portfolio: {
    uploadArea: '#F3F4F6',
    uploadBorder: '#D1D5DB',
    uploadHover: '#E5E7EB',
    dragActive: '#EFF6FF',
    imageOverlay: 'rgba(0, 0, 0, 0.6)'
  },
  
  // Privacy settings colors
  privacy: {
    visibilityPublic: '#10B981',
    visibilityNetwork: '#F59E0B',
    visibilityPrivate: '#EF4444',
    toggleActive: '#6366F1',
    toggleInactive: '#D1D5DB'
  },
  
  // Analytics colors
  analytics: {
    metricCards: {
      views: '#3B82F6',
      saves: '#8B5CF6',
      contacts: '#10B981',
      completion: '#F59E0B'
    },
    chartColors: ['#6366F1', '#EC4899', '#10B981', '#F59E0B'],
    trendUp: '#10B981',
    trendDown: '#EF4444'
  },
  
  // Verification colors
  verification: {
    verified: '#10B981',
    pending: '#F59E0B',
    notVerified: '#6B7280',
    rejected: '#EF4444',
    statusBackground: {
      verified: '#ECFDF5',
      pending: '#FFFBEB',
      notVerified: '#F9FAFB',
      rejected: '#FEF2F2'
    }
  },
  
  // Component spacing
  spacing: {
    sectionGap: 24,
    cardPadding: 24,
    formFieldGap: 16,
    buttonSpacing: 12,
    chipSpacing: 8
  },
  
  // Component dimensions
  dimensions: {
    avatarSize: 100,
    thumbnailSize: 80,
    portfolioImageSize: 200,
    equipmentCardHeight: 120,
    pricingCardHeight: 140,
    metricCardHeight: 100
  }
};

export default profileManagementTheme;