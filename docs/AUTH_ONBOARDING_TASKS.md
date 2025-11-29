# Authentication & User Registration – Frontend Task Breakdown (Kombai Agent)

Purpose
- Provide a precise, implementation-ready task list focused on Authentication_User_Registration_Flow.md.
- Call out exact files to add/update, acceptance criteria, dependencies, and UI consistency rules.

Context Snapshot (what exists vs missing)
- Exists
  - src/components/auth/AuthenticationScreen.tsx (Google + Email placeholders; simulated flows)
  - src/components/onboarding/WelcomeScreen.tsx (present)
  - src/components/onboarding/OnboardingLayout.tsx, ProgressIndicator.tsx (present)
  - src/store/onboardingStore.ts (present)
  - src/theme/index.ts + feature themes (homepageTheme, communicationTheme, etc.)
- Missing (to implement)
  - Routing at the app root for multi-step onboarding (React Router v7 declarative)
  - Onboarding step screens: CategorySelectionScreen.tsx, ProfessionalTypeSelectionScreen.tsx,
    LocationSetupScreen.tsx, BasicProfileSetupScreen.tsx, ProfessionalDetailsScreen.tsx,
    AvailabilitySetupScreen.tsx, RegistrationCompleteScreen.tsx, StepNavigation.tsx
  - Utilities: registrationValidation.ts, locationServices.ts, fileUploadUtils.ts, analyticsEvents.ts
  - Real Google OAuth integration and session management glue

Design System and UI Consistency Rules (apply to all new/updated components)
- Use MUI v7 with project theme tokens: src/theme/index.ts palette, spacing, typography.
- Use styled() API from @mui/material/styles for component variants; avoid inline style objects.
- Spacing: theme.spacing(n); Radius: theme.shape.borderRadius; Shadows: theme.shadows[x].
- Colors: palette.primary/secondary/success/warning/error/info; greys from palette.grey.
- Loading: use MUI Skeleton or CircularProgress; Disabled states: set disabled and aria-disabled.
- Accessibility: label/id for inputs; aria-describedby for help/error; keyboard focus visible.
- Mobile-first: verify at 360–400px; ensure responsive using useMediaQuery where needed.

Epic A — Routing & App Shell
A1. Add router at root
- Files: main.tsx, src/App.GetMyGrapher.tsx
- Actions
  - Install React Router v7 (if not present) and configure declarative routes.
  - Define onboarding route group: /onboarding, /onboarding/category, /type, /location, /profile, /details, /availability, /complete.
  - Guard protected routes behind auth/session check (redirect to /auth when unauthenticated).
- Acceptance criteria
  - Navigating to each route renders the correct screen component within OnboardingLayout.
  - Back/Next navigation works via StepNavigation and preserves state.

A2. Wire providers at root
- Files: main.tsx
- Actions
  - Ensure <QueryClientProvider> wraps the app.
  - Provide <ThemeProvider> with theme from src/theme/index.ts and CssBaseline.
- Acceptance criteria
  - Hooks that rely on query client function across onboarding screens.

Epic B — Authentication
B1. Refine AuthenticationScreen (existing)
- Files: src/components/auth/AuthenticationScreen.tsx
- Actions
  - Separate UI and auth logic hooks.
  - Add proper error states, loading, and disabled transitions; keep Google primary.
  - On success, route to /onboarding/category and store minimal user info in onboardingStore.
- Acceptance criteria
  - UI follows design tokens; real-time field validation in email path; clear error messages.

B2. Google OAuth integration (stub → adapter)
- Files: src/services/auth/googleAuth.ts (new), src/store/appStore.ts (update)
- Actions
  - Create an adapter with functions: signInWithGoogle(), signOut(), getSession(), refreshSession().
  - Do not commit secrets; read from env; provide TODO for backend integration.
  - Store tokens in memory + fallback storage with secure flags (when available in web).
- Acceptance criteria
  - Swapping simulated call with adapter doesn’t change UI; ready for backend integration.

Epic C — Onboarding Framework
C1. StepNavigation component
- Files: src/components/onboarding/StepNavigation.tsx (new)
- Actions
  - Prev/Next buttons, Skip where applicable; disabled logic until validations pass.
  - Emits onPrev/onNext; shows current step label and count.
- Acceptance criteria
  - Keyboard accessible; responsive; uses theme buttons.

C2. Onboarding store extension
- Files: src/store/onboardingStore.ts (update)
- Actions
  - Add fields for: category, type, location {city, state, pincode, gps, radius, extras[]},
    profile {name, photoUrl, phone, email, gender, about, altPhone},
    details {experienceLevel, specializations[], pricing {type, baseRate, negotiable}, equipment[], instagram, portfolioLinks[]},
    availability {weeklyTemplate, blackoutDates[], preferences {leadTime, advanceWindow}, visibility}.
  - Add computed progress, canProceed(step), and draft persistence (localStorage via zustand persist).
- Acceptance criteria
  - Draft resume after refresh; computed progress reflects completed fields.

C3. Analytics events
- Files: src/utils/analyticsEvents.ts (new)
- Actions
  - Export functions to log events: registration_started, category_selected, professional_type_selected,
    location_setup_completed, profile_photo_uploaded, registration_completed, registration_abandoned.
- Acceptance criteria
  - Each step invokes analytics on successful completion.

Epic D — Onboarding Steps (Screens)
D1. CategorySelectionScreen.tsx (new)
- Files: src/components/onboarding/CategorySelectionScreen.tsx
- Actions
  - Show category cards (from enums) with icons; single-select; Continue disabled until selected.
  - Update onboardingStore.category; fire category_selected; navigate to /onboarding/type.
- Validation & AC
  - Exactly one selection required; card focus/selection visible; mobile layout supported.

