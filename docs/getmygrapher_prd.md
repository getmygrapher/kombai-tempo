# GetMyGrapher - Product Requirements Document

## 1. Executive Summary

**Product Name:** GetMyGrapher  
**Target Market:** India  
**Target Users:** Photographers, Videographers, Video Editors, and Designers  
**Core Value Proposition:** A proximity-based professional networking and booking platform that connects creative professionals for collaborative projects and hiring opportunities.

### Vision Statement
To become India's leading platform for creative professionals to discover, connect, and collaborate with each other through seamless availability sharing and job posting features.

## 2. Market Analysis

### Target Audience
- **Primary:** Freelance photographers, videographers, video editors, and designers in India
- **Secondary:** Creative agencies and studios looking for additional talent
- **Market Size:** Growing creative economy in India with increasing demand for visual content

### Market Needs
- Difficulty finding reliable creative professionals for urgent projects
- Lack of transparency in availability and pricing
- Need for proximity-based discovery for location-dependent shoots
- Professional networking within the creative community

## 3. Product Overview

### Core Features
1. **Availability Calendar** - Mark free dates to show availability
2. **Job Posting System** - Quick job posting and discovery
3. **Professional Profiles** - Comprehensive profile management
4. **Proximity-Based Discovery** - Location-based professional discovery
5. **Community Posing Library** - Collaborative pose reference collection with EXIF data
6. **Rating & Review System** - Community-driven quality assurance

### Monetization Strategy
- **Free Tier:** Basic features with advertisements
- **Pro Tier:** Premium subscription with no ads and advanced features

## 4. Feature Specifications

### 4.1 User Registration & Authentication

#### Authentication System
- **Primary:** Google OAuth authentication
- **Backup:** Email/password option for non-Google users

#### Professional Categories (Selection During Signup)
1. Photography
2. Videography & Film
3. Audio Production
4. Design & Creative
5. Multi-Disciplinary

#### Professional Types (Dropdown Selection)
- **Photography:** Portrait Photographer, Wedding Photographer, Event Photographer, Commercial Photographer, Real Estate Photographer, Travel Photographer, Sports Photographer, Documentary Photographer, Fine Art Photographer, Architectural Photographer
- **Videography:** Wedding Videographer, Commercial Videographer, Music Videographer, Digital Content Creator, Broadcast Videographer
- **Audio:** Mixing Engineer, Mastering Engineer, Live Sound Engineer
- **Design:** Graphic Designer, Social Media Designer, Illustrator, Creative Director
- **Multi-Disciplinary:** Content Creator, Visual Storyteller, Brand Specialist, Social Media Manager, Event Planner

### 4.2 Professional Profile System

#### Profile Information
- **Basic Details:**
  - Profile photo (upload feature)
  - Full name
  - Main mobile number (+91 format)
  - Alternate mobile number (optional)
  - Email ID
  - Gender (Male/Female/Other/Prefer not to say)
  - Location (City, State with PIN code)
  - Preferred work locations (multiple selections)

- **Professional Details:**
  - Professional type (from predefined list)
  - Specializations (multi-select based on category)
  - Working experience (dropdown: 0-1 years, 1-3 years, 3-5 years, 5-10 years, 10+ years)
  - Custom "About" section (500 characters max)
  - Instagram handle linking (Pro feature only - displays feed integration)

- **Pricing Information:**
  - Pricing structure (per hour/per day/per event)
  - Rate in INR (₹500 - ₹1,00,000 range)
  - Negotiable checkbox option

- **Rating System:**
  - Average rating (1-5 stars)
  - Total number of reviews
  - Individual review display

#### Equipment Information

- **Camera Equipment:**
  - Primary camera (dropdown: Canon EOS R5, Sony A7IV, Nikon D850, etc.)
  - Secondary cameras (optional)
  - Lens collection (multi-select: 24-70mm, 70-200mm, 50mm prime, etc.)

- **Support Gear:**
  - Tripods & Monopods
  - Gimbals & Stabilizers
  - Sliders & Dollies
  - Drones (model specification)

- **Lighting Equipment:**
  - Equipment title
  - Description (200 characters max)
  - Indoor/Outdoor capability

- **Other Equipment:**
  - Custom equipment entries
  - Title and description format

### 4.3 Availability Calendar

