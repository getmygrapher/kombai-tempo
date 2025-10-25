// Enhanced theme for homepage components

// Extend the existing theme with homepage-specific styling
const homepageTheme = {
  // Search component styling
  search: {
    bar: {
      borderRadius: '24px',
      backgroundColor: '#F8FAFC',
      border: '1px solid #E2E8F0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      '&:focus-within': {
        border: '1px solid #6366F1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
      }
    },
    suggestions: {
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #E2E8F0'
    }
  },
  
  // Category card styling
  category: {
    card: {
      borderRadius: '16px',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
      }
    },
    icon: {
      size: 48,
      backgroundColor: '#F1F5F9',
      borderRadius: '12px',
      padding: '12px'
    }
  },
  
  // Featured section styling
  featured: {
    carousel: {
      gap: '16px',
      padding: '8px'
    },
    card: {
      minWidth: '280px',
      borderRadius: '16px',
      overflow: 'hidden'
    }
  },
  
  // Content display styling
  content: {
    toggle: {
      backgroundColor: '#F1F5F9',
      borderRadius: '12px',
      padding: '4px'
    },
    feed: {
      gap: '16px',
      padding: '16px 0'
    }
  },
  
  // City card styling
  city: {
    card: {
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#FFFFFF',
      minHeight: '120px'
    }
  },
  
  // Filter panel styling
  filter: {
    panel: {
      borderRadius: '16px 16px 0 0',
      padding: '24px'
    },
    chip: {
      borderRadius: '20px',
      margin: '4px'
    }
  }
};

export default homepageTheme;