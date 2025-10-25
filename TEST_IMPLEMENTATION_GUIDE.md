# Authentication & Onboarding Test Implementation Guide

## Quick Start Testing Commands

### Run All Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

### Test Specific Components
```bash
# Authentication tests only
npm run test -- --testPathPattern=auth

# Onboarding tests only
npm run test -- --testPathPattern=onboarding

# Supabase integration tests
npm run test -- --testPathPattern=supabase
```

## Component Test Examples

### 1. Authentication Screen Tests

```typescript
// src/components/auth/__tests__/AuthenticationScreen.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationScreen } from '../AuthenticationScreen';
import { supabaseAuth } from '../../services/auth/supabaseAuth';
import { analyticsService } from '../../utils/analyticsEvents';

// Mock dependencies
jest.mock('../../services/auth/supabaseAuth');
jest.mock('../../utils/analyticsEvents');

describe('AuthenticationScreen', () => {
  const mockOnAuthSuccess = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders authentication options', () => {
    render(<AuthenticationScreen onAuthSuccess={mockOnAuthSuccess} />);
    
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Email')).toBeInTheDocument();
  });

  test('handles Google authentication successfully', async () => {
    const user = userEvent.setup();
    render(<AuthenticationScreen onAuthSuccess={mockOnAuthSuccess} />);
    
    const googleButton = screen.getByText('Sign in with Google');
    await user.click(googleButton);
    
    expect(supabaseAuth.signInWithGoogle).toHaveBeenCalled();
    expect(analyticsService.trackAuthMethod).toHaveBeenCalledWith('google');
  });

  test('handles email authentication form submission', async () => {
    const user = userEvent.setup();
    const mockSession = {
      user: { id: '123', email: 'test@example.com' },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_at: Date.now() / 1000 + 3600
    };
    
    (supabaseAuth.signInWithEmail as jest.Mock).mockResolvedValue({
      session: mockSession
    });
    
    render(<AuthenticationScreen onAuthSuccess={mockOnAuthSuccess} />);
    
    // Switch to email auth
    const emailButton = screen.getByText('Continue with Email');
    await user.click(emailButton);
    
    // Fill form
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    
    // Submit form
    const submitButton = screen.getByText('Sign In');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(supabaseAuth.signInWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
    });
  });

  test('displays error message on authentication failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    
    (supabaseAuth.signInWithEmail as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );
    
    render(<AuthenticationScreen onAuthSuccess={mockOnAuthSuccess} />);
    
    // Switch to email auth and submit
    await user.click(screen.getByText('Continue with Email'));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles sign-up flow correctly', async () => {
    const user = userEvent.setup();
    
    render(<AuthenticationScreen onAuthSuccess={mockOnAuthSuccess} />);
    
    // Switch to email auth
    await user.click(screen.getByText('Continue with Email'));
    
    // Switch to sign up
    await user.click(screen.getByText('Switch to Sign Up'));
    
    // Fill form
    await user.type(screen.getByLabelText('Email'), 'newuser@example.com');
    await user.type(screen.getByLabelText('Password'), 'newpassword123');
    
    // Submit form
    await user.click(screen.getByText('Sign Up'));
    
    await waitFor(() => {
      expect(supabaseAuth.signUpWithEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        'newpassword123'
      );
      expect(screen.getByText('Check your email to verify your account.')).toBeInTheDocument();
    });
  });
});
```

### 2. Onboarding Flow Tests