#### Features
- Monthly calendar view with time-based availability
- Time slot selection (hourly increments from 6 AM to 11 PM)
- Date and time selection for availability marking
- Color-coded availability status:
  - **Green:** Available
  - **Yellow:** Partially Available (some time slots booked)
  - **Red:** Unavailable
  - **Blue:** Booked (confirmed work)
- **Calendar visibility control (Pro feature):** Show/hide calendar from other users

#### Functionality
- Mark single or multiple dates with specific time slots
- Recurring availability patterns
- Time-based availability slots (e.g., 9 AM - 5 PM availability)
- Automatic expiry of past dates
- Integration with job booking system

### 4.4 Job Posting System

#### Job Post Structure
- **Title:** Brief job description (100 characters max)
- **Type of Work:** Dropdown selection based on professional categories
- **Professional Type Needed:** Multi-select from professional types
- **Date & Time:** Date picker with time slots
- **Venue/Location:** Address with PIN code for proximity matching
- **Budget Range:** INR range selector
- **Description:** Detailed requirements (1000 characters max)
- **Urgency Level:** Normal/Urgent/Emergency
- **Auto-expiry:** Post expires after job date/time

#### Job Discovery Features
- **Proximity-based filtering:** Jobs sorted by distance
- **Category filtering:** Filter by professional type needed
- **Date filtering:** Show jobs for specific date ranges
- **Budget filtering:** Filter by budget range
- **Save job posts:** Bookmark interesting opportunities

### 4.5 Proximity-Based Discovery

#### Location Services
- GPS-based location detection
- Manual location input option
- Distance calculation and sorting
- Radius selection (5km, 10km, 25km, 50km, 100km+)

#### Search & Filter System
- **Primary filters:**
  - Professional type
  - Specialization
  - Distance radius
  - Availability date range
  - Price range
  - Rating (4+ stars, 4.5+ stars)

- **Advanced filters (Pro tier):**
  - Equipment specifications
  - Experience level
  - Verified profiles only
  - Response time
  - Previous work portfolio

### 4.6 Communication System

#### Communication Features
- In-app messaging between professionals
- Job inquiry templates
- Read receipts and typing indicators
- Contact sharing (phone number reveal after mutual consent)

#### Notification System
- Push notifications for job posts in area
- Message notifications
- Booking confirmations
- Rating reminders

### 4.8 Community Posing Library

#### Overview
A collaborative platform where photographers can share and discover pose references with detailed technical information. This feature enables knowledge sharing within the creative community and helps professionals improve their craft through peer-contributed content.

#### Core Features

##### Pose Submission System
- **Image Upload:** High-quality pose reference images with automatic EXIF extraction
- **Metadata Collection:**
  - Photographer information (name, profile link)
  - Pose title and description
  - Posing tips and techniques
  - Difficulty level (Beginner, Intermediate, Advanced)
  - Number of people in pose (1-10+)
  - Category tags (Portrait, Fashion, Wedding, Commercial, etc.)
  - Mood/emotion tags (Happy, Serious, Romantic, etc.)

##### Technical Information
- **Camera Settings (Auto-extracted from EXIF):**
  - Camera make and model
  - Lens information
  - Aperture (f-stop)
  - Shutter speed
  - ISO sensitivity
  - Focal length
  - Flash settings

- **Additional Equipment:**
  - Lighting setup description
  - Props and accessories used
  - Location context (Studio, Outdoor, etc.)

##### Community Interaction
- **Discovery Features:**
  - Browse poses by category, difficulty, or mood
  - Search functionality with filters
  - Trending poses based on community engagement
  - Personalized recommendations

- **Engagement System:**
  - Like and save poses to personal collections
  - Comment system for tips and feedback
  - Share poses with other professionals
  - Report inappropriate content

##### Content Moderation
- **Quality Control:**
  - Community-driven content review
  - Professional verification for contributors
  - Image quality standards enforcement
  - Copyright and consent verification

#### User Experience Flow

##### For Contributors
1. Access Community Library from main navigation
2. Tap "Add Pose" to upload new reference
3. Select image from gallery or camera
4. Auto-populate EXIF data with manual override option
5. Add pose details, tips, and categorization
6. Submit for community review
7. Receive notifications on pose approval and engagement

