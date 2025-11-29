# Job Posting System – Frontend Task Breakdown (Kombai Agent)

Purpose
- Provide a precise, implementation-ready task list focused on Job_Posting_System_Flow.md.
- Enforce proper routing (React Router, declarative) and UI consistency across the app.
- Align with Milestone 5 in the milestone plan and the PRD.

Source Docs
- Job system flow: Job_Posting_System_Flow.md
- Milestone plan: Milestone_Plan.md (see Milestone 5 – Job Posting System)
- PRD: getmygrapher_prd.md
- Frontend audit: frontend-only audit.md

Context Snapshot (what exists vs missing)
- Exists (per audit)
  - Job wizard scaffolding: JobCreationWizard.tsx and steps under components/jobs/steps/*
  - Discovery UI: JobFeed, JobFilters, JobCard, JobDetailModal
  - Dashboard scaffolding: MyJobs/JobDashboard, ApplicationsList (mock actions)
  - Data: data/jobPostingMockData.ts
- Gaps / To implement or improve
  - Routing: React Router v7 not used app-wide; jobs pages must be routed (feed, detail, wizard, manage)
  - Validation: ad-hoc; adopt react-hook-form + zod for all job forms
  - Location: add shared LocationInput with GPS + (stub) map preview, PIN validation
  - Proximity sort: currently mocked; prepare service API contracts (stubs) and utilities for distance
  - Drafts/autosave: persist wizard drafts; resume flow
  - Accessibility and UI consistency: ensure MUI theme tokens, a11y, skeletons/disabled states
  - Store: dedicated jobs store slice(s) for wizard and discovery paging/infinite scroll

Design System and UI Consistency Rules (apply to all new/updated components)
- MUI v7 with project theme tokens: src/theme/index.ts palette, spacing, typography.
- Use styled() from @mui/material/styles; avoid inline style objects.
- Spacing: theme.spacing(n); Radius: theme.shape.borderRadius; Shadows: theme.shadows[x].
- Colors: palette.primary/secondary/success/warning/error/info; greys from palette.grey.
- Loading: MUI Skeleton or CircularProgress; Disabled states: set disabled and aria-disabled.
- Accessibility: label/id for inputs; aria-describedby for help/error; keyboard focus visible.
- Mobile-first: verify at 360–400px; use useMediaQuery for adaptations.

Route Map (declarative, deep-linkable)
- /jobs → JobFeed (default discovery list)
- /jobs/new → JobCreationWizard (redirect to /jobs/new/basic)
- /jobs/new/basic → Step 1
- /jobs/new/schedule → Step 2
- /jobs/new/budget → Step 3
- /jobs/new/review → Step 4
- /jobs/:jobId → JobDetailView/Modal route
- /jobs/manage → MyJobs dashboard (Active/Drafts/Expired/Completed)
- /jobs/manage/:jobId/applications → Applications management for a job

Epic A — Routing & App Shell Integration
A1. Introduce jobs routes (React Router declarative)
- Files: main.tsx, src/App.GetMyGrapher.tsx
- Actions
  - Add routes listed above. Use code-splitting (React.lazy/Suspense).
  - Integrate BottomNavigation to navigate via routes (not Zustand-only tab state).
  - If auth guard exists, ensure /jobs/new and /jobs/manage are protected; /jobs and /jobs/:jobId public read.
- Acceptance criteria
  - Hitting routes directly renders correct screens.
  - Bottom nav and “Post Job” FAB navigate to /jobs/new/basic.
  - App boots and jobs routes cooperate with existing providers (Theme, QueryClient).
- Dependencies
  - Milestone 0 routing/provider foundation; Auth guard from onboarding epic.

A2. Link Home and Search to Jobs routing
- Files: src/components/home/*, src/components/navigation/BottomNavigation.tsx
- Actions
  - Ensure “Jobs” tab navigates to /jobs and “Post Job” action navigates to /jobs/new.
- Acceptance criteria
  - No state-only tab switching; URL reflects current section.

Epic B — Data Models, Services, and Store
B1. Add types for jobs
- Files: src/types/jobs.ts (new), src/types/index.ts (export)
- Actions
  - Define Job, JobLocation, BudgetRange, Application, enums (JobStatus, ApplicationStatus, UrgencyLevel).
  - Match the flow document’s fields; ensure serializable shapes for persistence.
- Acceptance criteria
  - Types imported by components and store without circular deps.

B2. Job services (stub APIs)
- Files: src/services/jobsService.ts (new)
- Actions
  - Export functions:
    - createJob, updateJob, deleteJob, getJob, getMyJobs
    - getNearbyJobs, searchJobs, getSavedJobs, saveJob, unsaveJob
    - applyToJob, withdrawApplication, getJobApplications, updateApplicationStatus
  - For now, use data/jobPostingMockData.ts to simulate responses and latency.
- Acceptance criteria
  - All calls return Promises; error paths simulated; easy to swap to backend.

B3. Zustand store slices
- Files: src/store/jobsPostingStore.ts (new), src/store/jobsDiscoveryStore.ts (new)
- Actions
  - Posting store: currentJob (Partial<Job>), step, isSubmitting, errors, draft timestamp
    - setJobData, nextStep, prevStep, saveDraft, loadDraft, submitJob, resetForm
  - Discovery store: jobs, filters, searchQuery, sortBy, isLoading, hasMore
    - setFilters, setSearchQuery, loadJobs, loadMoreJobs, refreshJobs
  - Persist drafts in localStorage via zustand persist; version and migration placeholders.
- Acceptance criteria
  - Draft persists across refresh; discovery supports infinite scroll and pull-to-refresh.

Epic C — Job Creation Wizard (4 steps)
C1. Step 1 – Basic Information
- Files: src/components/jobs/wizard/BasicInfoStep.tsx (new)
- Actions
  - Fields: Title (max 100), Work Type (ProfessionalCategory), Professional Types (multi-select dependent on Work Type).
  - Use react-hook-form + zod schema; show helper text and char counters.
  - On success, next to /jobs/new/schedule.
- Acceptance criteria
  - Validation blocks Next until valid; keyboard accessible; mobile-first layout.

C2. Step 2 – Schedule & Location
- Files: src/components/jobs/wizard/ScheduleLocationStep.tsx (new)
- Actions
  - Fields: Date (future only), Start/End time or slot selector, Address, PIN (India), GPS detect button, map preview (stub).
  - Use shared LocationInput with PIN validation and GPS (Epic H).
- Acceptance criteria
  - Future-date validation; invalid PIN shows error; location preview region renders.

C3. Step 3 – Budget & Requirements
- Files: src/components/jobs/wizard/BudgetRequirementsStep.tsx (new)
- Actions
  - Fields: Budget range slider + manual inputs, currency “INR”, type (fixed/hourly/project), negotiable toggle.
  - Description (max 1000) with rich-text-lite (bold/italic/list minimal) OR plain TextField with character counter as interim.
  - Urgency selector (Normal/Urgent/Emergency).
- Acceptance criteria
  - Min < Max enforced; currency formatting; clear errors and disabled Next when invalid.

C4. Step 4 – Review & Publish
- Files: src/components/jobs/wizard/ReviewPublishStep.tsx (new)
- Actions
  - Preview all data; anchored edit links to previous steps.
  - Actions: Publish, Save Draft.
  - On Publish: call createJob(), navigate to /jobs/manage with success toast; fire analytics event.
- Acceptance criteria
  - Publish disabled while submitting; error snackbar on failure; optimistic success UI.

C5. Wizard container and layout
- Files: src/components/jobs/JobCreationWizard.tsx (update), src/components/jobs/wizard/JobWizardLayout.tsx (new), src/components/onboarding/StepNavigation.tsx (reuse if available; otherwise create jobs-specific Stepper)
- Actions
  - Use router step routes; StepNavigation shows current step and enables/disables Next based on store.canProceed.
  - Autosave banner (e.g., “Saved 2m ago”).
- Acceptance criteria
  - Refresh preserves route and form values; back/next via buttons and browser history.

Epic D — Job Discovery & Search
D1. /jobs feed improvements
- Files: src/components/jobs/JobFeed.tsx (update), src/components/jobs/JobFilters.tsx (update), src/components/jobs/JobCard.tsx (update)
- Actions
  - Infinite scroll; pull-to-refresh; skeletons while loading.
  - Filters: radius, location override, professional type, date range, urgency, budget.
  - URL-driven filters via query params (?q=, ?radius=, etc.) for shareable searches.
- Acceptance criteria
  - Changing filters updates URL and results; scroll restores on back; responsive filter drawer on mobile.

D2. Proximity sorting (prep)
- Files: src/utils/locationUtils.ts (new), src/services/jobsService.ts (update)
- Actions
  - Provide haversine distance utility (client-side fallback).
  - Shape service API to accept (lat,lng,radius) and return sorted jobs (simulated).
- Acceptance criteria
  - Jobs list reflects nearest-first when coordinates available; falls back gracefully.

Epic E — Job Detail & Applications
E1. Job detail route
- Files: src/components/jobs/JobDetailView.tsx (new or enhance JobDetailModal to route-aware)
- Actions
  - Route /jobs/:jobId renders detail view; supports open-as-modal on top of feed when navigated from /jobs.
  - Actions: Save/Unsave, Apply (CTA), Share, Report.
- Acceptance criteria
  - Deep links work; modal-to-page transition smooth; a11y focus trapping when modal is used.

E2. Apply flow (MVP)
- Files: src/components/jobs/ApplicationButton.tsx (new), src/components/jobs/ApplyDialog.tsx (new)
- Actions
  - Allow entering a short message and optional proposed rate; validate required fields.
  - Mock submit to applyToJob(); reflect application status in UI.
- Acceptance criteria
  - “Applied” state persists; Withdraw option visible; optimistic updates with rollback on error.

Epic F — My Jobs (Management)
F1. Dashboard and tabs
- Files: src/components/jobs/JobDashboard.tsx (update), src/components/jobs/JobStatusTabs.tsx (new)
- Actions
  - Tabs: Active, Drafts, Expired, Completed; counters; search within dashboard.
- Acceptance criteria
  - Actions per card: Edit (go to wizard prefilled), Close, Extend date, Delete, Duplicate (prefill new wizard draft).

F2. Applications management
- Files: src/components/jobs/ApplicationsList.tsx (update), src/components/jobs/ApplicationCard.tsx (new), src/components/jobs/JobActions.tsx (update)
- Actions
  - Show applicant info; actions: View Profile, Message, Shortlist, Reject, Hire (mock service updates).
- Acceptance criteria
  - Status transitions persist; list updates live; empty states and skeletons included.

Epic G — Validation, Draft Persistence, Autosave
G1. Validation package
- Files: src/utils/jobValidation.ts (new)
- Actions
  - zod schemas for each step (title/type/types; schedule/location; budget/description/urgency).
  - Utility guards: isValidPincodeIndia, isFutureDate, budgetMinMax.
- Acceptance criteria
  - Shared validation used by react-hook-form resolvers; unit tests added.

G2. Draft persistence and autosave
- Files: src/store/jobsPostingStore.ts (update)
- Actions
  - Persist per-step sections; autosave on blur/change with debounce; show last saved time.
- Acceptance criteria
  - Refresh retains draft; “Discard Draft” clears persisted state.

Epic H — Shared Location & Map (Cross-cutting)
H1. Reusable LocationInput
- Files: src/components/common/LocationInput.tsx (new), src/services/locationServices.ts (extend existing or create), src/utils/formatters.ts (budget/location format helpers if needed)
- Actions
  - Fields: address line, PIN, city/state (optional), GPS “Use my location” (geolocation), map preview (stub container), validation messages.
  - Emit {address, pincode, coordinates, radius?}.
- Acceptance criteria
  - Used by ScheduleLocationStep and feed filters; PIN validation enforced; a11y labels and help text.

Epic I — Analytics & Instrumentation
I1. Job analytics events
- Files: src/utils/analyticsEvents.ts (update)
- Actions
  - Add events:
    - job_post_started, job_post_draft_saved, job_post_published
    - job_viewed, job_saved, job_unsaved
    - job_applied, job_application_withdrawn
    - job_application_status_changed (shortlisted/rejected/hired)
- Acceptance criteria
  - Events fired at appropriate user actions; no PII in payloads.

Epic J — QA, Accessibility, Performance
J1. Unit tests
- Files: tests for jobValidation.ts, jobsPostingStore.ts, jobsDiscoveryStore.ts
- Actions
  - Cover success/edge cases (invalid PIN, past date, budget min>=max).
- Acceptance criteria
  - All unit tests pass locally and in CI.

J2. Integration tests
- Scope
  - End-to-end wizard happy path; discovery filter interactions; apply/withdraw; dashboard status changes (API mocked).
- Acceptance criteria
  - Tests green; address TC004 in testsprite (Job Posting Workflow).

J3. Accessibility
- Actions
  - Labels and aria-* for all inputs; focus trapping in dialogs; keyboard nav for wizard and filters; color contrast AA.
- Acceptance criteria
  - Keyboard-only completion of wizard; screen readers announce step changes and form errors.

J4. Performance
- Actions
  - Route-level code splitting; list virtualization on feeds; debounce filter changes; memoize heavy components.
- Acceptance criteria
  - Smooth scroll and interactions on mid-tier mobile; no jank on filter changes.

Implementation Order & Dependencies
1) Epic A (Routing) + B (Types/Services/Store)
2) Epic C (Wizard) with G (Validation/Drafts) and H (LocationInput)
3) Epic D (Discovery) and E (Detail + Apply)
4) Epic F (My Jobs)
5) Epic I (Analytics) and J (QA/A11y/Perf) ongoing

Acceptance Criteria Summary (global)
- All job routes deep-link and render expected screens with guarded access where needed.
- Wizard uses react-hook-form + zod, with draft autosave and resume; validation and UX are consistent and accessible.
- Discovery feed supports infinite scroll, pull-to-refresh, and URL-driven filters; proximity sorting prepared.
- My Jobs dashboard supports CRUD-like actions (mocked) and application status changes with optimistic UI.
- UI adheres to theme tokens and accessibility standards; skeletons and disabled states are consistent.

Security & Privacy Checklist (apply across tasks)
- Input sanitization and client-side validation for all fields (title, description, budget, location).
- No secrets in repo; service adapters are swappable for backend.
- Location usage is explicit with user consent; allow “hide exact location” toggle on job post (UI stub).
- Authorization checks: manage-only for own jobs (UI enforced; service stubs respect userId in future).

Deliverables Review (Definition of Done)
- Components and utilities implemented per file list; typed with TS.
- Routing integrated; no dead routes; URL is source of truth for navigation and filters.
- Tests passing; manual mobile checks done; lint clean; CI build green.
- Analytics events implemented; basic dashboards/console logging acceptable for dev.
## Documentation Status Update (2025-11-29)
- Implementation State: 88% complete
- Highlights:
  - Jobs routes integrated in app; BottomNavigation navigates via routes
  - Stores for posting and discovery implemented with persistence
  - Proximity utilities and filter system active
- Known Gaps:
  - Validation schemas and test suites to expand
  - Map preview and shared LocationInput refinements pending
- Change Log:
  - 2025-11-29: Synchronized task list with current implementation; added status and change log