D2. ProfessionalTypeSelectionScreen.tsx (new)
- Files: src/components/onboarding/ProfessionalTypeSelectionScreen.tsx
- Actions
  - Load types dynamically based on category; searchable list or selectable chips.
  - Update onboardingStore.type; navigate to /onboarding/location.
- Validation & AC
  - One type required; search accessible; consistent with theme.

D3. LocationSetupScreen.tsx (new)
- Files: src/components/onboarding/LocationSetupScreen.tsx
- Actions
  - GPS permission request with manual override; fields: city, state, pincode, radius; optional extra locations.
  - Use locationServices.ts to read/resolve coordinates; validate pincode (India) and radius.
- Validation & AC
  - Pincode: 6 digits; GPS failures show non-blocking help; proceed only with valid primary location.

D4. BasicProfileSetupScreen.tsx (new)
- Files: src/components/onboarding/BasicProfileSetupScreen.tsx
- Actions
  - Fields: name, photo upload, phone (+91), email (prefill), gender, about, alt phone.
  - Use fileUploadUtils.ts for image constraints; preview; error messaging.
- Validation & AC
  - Name 2–50 chars; phone Indian format; email valid; photo ≤5MB jpg/png.

D5. ProfessionalDetailsScreen.tsx (new)
- Files: src/components/onboarding/ProfessionalDetailsScreen.tsx
- Actions
  - Experience level (select), specializations (multi), pricing (type, baseRate, negotiable), optional equipment, instagram, portfolio links.
- Validation & AC
  - Pricing required; baseRate positive; specializations constrained by category.

D6. AvailabilitySetupScreen.tsx (new)
- Files: src/components/onboarding/AvailabilitySetupScreen.tsx
- Actions
  - Default weekly template editor; preferences: lead time, advance booking window; visibility toggle.
- Validation & AC
  - Save template to store; conflicts visually indicated; mobile calendar interactions usable.

D7. RegistrationCompleteScreen.tsx (new)
- Files: src/components/onboarding/RegistrationCompleteScreen.tsx
- Actions
  - Success summary; optional tutorial CTA; button to go to home.
- AC
  - All onboarding data present; analytics registration_completed fired.

Epic E — Utilities & Validation
E1. registrationValidation.ts (new)
- Files: src/utils/registrationValidation.ts
- Actions
  - Export validators: isValidName, isValidPhoneIndia, isValidEmail, isValidPincodeIndia,
    validateProfile(profile), validateLocation(location), validatePricing(details).
- AC
  - Reused across steps; unit tests for validators.

E2. locationServices.ts (new)
- Files: src/services/locationServices.ts
- Actions
  - getCurrentPosition(options), reverseGeocode(lat,lng) [stub], isLocationPermissionGranted().
  - Graceful error handling and timeouts.
- AC
  - Injectable and mockable for tests.

E3. fileUploadUtils.ts (new)
- Files: src/utils/fileUploadUtils.ts
- Actions
  - checkFileType(image), checkFileSize(image, maxMB), readFileAsDataURL(file), compressImage [TODO].
- AC
  - Returns friendly errors; used in BasicProfileSetup.

Epic F — State, Navigation, and Persistence Glue
F1. Connect StepNavigation to routing
- Files: OnboardingLayout.tsx, StepNavigation.tsx
- Actions
  - Use current step from route; enable/disable Next based on canProceed(step) from store.
- AC
  - URL is source of truth; refresh preserves step and data.

F2. Save/Resume onboarding drafts
- Files: onboardingStore.ts
- Actions
  - Persist partial state with timestamps and version; migration handler for future schema.
- AC
  - Returning users resume from last step; reset available from layout menu.

Epic G — QA, Testing, Accessibility
G1. Unit tests
- Files: tests for registrationValidation.ts, onboardingStore.ts (location in /__tests__/ or similar)
- AC
  - Core validators covered; store transitions tested.

G2. Integration tests
- Scope: Happy path across steps with mocked services; error/edge states (GPS denied, invalid file).
- AC
  - All critical paths green; no P1 accessibility blockers.

G3. Accessibility
- Actions
  - Form labels, aria-*, focus management between steps; color contrast meets AA.
- AC
  - Keyboard-only completion possible; screen reader announces step changes.

Implementation Order & Dependencies
1) Epic A (Routing, Providers)
2) Epic B (Auth glue) → Start Epic C (framework)
3) Epic D (steps D1→D7 in order)
4) Epic E (utilities can start in parallel with D1–D3)
5) Epic F (glue) and Epic G (tests, a11y) continuously

Acceptance Criteria Summary (global)
- All onboarding steps implement real-time field validation with error and help text.
- Draft persistence and resume from last completed step work across refreshes.
- UI conforms to theme and is responsive and accessible.
- Analytics events fire on step completion and final registration.

Security & Privacy Checklist (apply across tasks)
- Input sanitization, file type/size enforcement, no secrets in repo.
- Token/session handling isolated in adapter; logout clears sensitive data.
- Location: explicit permission request; clear user control and visibility settings.

Deliverables Review (DoD)
- Screens and utilities implemented per file list.
- Tests added and passing; manual mobile checks done.
- Routing integrated; no dead routes; lint clean; CI build green.
## Documentation Status Update (2025-11-29)
- Implementation State: 90% complete
- Highlights:
  - Onboarding route group implemented with nested steps
  - Google OAuth via Supabase integrated with session guard
  - All onboarding screens present with draft persistence
- Known Gaps:
  - Unit and E2E tests coverage not comprehensive
  - Additional accessibility QA and performance profiling pending
- Change Log:
  - 2025-11-29: Synchronized tasks with current codebase; updated routing and OAuth status; added status section