```typescript
// src/components/onboarding/__tests__/OnboardingFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingFlow } from '../OnboardingFlow';
import { onboardingService } from '../../services/onboardingService';
import { useOnboardingStore } from '../../store/onboardingStore';

jest.mock('../../services/onboardingService');
jest.mock('../../store/onboardingStore');

describe('OnboardingFlow', () => {
  const mockOnRegistrationComplete = jest.fn();
  const mockStore = {
    currentStep: 'CATEGORY_SELECTION',
    completedSteps: [],
    registrationData: {
      selectedCategory: null,
      selectedType: null,
      location: {},
      basicProfile: {},
      professionalDetails: {},
      availability: {}
    },
    setCurrentStep: jest.fn(),
    addCompletedStep: jest.fn(),
    updateRegistrationData: jest.fn(),
    setRegistrationStatus: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useOnboardingStore as jest.Mock).mockReturnValue(mockStore);
  });

  test('renders category selection step', () => {
    render(<OnboardingFlow onRegistrationComplete={mockOnRegistrationComplete} />);
    
    expect(screen.getByText('What type of professional are you?')).toBeInTheDocument();
    expect(screen.getByText('Photography')).toBeInTheDocument();
    expect(screen.getByText('Videography')).toBeInTheDocument();
  });

  test('handles category selection and progression', async () => {
    const user = userEvent.setup();
    (onboardingService.upsertProfessionalProfile as jest.Mock).mockResolvedValue(undefined);
    (onboardingService.completeStep as jest.Mock).mockResolvedValue(undefined);
    
    render(<OnboardingFlow onRegistrationComplete={mockOnRegistrationComplete} />);
    
    const photographyButton = screen.getByText('Photography');
    await user.click(photographyButton);
    
    await waitFor(() => {
      expect(onboardingService.upsertProfessionalProfile).toHaveBeenCalledWith({
        selectedCategory: 'Photography'
      });
      expect(mockStore.addCompletedStep).toHaveBeenCalledWith('CATEGORY_SELECTION');
    });
  });

  test('handles registration completion successfully', async () => {
    const user = userEvent.setup();
    mockStore.currentStep = 'REGISTRATION_COMPLETE';
    mockStore.registrationData = {
      basicProfile: { fullName: 'Test User', profilePhotoUrl: 'photo.jpg' },
      email: 'test@example.com',
      selectedCategory: 'Photography',
      selectedType: 'Wedding Photographer',
      location: { city: 'Mumbai', state: 'Maharashtra' },
      professionalDetails: { experienceLevel: 'Expert' },
      availability: { defaultSchedule: {} }
    };
    
    (onboardingService.getCurrentUserId as jest.Mock).mockResolvedValue('user_123');
    (onboardingService.completeStep as jest.Mock).mockResolvedValue(undefined);
    
    render(<OnboardingFlow onRegistrationComplete={mockOnRegistrationComplete} />);
    
    const completeButton = screen.getByText('Complete Registration');
    await user.click(completeButton);
    
    await waitFor(() => {
      expect(mockOnRegistrationComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user_123',
          name: 'Test User',
          email: 'test@example.com',
          professionalCategory: 'Photography'
        })
      );
    });
  });
});
```

### 3. Supabase Service Tests

```typescript
// src/services/__tests__/onboardingService.test.ts
import { onboardingService } from '../onboardingService';
import { supabase } from '../supabaseClient';

jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      upsert: jest.fn(),
      select: jest.fn()
    })),
    rpc: jest.fn()
  }
}));

describe('OnboardingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getCurrentUserId returns user ID when authenticated', async () => {
    const mockUser = { id: 'user_123' };
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    const userId = await onboardingService.getCurrentUserId();
    
    expect(userId).toBe('user_123');
    expect(supabase.auth.getUser).toHaveBeenCalled();
  });

  test('getCurrentUserId throws error when not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null
    });
    
    await expect(onboardingService.getCurrentUserId()).rejects.toThrow('No authenticated user');
  });

  test('ensureProfileExists calls RPC function', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: null });
    
    await onboardingService.ensureProfileExists();
    
    expect(supabase.rpc).toHaveBeenCalledWith('ensure_profile_exists');
  });

  test('upsertBasicProfile updates profile with provided data', async () => {
    const mockUserId = 'user_123';
    const profileData = {
      fullName: 'Test User',
      avatarUrl: 'avatar.jpg',
      phone: '+919999999999'
    };
    
    jest.spyOn(onboardingService, 'getCurrentUserId').mockResolvedValue(mockUserId);
    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null })
    });
    
    await onboardingService.upsertBasicProfile(profileData);
    
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.from('profiles').upsert).toHaveBeenCalledWith(
      {
        id: mockUserId,
        full_name: 'Test User',
        avatar_url: 'avatar.jpg',
        phone: '+919999999999'
      },
      { onConflict: 'id' }
    );
  });

  test('handles database errors appropriately', async () => {
    const dbError = { message: 'Database connection failed' };
    (supabase.rpc as jest.Mock).mockResolvedValue({ error: dbError });
    
    await expect(onboardingService.ensureProfileExists()).rejects.toThrow('Database connection failed');
  });
});
```

### 4. Integration Test Examples