##### For Discoverers
1. Browse Community Library by category or search
2. View pose details with technical information
3. Save poses to personal collections
4. Access photographer's profile for collaboration
5. Use pose reference during shoots

#### Pro Tier Integration
- **Free Tier:** View and save up to 10 poses per month
- **Pro Tier:** Unlimited access, advanced search filters, and priority submission review

### 4.9 Booking & Transaction Management

#### Booking Flow
1. Professional responds to job post
2. Job poster reviews profile and Instagram portfolio (if linked)
3. Direct messaging for negotiation
4. Booking confirmation
5. Work completion
6. Rating exchange

#### Contact & Agreement Management
- Direct contact sharing after mutual agreement
- Basic booking confirmation system
- Work completion tracking
- Rating and review system

## 5. Technical Requirements

### 5.1 Platform Architecture & Tech Stack

#### Frontend Framework
- **Framework:** React 19 TypeScript
- **Component Library:** MUI v7
- **Styling:** Emotion
- **Router:** React Router v7 (declarative mode)

#### API Framework & State Management
- **API Framework:** Zustand
- **State Management:** Tanstack Query

#### Platform Deployment
- **Mobile App:** React Native (iOS & Android)
- **Web Platform:** React.js (responsive design)
- **Backend:** Supabase (PostgreSQL with real-time capabilities)
- **Authentication:** Google OAuth (primary method)
- **Maps Integration:** Google Maps API for location services
- **Image Processing:** EXIF-js for automatic metadata extraction
- **File Storage:** Supabase Storage for pose reference images

### 5.2 Performance Requirements
- App load time: < 3 seconds
- Image upload: < 10 seconds for 5MB files
- Search results: < 2 seconds response time
- 99.5% uptime requirement
- Support for 10,000+ concurrent users

### 5.3 Security & Privacy
- End-to-end encryption for messages
- Secure file storage and transmission
- GDPR-compliant data handling
- Phone number verification via OTP
- Profile verification system

## 6. Tier Structure

### 6.1 Free Tier Features
- **Included:**
  - Basic profile creation
  - 1 job post per month
  - 1 job acceptance per month
  - View jobs within 25km radius
  - Basic messaging (10 conversations/month)
  - Standard search filters
  - Basic availability calendar (visible to all)
  - Community Posing Library (view and save up to 10 poses/month)

- **Limitations:**
  - Advertisement banners throughout app
  - Limited search filters
  - No priority in search results
  - No advanced analytics
  - No Instagram integration
  - Public availability calendar
  - Limited community library access

### 6.2 Pro Tier Features (₹299/month or ₹2999/year)
- **All Free features plus:**
  - Ad-free experience
  - Unlimited job posts and acceptances
  - Extended radius search (up to 500km)
  - Unlimited messaging
  - Advanced filters and search
  - Priority placement in search results
  - **Instagram handle integration** with feed display
  - **Calendar visibility control** (show/hide from other users)
  - Time-based availability slots
  - Analytics dashboard
  - Verified badge eligibility
  - Early access to new features
  - Customer support priority
  - **Unlimited Community Posing Library access** with advanced search filters and priority submission review

## 7. User Experience Design

### 7.1 App Navigation
- **Bottom Tab Navigation:**
  - Home (job feed)
  - Search (professionals)
  - Community (posing library)
  - Calendar (availability)
  - Messages
  - Profile

### 7.2 Onboarding Flow
1. Welcome screen with value proposition
2. Professional category selection
3. Location permission request
4. Profile setup wizard
5. Equipment information (optional)
6. Calendar setup tutorial
7. First job post creation guide

### 7.3 Key User Journeys

#### Job Seeker Journey
1. Open app → View nearby jobs
2. Apply filters → Browse relevant opportunities
3. View job details → Check poster's profile and Instagram (if Pro)
4. Send inquiry message → Negotiate terms
5. Confirm booking → Complete work
6. Rate client

#### Job Poster Journey
1. Open app → Tap "Post Job"
2. Fill job details → Set budget and location
3. Publish post → Receive applications
4. Review applicants → Check profiles and Instagram portfolios (if linked)
5. Select professional → Confirm booking
6. Work completion → Rate professional

## 8. Competitive Analysis

