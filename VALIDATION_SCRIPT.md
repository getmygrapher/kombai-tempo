# Authentication & Onboarding Validation Script

## Quick Validation Commands

### 1. Environment Setup Check
```bash
# Check environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Verify Supabase connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
supabase.auth.getSession().then(console.log).catch(console.error);
"
```

### 2. Authentication Validation
```bash
# Test authentication endpoints
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Test Google OAuth
open 'https://your-project.supabase.co/auth/v1/authorize?provider=google'
```

### 3. Database Schema Validation
```bash
# Connect to Supabase database
psql 'postgresql://postgres:password@your-project.supabase.co:5432/postgres'

# Check tables exist
\dt public.*

# Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename IN ('profiles', 'professional_profiles', 'onboarding_progress');

# Check indexes
SELECT tablename, indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('profiles', 'professional_profiles', 'onboarding_progress')
ORDER BY tablename, indexname;
```

## Manual Validation Steps

### Step 1: Authentication Flow Validation

1. **Email Registration**
   - Navigate to `/auth`
   - Click "Continue with Email"
   - Enter new email: `testuser$(date +%s)@example.com`
   - Enter password: `TestPassword123!`
   - Click "Sign Up"
   - **Expected**: Email verification sent, success message displayed

2. **Email Verification**
   - Check email inbox
   - Click verification link
   - **Expected**: Redirect to app, user authenticated

3. **Email Login**
   - Navigate to `/auth`
   - Click "Continue with Email"
   - Enter verified email and password
   - Click "Sign In"
   - **Expected**: Successful login, redirect to onboarding

4. **Google Authentication**
   - Navigate to `/auth`
   - Click "Sign in with Google"
   - Complete Google OAuth flow
   - **Expected**: Successful authentication, redirect to onboarding

5. **Session Management**
   - Login successfully
   - Refresh browser
   - **Expected**: User remains authenticated
   - Close and reopen browser
   - **Expected**: User remains authenticated (if remember me selected)

### Step 2: Onboarding Flow Validation

1. **Category Selection**
   - After authentication, verify redirect to onboarding
   - Click "Photography" category
   - **Expected**: Progress saved, next step displayed

2. **Professional Type Selection**
   - Click "Wedding Photography"
   - **Expected**: Progress saved, next step displayed

3. **Location Setup**
   - Allow location access
   - **Expected**: Auto-detect location
   - Or manually enter: "Mumbai, Maharashtra"
   - Click "Continue"
   - **Expected**: Location saved, next step displayed

4. **Profile Setup**
   - Upload profile photo
   - Enter full name: "Test User"
   - Enter phone: "+919999999999"
   - Click "Continue"
   - **Expected**: Profile saved, next step displayed

5. **Professional Details**
   - Select experience level: "Expert"
   - Enter years of experience: "5"
   - Enter specialties: "Wedding, Portrait, Event"
   - Click "Continue"
   - **Expected**: Details saved, next step displayed

6. **Availability Setup**
   - Set default working hours
   - Set calendar visibility: "Public"
   - Click "Continue"
   - **Expected**: Availability saved, next step displayed

7. **Registration Completion**
   - Review all entered information
   - Click "Complete Registration"
   - **Expected**: Registration complete, redirect to dashboard

### Step 3: Error Handling Validation

1. **Invalid Email Format**
   - Try to register with: "invalid-email"
   - **Expected**: Validation error displayed

2. **Weak Password**
   - Try to register with: "123"
   - **Expected**: Password strength error displayed

3. **Duplicate Email**
   - Register with existing email
   - **Expected**: "Email already registered" error

4. **Network Error Simulation**
   - Block network requests in browser dev tools
   - Try to authenticate
   - **Expected**: Network error message displayed

5. **Session Timeout**
   - Wait for session to expire
   - Try to access protected route
   - **Expected**: Redirect to authentication

### Step 4: Data Synchronization Validation

1. **Real-time Updates**
   - Open app in two browser tabs
   - Complete onboarding step in one tab
   - **Expected**: Changes reflected in second tab

2. **Offline Mode**
   - Disconnect internet
   - Complete onboarding step
   - Reconnect internet
   - **Expected**: Changes synchronized automatically

3. **Concurrent Updates**
   - Open profile in two tabs
   - Update different fields in each tab
   - **Expected**: Both changes saved without conflict

### Step 5: Security Validation

1. **SQL Injection Test**
   - Enter in email field: `test@example.com'; DROP TABLE users; --`
   - **Expected**: Input sanitized, no database errors

2. **XSS Prevention Test**
   - Enter in name field: `<script>alert('XSS')</script>`
   - **Expected**: Script escaped, no alert displayed

3. **Unauthorized Access Test**
   - Try to access `/dashboard` without authentication
   - **Expected**: Redirect to `/auth`

4. **CSRF Protection Test**
   - Try to make POST request from external site
   - **Expected**: Request blocked

## Automated Validation Script

