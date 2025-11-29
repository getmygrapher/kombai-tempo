# GetMyGrapher Job Posting System Flow

## Overview

This document outlines the complete frontend job posting system for GetMyGrapher, a professional-only platform connecting creative professionals in India. The system enables professionals to post job opportunities and discover relevant work based on proximity, skills, and availability.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Job Posting Flow](#job-posting-flow)
3. [Job Discovery & Search](#job-discovery--search)
4. [Job Management](#job-management)
5. [Technical Implementation](#technical-implementation)
6. [UI/UX Components](#uiux-components)
7. [Data Models](#data-models)
8. [Validation & Security](#validation--security)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Phases](#implementation-phases)

## System Architecture

### Core Components
- **Job Creation Form**: Multi-step form for posting new jobs
- **Job Discovery Feed**: Proximity-based job listing with filters
- **Job Detail View**: Comprehensive job information display
- **Application Management**: Handle job applications and responses
- **Search & Filter System**: Advanced filtering capabilities

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **UI Library**: MUI v7 with Emotion styling
- **State Management**: Zustand + TanStack Query
- **Routing**: React Router v7 (declarative mode)

## Job Posting Flow

### 1. Job Creation Entry Points
- **Floating Action Button**: Primary CTA on HomePage
- **Empty State**: "Post Your First Job" button when no jobs available
- **Navigation**: Direct access from main navigation

### 2. Multi-Step Job Creation Form

#### Step 1: Basic Information
**Required Fields:**
- **Title**: Brief job description (100 characters max)
  - Validation: Non-empty, character limit
  - Placeholder: "e.g., Wedding Photography - Outdoor Ceremony"
- **Type of Work**: Dropdown selection
  - Options: Photography, Videography, Event Planning, etc.
  - Based on `ProfessionalCategory` enum
- **Professional Type Needed**: Multi-select
  - Dynamic options based on selected work type
  - Examples: Portrait Photographer, Wedding Videographer

#### Step 2: Schedule & Location
**Required Fields:**
- **Date**: Date picker with calendar interface
  - Validation: Future dates only
  - Auto-expiry: Post expires after job date/time
- **Time**: Time slot selection
  - Start time and end time
  - Duration calculation
- **Venue/Location**: Address input with PIN code
  - GPS location detection option
  - Manual address entry
  - PIN code for proximity matching
  - Location preview on map

#### Step 3: Budget & Requirements
**Required Fields:**
- **Budget Range**: INR range selector
  - Minimum and maximum values
  - Slider interface with manual input option
  - Currency formatting (₹)
- **Description**: Detailed requirements (1000 characters max)
  - Rich text editor
  - Character counter
  - Formatting options (bold, italic, lists)
- **Urgency Level**: Selection options
  - Normal (default)
  - Urgent (highlighted in yellow)
  - Emergency (highlighted in red)

#### Step 4: Review & Publish
- **Preview**: Complete job post preview
- **Edit Options**: Quick edit for each section
- **Publish Button**: Final submission
- **Save as Draft**: Option to save for later

### 3. Job Post Validation
- **Required Field Validation**: All mandatory fields completed
- **Character Limits**: Title (100), Description (1000)
- **Date Validation**: Future dates only
- **Budget Validation**: Minimum < Maximum, reasonable ranges
- **Location Validation**: Valid PIN code, address format

## Job Discovery & Search

### 1. Job Feed Display
- **Default View**: Proximity-based sorting (nearest first)
- **Card Layout**: JobCard component with essential information
- **Infinite Scroll**: Load more jobs as user scrolls
- **Pull to Refresh**: Update job listings

### 2. Primary Filters
**Location-Based:**
- **Distance Radius**: 5km, 10km, 25km, 50km, 100km+
- **GPS Integration**: Automatic location detection
- **Manual Location**: Override GPS with custom location

**Category Filters:**
- **Professional Type**: Filter by required professional category
- **Specialization**: Sub-category filtering
- **Work Type**: Photography, Videography, etc.

**Time-Based:**
- **Date Range**: Show jobs for specific dates
- **Availability**: Match with user's calendar
- **Urgency Level**: Normal, Urgent, Emergency

**Budget Filters:**
- **Price Range**: Slider-based budget filtering
- **Budget Type**: Fixed, Hourly, Project-based

### 3. Advanced Filters (Pro Tier)
- **Rating Filter**: 4+ stars, 4.5+ stars
- **Verified Profiles**: Jobs from verified professionals only
- **Response Time**: Quick responders
- **Equipment Requirements**: Specific equipment needs
- **Experience Level**: Junior, Mid-level, Senior

### 4. Search Functionality
- **Text Search**: Search in title and description
- **Location Search**: Search by city, area, PIN code
- **Saved Searches**: Bookmark search criteria
- **Search History**: Recent search terms

## Job Management

### 1. Job Poster Dashboard
**My Posted Jobs:**
- **Active Jobs**: Currently open positions
- **Draft Jobs**: Saved but not published
- **Expired Jobs**: Past date or manually closed
- **Completed Jobs**: Finished projects

**Job Actions:**
- **Edit Job**: Modify job details (before applications)
- **Close Job**: Manually close before expiry
- **Extend Deadline**: Extend job date/time
- **Delete Job**: Remove job posting
- **Duplicate Job**: Create similar job post

### 2. Application Management
**Application Tracking:**
- **New Applications**: Unread applications
- **Under Review**: Applications being considered
- **Shortlisted**: Selected candidates
- **Rejected**: Declined applications
- **Hired**: Final selection

**Application Actions:**
- **View Profile**: Professional's complete profile
- **Message**: Direct communication
- **Shortlist**: Add to shortlist
- **Reject**: Decline application
- **Hire**: Select for the job

### 3. Job Applicant View
**Application Status:**
- **Applied**: Application submitted
- **Under Review**: Being considered
- **Shortlisted**: In final consideration
- **Rejected**: Application declined
- **Hired**: Selected for job

**Applicant Actions:**
- **Withdraw Application**: Cancel application
- **Message Poster**: Direct communication
- **Update Application**: Modify application details

## Technical Implementation

### 1. New Components Required

#### Job Creation Components
```typescript
// Job creation form components
- JobCreationWizard: Multi-step form container
- BasicInfoStep: Title, type, professional type selection
- ScheduleLocationStep: Date, time, location input
- BudgetRequirementsStep: Budget range, description, urgency
- ReviewPublishStep: Preview and final submission

// Form input components
- JobTitleInput: Title input with character limit
- ProfessionalTypeSelector: Multi-select dropdown
- DateTimeSelector: Date and time picker
- LocationInput: Address input with GPS integration
- BudgetRangeSlider: Budget range selection
- UrgencySelector: Urgency level selection
```

#### Job Discovery Components
```typescript
// Discovery and search components
- JobFeed: Main job listing container
- JobFilters: Filter panel with all options
- SearchBar: Text search with suggestions
- FilterChips: Active filter display
- SortOptions: Sorting preferences

// Job display components
- JobCard: Enhanced job card (existing, needs updates)
- JobDetailModal: Detailed job view
- ApplicationButton: Apply/withdraw actions
- SaveJobButton: Bookmark functionality
```

#### Job Management Components
```typescript
// Management dashboard components
- JobDashboard: Posted jobs overview
- JobStatusTabs: Active, draft, expired tabs
- ApplicationsList: Applications for a job
- ApplicationCard: Individual application display
- JobActions: Edit, close, extend actions
```

### 2. Enhanced Data Models

#### Job Interface Updates
```typescript
interface Job {
  id: string;
  title: string;
  type: ProfessionalCategory;
  professionalTypesNeeded: string[];
  date: string;
  endDate?: string;
  timeSlots: TimeSlot[];
  location: JobLocation;
  budgetRange: BudgetRange;
  description: string;
  urgency: UrgencyLevel;
  postedBy: JobPoster;
  applicants: Application[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isExpired: boolean;
  isSaved?: boolean;
  viewCount: number;
}

interface JobLocation extends Location {
  venueDetails?: string;
  accessInstructions?: string;
  parkingAvailable?: boolean;
}

interface BudgetRange {
  min: number;
  max: number;
  currency: 'INR';
  type: 'fixed' | 'hourly' | 'project';
  isNegotiable: boolean;
}

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicant: Professional;
  message: string;
  proposedRate?: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

enum JobStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  HIRED = 'hired',
  WITHDRAWN = 'withdrawn'
}
```

### 3. API Integration Points

#### Job Management APIs
```typescript
// Job CRUD operations
- createJob(jobData: CreateJobRequest): Promise<Job>
- updateJob(jobId: string, updates: UpdateJobRequest): Promise<Job>
- deleteJob(jobId: string): Promise<void>
- getJob(jobId: string): Promise<Job>
- getMyJobs(filters?: JobFilters): Promise<Job[]>

// Job discovery APIs
- getNearbyJobs(location: Coordinates, radius: number, filters?: JobFilters): Promise<Job[]>
- searchJobs(query: string, filters?: JobFilters): Promise<Job[]>
- getSavedJobs(): Promise<Job[]>
- saveJob(jobId: string): Promise<void>
- unsaveJob(jobId: string): Promise<void>

// Application management APIs
- applyToJob(jobId: string, application: ApplicationRequest): Promise<Application>
- withdrawApplication(applicationId: string): Promise<void>
- getJobApplications(jobId: string): Promise<Application[]>
- updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application>
```

### 4. State Management

#### Zustand Store Slices
```typescript
// Job posting store
interface JobPostingStore {
  currentJob: Partial<Job> | null;
  step: number;
  isSubmitting: boolean;
  errors: Record<string, string>;
  
  // Actions
  setJobData: (data: Partial<Job>) => void;
  nextStep: () => void;
  prevStep: () => void;
  submitJob: () => Promise<void>;
  resetForm: () => void;
}

// Job discovery store
interface JobDiscoveryStore {
  jobs: Job[];
  filters: JobFilters;
  searchQuery: string;
  sortBy: JobSortOption;
  isLoading: boolean;
  hasMore: boolean;
  
  // Actions
  setFilters: (filters: Partial<JobFilters>) => void;
  setSearchQuery: (query: string) => void;
  loadJobs: () => Promise<void>;
  loadMoreJobs: () => Promise<void>;
  refreshJobs: () => Promise<void>;
}
```

## UI/UX Components

### 1. Job Creation Form Design

#### Visual Design Principles
- **Progressive Disclosure**: Multi-step form reduces cognitive load
- **Visual Hierarchy**: Clear section headers and field grouping
- **Immediate Feedback**: Real-time validation and character counters
- **Mobile-First**: Responsive design for mobile job posting

#### Form Layout
```typescript
// Step indicator component
<StepIndicator currentStep={2} totalSteps={4} />

// Form sections with clear visual separation
<FormSection title="Basic Information" icon={<InfoIcon />}>
  <JobTitleInput />
  <WorkTypeSelector />
  <ProfessionalTypeSelector />
</FormSection>

// Progress saving
<AutoSave status="saved" lastSaved="2 minutes ago" />
```

### 2. Job Discovery Interface

#### Feed Layout
- **Card-Based Design**: Consistent with existing JobCard component
- **Filter Panel**: Collapsible side panel or bottom sheet on mobile
- **Search Integration**: Prominent search bar with filter chips
- **Empty States**: Helpful messages when no jobs found

#### Filter Interface
```typescript
// Filter categories with expandable sections
<FilterSection title="Location" expanded={true}>
  <RadiusSelector />
  <LocationInput />
</FilterSection>

<FilterSection title="Category">
  <ProfessionalTypeFilter />
  <SpecializationFilter />
</FilterSection>

// Active filters display
<ActiveFilters>
  <FilterChip label="Photography" onRemove={removeFilter} />
  <FilterChip label="Within 10km" onRemove={removeFilter} />
</ActiveFilters>
```

### 3. Job Management Dashboard

#### Dashboard Layout
- **Tab Navigation**: Active, Draft, Expired, Completed
- **Quick Actions**: Create new job, bulk actions
- **Statistics**: Application counts, view counts
- **Search & Filter**: Find specific jobs quickly

## Validation & Security

### 1. Input Validation

#### Client-Side Validation
- **Required Fields**: All mandatory fields must be completed
- **Format Validation**: Email, phone, PIN code formats
- **Length Limits**: Character limits for title and description
- **Date Validation**: Future dates only, reasonable time ranges
- **Budget Validation**: Positive numbers, min < max

#### Server-Side Validation
- **Data Sanitization**: Clean all user inputs
- **Business Rules**: Validate against business logic
- **Rate Limiting**: Prevent spam job postings
- **Duplicate Detection**: Prevent duplicate job posts

### 2. Security Measures

#### Data Protection
- **Input Sanitization**: Prevent XSS attacks
- **CSRF Protection**: Secure form submissions
- **Authentication**: Verify user identity for all actions
- **Authorization**: Ensure users can only manage their own jobs

#### Privacy Controls
- **Location Privacy**: Option to hide exact location
- **Contact Information**: Controlled sharing of contact details
- **Profile Visibility**: Control who can see job poster details

## Testing Strategy

### 1. Unit Testing
- **Component Testing**: Test all job-related components
- **Form Validation**: Test all validation rules
- **State Management**: Test Zustand store actions
- **Utility Functions**: Test formatters and helpers

### 2. Integration Testing
- **API Integration**: Test all job-related API calls
- **Form Submission**: End-to-end job creation flow
- **Search & Filter**: Test discovery functionality
- **Application Flow**: Test job application process

### 3. User Acceptance Testing
- **Job Creation Flow**: Complete job posting process
- **Discovery Experience**: Finding and applying to jobs
- **Mobile Experience**: Touch interactions and responsive design
- **Performance**: Load times and smooth interactions

## Implementation Phases

### Phase 1: Core Job Posting (Weeks 1-3)
**Deliverables:**
- Job creation form (4 steps)
- Basic job validation
- Job posting API integration
- Simple job preview

**Components:**
- JobCreationWizard
- BasicInfoStep, ScheduleLocationStep, BudgetRequirementsStep, ReviewPublishStep
- JobTitleInput, ProfessionalTypeSelector, DateTimeSelector
- LocationInput, BudgetRangeSlider, UrgencySelector

### Phase 2: Job Discovery & Search (Weeks 4-6)
**Deliverables:**
- Enhanced job feed with filters
- Search functionality
- Proximity-based sorting
- Job detail view

**Components:**
- JobFeed, JobFilters, SearchBar
- FilterChips, SortOptions
- JobDetailModal, SaveJobButton
- Enhanced JobCard component

### Phase 3: Application Management (Weeks 7-8)
**Deliverables:**
- Job application system
- Application tracking
- Professional-job poster communication
- Application status management

**Components:**
- ApplicationButton, ApplicationsList
- ApplicationCard, JobDashboard
- JobStatusTabs, JobActions

### Phase 4: Advanced Features (Weeks 9-10)
**Deliverables:**
- Advanced filters (Pro tier)
- Job analytics
- Bulk actions
- Performance optimization

**Components:**
- Advanced filter components
- Analytics dashboard
- Bulk action interfaces

## Success Metrics

### User Engagement
- **Job Posting Rate**: Number of jobs posted per day/week
- **Application Rate**: Applications per job posted
- **Search Usage**: Search queries and filter usage
- **Time to Post**: Average time to complete job posting

### System Performance
- **Page Load Times**: < 2 seconds for job feed
- **Search Response**: < 500ms for search results
- **Form Submission**: < 3 seconds for job posting
- **Mobile Performance**: Smooth interactions on mobile devices

### Business Metrics
- **Job Completion Rate**: Percentage of jobs that get filled
- **User Retention**: Users returning to post more jobs
- **Geographic Coverage**: Jobs posted across different locations
- **Professional Engagement**: Active professionals applying to jobs

## Conclusion

This comprehensive job posting system will provide GetMyGrapher professionals with a powerful platform to discover opportunities and post job requirements. The system emphasizes user experience, mobile-first design, and proximity-based discovery to create a thriving marketplace for creative professionals in India.

The phased implementation approach ensures steady progress while allowing for user feedback and iterative improvements. The focus on validation, security, and performance will ensure a reliable and scalable system that can grow with the platform's success.
## Documentation Status Update (2025-11-29)
- Implementation State: 90% complete
- Highlights:
  - Job creation wizard with steps, validation, and autosave implemented
  - Job feed, filters, proximity utilities, and detail view active
  - Applications list and management actions available
- Known Gaps:
  - Map preview and some advanced validation schemas to finalize
  - Broader test coverage and accessibility checks pending
- Change Log:
  - 2025-11-29: Updated status to reflect implemented wizard, feed, and management flows