### Key Differentiators
- **Hyper-local focus:** Proximity-based discovery for location-dependent work
- **Professional-only network:** Curated community of verified creatives
- **Equipment transparency:** Detailed equipment information for quality assurance
- **Flexible pricing:** Multiple pricing models (hourly/daily/event-based)
- **Instagram integration:** Direct portfolio viewing through Instagram (Pro feature)
- **Time-based availability:** Granular time slot management
- **Regional optimization:** Built specifically for Indian market including Kerala

## 9. Marketing & Growth Strategy

### 9.1 Launch Strategy
- **Phase 1:** Beta launch in top 5 metros + Kerala (Mumbai, Delhi, Bangalore, Chennai, Kochi, Hyderabad)
- **Phase 2:** Expansion to tier-2 cities
- **Phase 3:** Pan-India rollout

### 9.2 User Acquisition
- Social media campaigns targeting creative professionals
- Partnerships with photography schools and institutes
- Referral program (both users get 1 month Pro free)
- Photography community meetups and events
- Influencer partnerships with established photographers

### 9.3 Retention Strategy
- Weekly job opportunity newsletters
- Success story features
- Professional development content
- Community challenges and contests
- Loyalty rewards for active users

## 10. Success Metrics & KPIs

### Primary Metrics
- **Monthly Active Users (MAU)**
- **Job posting frequency**
- **Successful booking rate**
- **User retention rate (Day 7, Day 30)**
- **Pro tier conversion rate**

### Secondary Metrics
- Average session duration
- Profile completion rate
- Response rate to job posts
- User rating average
- Revenue per user (Pro tier)

## 11. Technical Implementation Timeline

### Phase 1 (Months 1-3): MVP Development
- User registration and authentication
- Basic profile creation
- Job posting and discovery
- Simple messaging system
- Location-based search

### Phase 2 (Months 4-5): Enhanced Features
- Advanced search and filters
- Calendar integration
- Rating and review system
- Payment integration
- Push notifications
- **Community Posing Library MVP** with basic upload and discovery features

### Phase 3 (Months 6-7): Premium Features
- Pro tier implementation
- Advanced analytics
- Portfolio enhancement
- Professional verification system
- Mobile app optimization
- **Enhanced Community Posing Library** with advanced search, EXIF extraction, and community moderation

### Phase 4 (Months 8-9): Scale & Polish
- Performance optimization
- Advanced matching algorithms
- Enhanced communication tools
- Customer support integration
- Marketing automation

## 12. Risk Assessment

### Technical Risks
- **Location accuracy issues:** Mitigation through GPS + manual input options
- **Scalability challenges:** Cloud-based architecture with auto-scaling
- **Data privacy concerns:** Strict privacy controls and user consent mechanisms

### Business Risks
- **Market adoption:** Comprehensive onboarding and user education
- **Competition:** Strong differentiation through proximity focus and equipment transparency
- **Monetization challenges:** Freemium model with clear value proposition for Pro tier

### Regulatory Risks
- **Data protection compliance:** GDPR and Indian data protection law adherence
- **Payment regulations:** RBI compliance for payment processing
- **Professional licensing:** Clear disclaimers about independent contractor relationships

## 13. Future Enhancements (Post-MVP)

### Year 1 Roadmap
- **AI-powered matching:** Algorithm-based job-professional matching
- **Portfolio showcase:** Enhanced portfolio with video capabilities
- **Team collaboration:** Multi-professional team formation for large projects
- **Contract templates:** Legal document templates for bookings
- **Insurance integration:** Professional liability insurance options

### Year 2+ Vision
- **Training marketplace:** Skills development and certification programs
- **Equipment rental:** Peer-to-peer equipment sharing
- **Client access:** Direct client booking (non-professionals)
- **International expansion:** South Asian market expansion
- **Virtual collaboration tools:** Remote work project management

## 14. Success Criteria

### Launch Success (Month 6)
- 1,000+ verified professionals across 6 cities (including Kerala)
- 500+ job posts per month
- 70%+ profile completion rate
- 4.0+ average app store rating

### Year 1 Success
- 10,000+ active professionals
- 5,000+ monthly job posts
- 15% Pro tier conversion rate
- ₹10+ lakhs monthly revenue
- 60%+ user retention rate (30-day)

---

*This PRD serves as the foundational document for GetMyGrapher platform development, focusing on creating a thriving ecosystem for creative professionals in India.*