```bash
#!/bin/bash
# validation-script.sh

echo "=== Authentication & Onboarding Validation Script ==="
echo

# Configuration
SUPABASE_URL="${VITE_SUPABASE_URL}"
SUPABASE_KEY="${VITE_SUPABASE_ANON_KEY}"
TEST_EMAIL="testuser$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Test Configuration:"
echo "- Supabase URL: $SUPABASE_URL"
echo "- Test Email: $TEST_EMAIL"
echo "- Test Password: $TEST_PASSWORD"
echo

# Function to make API calls
make_api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    curl -s -X "$method" \
        -H "Content-Type: application/json" \
        -H "apikey: $SUPABASE_KEY" \
        -d "$data" \
        "$SUPABASE_URL$endpoint"
}

echo "1. Testing Authentication..."

# Test sign up
SIGNUP_RESPONSE=$(make_api_call "POST" "/auth/v1/signup" "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
}")

if echo "$SIGNUP_RESPONSE" | grep -q "user"; then
    echo "✅ Sign up successful"
else
    echo "❌ Sign up failed: $SIGNUP_RESPONSE"
    exit 1
fi

echo "2. Testing Database Schema..."

# Check if tables exist
TABLES=$(psql "$SUPABASE_URL" -t -c "
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'professional_profiles', 'onboarding_progress')")

if echo "$TABLES" | grep -q "profiles"; then
    echo "✅ Profiles table exists"
else
    echo "❌ Profiles table missing"
fi

if echo "$TABLES" | grep -q "professional_profiles"; then
    echo "✅ Professional profiles table exists"
else
    echo "❌ Professional profiles table missing"
fi

echo "3. Testing RLS Policies..."

# Check RLS policies
POLICIES=$(psql "$SUPABASE_URL" -t -c "
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'profiles'")

if echo "$POLICIES" | grep -q "Users can update own profile"; then
    echo "✅ RLS policies configured"
else
    echo "❌ RLS policies missing"
fi

echo "4. Testing Session Management..."

# Test session retrieval
SESSION_RESPONSE=$(make_api_call "GET" "/auth/v1/token" "")

if echo "$SESSION_RESPONSE" | grep -q "access_token"; then
    echo "✅ Session management working"
else
    echo "❌ Session management issues"
fi

echo "5. Testing Error Handling..."

# Test invalid credentials
INVALID_RESPONSE=$(make_api_call "POST" "/auth/v1/token?grant_type=password" "{
    \"email\": \"invalid@example.com\",
    \"password\": \"wrongpassword\"
}")

if echo "$INVALID_RESPONSE" | grep -q "Invalid login credentials"; then
    echo "✅ Error handling working"
else
    echo "❌ Error handling issues"
fi

echo
echo "=== Validation Complete ==="
```

## Performance Benchmarks

### Authentication Performance
```bash
# Measure authentication response time
curl -w "@curl-format.txt" -s -o /dev/null \
  -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'

# Expected: Response time < 200ms
```

### Database Query Performance
```sql
-- Measure query execution time
EXPLAIN ANALYZE
SELECT * FROM professional_profiles 
WHERE user_id = 'user_123';

-- Expected: Execution time < 50ms
```

## Security Scanning

### Dependency Vulnerabilities
```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### OWASP Security Headers
```bash
# Check security headers
curl -I https://your-app.com

# Verify headers:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - X-XSS-Protection: 1; mode=block
# - Strict-Transport-Security: max-age=31536000
```

## Monitoring & Analytics Validation

### Event Tracking Verification
```javascript
// Check analytics events in browser console
analyticsService.trackStepView('CATEGORY_SELECTION');
analyticsService.trackStepCompletion('CATEGORY_SELECTION');

// Verify events are being sent to analytics provider
```

### Error Monitoring
```javascript
// Test error tracking
try {
  throw new Error('Test error for monitoring');
} catch (error) {
  analyticsService.trackError(error, 'TEST_ERROR');
}
```

## Validation Results Template

```markdown
# Validation Results

**Date**: $(date)
**Environment**: [Production/Staging/Development]
**Tester**: [Name]

## Test Summary
- ✅ **Passed**: [Count]
- ❌ **Failed**: [Count]
- ⚠️ **Issues**: [Count]

## Authentication Tests
- [ ] Email registration
- [ ] Email verification
- [ ] Email login
- [ ] Google OAuth
- [ ] Session management
- [ ] Password reset

## Onboarding Tests
- [ ] Category selection
- [ ] Type selection
- [ ] Location setup
- [ ] Profile setup
- [ ] Professional details
- [ ] Availability setup
- [ ] Registration completion

## Performance Results
- Authentication response time: [X]ms
- Database query time: [X]ms
- Page load time: [X]ms

## Security Results
- Dependency vulnerabilities: [Count]
- Security headers: [Status]
- Input validation: [Status]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]
```

Use this validation script to systematically test all aspects of the authentication and onboarding implementation. Run the automated script for quick validation, then perform manual testing for user experience verification.