```typescript
// src/__tests__/integration/auth-onboarding.integration.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../../App';
import { supabase } from '../../services/supabaseClient';

// Mock Supabase
jest.mock('../../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ subscription: { unsubscribe: jest.fn() } }))
    },
    from: jest.fn(() => ({
      upsert: jest.fn(),
      select: jest.fn(() => ({ single: jest.fn() })),
      eq: jest.fn()
    })),
    rpc: jest.fn()
  }
}));

describe('Authentication & Onboarding Integration', () => {
  const user = userEvent.setup();
  
  test('complete user journey from authentication to onboarding completion', async () => {
    // Mock successful authentication
    const mockSession = {
      user: {
        id: 'user_123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      expires_at: Date.now() / 1000 + 3600
    };
    
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: mockSession }
    });
    
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: mockSession }
    });
    
    // Mock onboarding status (incomplete)
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: { status: 'in_progress', current_step: 'CATEGORY_SELECTION' }
    });
    
    // Mock database operations
    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn(() => ({ single: jest.fn().mockResolvedValue({ data: {} }) }))
    });
    
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <App />
      </MemoryRouter>
    );
    
    // Step 1: Authenticate
    await user.click(screen.getByText('Continue with Email'));
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByText('Sign In'));
    
    // Wait for redirect to onboarding
    await waitFor(() => {
      expect(screen.getByText('What type of professional are you?')).toBeInTheDocument();
    });
    
    // Step 2: Select category
    await user.click(screen.getByText('Photography'));
    
    // Step 3: Select type
    await waitFor(() => {
      expect(screen.getByText('What kind of photography?')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Wedding Photography'));
    
    // Verify data was saved
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('professional_profiles');
      expect(supabase.rpc).toHaveBeenCalledWith('complete_step');
    });
  });

  test('handles authentication error and allows retry', async () => {
    const authError = { message: 'Invalid login credentials' };
    
    (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(authError);
    
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <App />
      </MemoryRouter>
    );
    
    // Attempt login with invalid credentials
    await user.click(screen.getByText('Continue with Email'));
    await user.type(screen.getByLabelText('Email'), 'wrong@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByText('Sign In'));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
    });
    
    // Should allow retry
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
```

## Manual Testing Checklist

### Authentication Flow
- [ ] Email sign-up with valid credentials
- [ ] Email verification process
- [ ] Email login with valid credentials
- [ ] Google OAuth sign-in
- [ ] Password reset functionality
- [ ] Session persistence across browser restart
- [ ] Logout functionality
- [ ] Protected route access control

### Onboarding Flow
- [ ] Category selection and progression
- [ ] Professional type selection
- [ ] Location setup with GPS/manual entry
- [ ] Profile photo upload
- [ ] Professional details form
- [ ] Availability configuration
- [ ] Registration completion
- [ ] Draft saving and resumption
- [ ] Back navigation functionality

### Error Scenarios
- [ ] Invalid email format
- [ ] Weak password validation
- [ ] Network connectivity issues
- [ ] Database connection failures
- [ ] File upload size limits
- [ ] Session expiration handling
- [ ] Concurrent update conflicts

### Security Validation
- [ ] Input sanitization verification
- [ ] XSS prevention testing
- [ ] SQL injection prevention
- [ ] RLS policy enforcement
- [ ] Secure token storage
- [ ] HTTPS enforcement

## Performance Testing

### Load Testing Script
```javascript
// performance/auth-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.1'],      // Error rate under 10%
  },
};

export default function() {
  // Test authentication endpoint
  let authPayload = JSON.stringify({
    email: `test${__VU}@example.com`,
    password: 'TestPassword123!'
  });
  
  let authResponse = http.post(
    'https://your-api.com/auth/v1/token?grant_type=password',
    authPayload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(authResponse, {
    'authentication successful': (r) => r.status === 200,
    'response time acceptable': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
```

### Database Query Performance
```sql
-- Analyze onboarding query performance
EXPLAIN ANALYZE
SELECT * FROM professional_profiles 
WHERE user_id = 'user_123';

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats 
WHERE tablename IN ('profiles', 'professional_profiles', 'onboarding_progress')
ORDER BY tablename, attname;

-- Monitor connection usage
SELECT count(*), state 
FROM pg_stat_activity 
GROUP BY state;
```

## Continuous Integration Setup

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
      env:
        VITE_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

This implementation guide provides practical, executable test cases that validate all aspects of the authentication and onboarding system. The tests can be run individually or as part of a comprehensive test suite to ensure system reliability and user satisfaction.