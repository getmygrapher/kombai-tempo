# Community Posing Library – Frontend Task Breakdown (Kombai Agent)

Purpose
- Provide an implementation-ready task list focused on community_posing_library.md.
- Enforce proper routing (React Router v7) and UI consistency via MUI v7 theme tokens.
- Reuse existing components; extend or add only what’s missing to reach MVP parity with the flow.

Context Snapshot (what exists vs. missing)
- Exists (keep, enhance where noted)
  - Components:
    - src/components/community: 
      - CommunityPosingLibrary.tsx
      - CommunityLibraryBrowser.tsx
      - PoseDetailView.tsx
      - PoseGridItem.tsx
      - FilterBottomSheet.tsx
      - InteractionButtons.tsx
      - CommentsSection.tsx
      - CameraSettingsCard.tsx (referenced via App.CommunityPosingLibrary preview)
      - PhotographerInfo.tsx (referenced via App.CommunityPosingLibrary preview)
  - Types:
    - src/types/community.ts (DifficultyLevel, PoseCategory, LocationType, ModerationStatus, SortBy, SharePlatform, CommunityPose, PoseComment, etc.)
  - Services:
    - src/services/exifService.ts (EXIF extraction)
  - App shell/routing:
    - main.tsx (Router wrapper present)
    - src/App.GetMyGrapher.tsx (route /community → CommunityPosingLibrary)
  - Theme:
    - src/theme/index.ts (MUI v7 theme in use)
- Missing (to implement)
  - Routing:
    - /community route group with nested screens:
      - /community → redirects to /community/browse
      - /community/browse (grid + filters)
      - /community/pose/:id (pose details)
      - /community/contribute (wizard)
      - /community/moderation (moderation dashboard) [role-gated or dev-flag]
      - Optional: /community/mine (my contributions)
  - Contribution flow:
    - Upload + EXIF review + details + submit (multi-step wizard)
    - Draft persistence and validation utilities
  - Moderation UI:
    - Queue list and review interface with status transitions
  - Realtime:
    - Stub subscriptions for comments/interactions and moderation updates
  - Services (stubs):
    - communityService.ts (browsing, details, interactions, comments, contribution, moderation)
  - Store:
    - communityStore.ts (Zustand): browsing state, contribution draft, moderation queue, realtime handlers

Design System and UI Consistency Rules (apply to all new/updated components)
- Use MUI v7 with project theme tokens from src/theme/index.ts.
- Styling: use styled() and sx with theme values; no hardcoded colors.
  - Colors: theme.palette.primary/secondary/info/success/warning/error and palette.grey.
  - Spacing: theme.spacing(n)
  - Typography: theme.typography variants
  - Radius: theme.shape.borderRadius
  - Shadows: theme.shadows[x]
- Accessibility:
  - Form labels/ids; aria-* attributes; focus ring visible; keyboard navigable.
- Responsiveness:
  - Mobile-first (360–400px) and scalable to tablet/desktop via responsive MUI Grid/Stack.
- Loading/Empty/Error:
  - Use MUI Skeleton, CircularProgress, Alert as appropriate.

Epic A — Routing & App Shell
A1. Add Community route group (React Router v7, declarative)
- Files: main.tsx, src/App.GetMyGrapher.tsx
- Actions
  - Define nested routes:
    - /community → redirect to /community/browse
    - /community/browse → CommunityLibraryPage (wraps CommunityLibraryBrowser + FilterBottomSheet)
    - /community/pose/:id → PoseDetailPage (wraps PoseDetailView + CameraSettingsCard + CommentsSection)
    - /community/contribute → ContributionWizard (multi-step: upload → EXIF review → pose details → review & submit)
    - /community/moderation → ModerationDashboard (queue + detail review)
    - Optional: /community/mine → MyContributionsPage (list, statuses)
  - Guard: redirect unauthenticated users to /onboarding/welcome (match app standard).
  - Bottom navigation: “Community” tab routes to /community/browse and preserves active highlighting.
- Acceptance criteria
  - Navigating to each community route renders correct screen in app layout.
  - /community redirects to /community/browse.
  - Deep links to /community/pose/:id render the pose with valid loading states.

A2. Community layout scaffolding
- Files: src/components/community/layout/CommunityLayout.tsx (new)
- Actions
  - Provide page title area, optional filter bar slot, content container with theme spacing.
  - Reuse app-level ThemeProvider and CssBaseline; no duplicate providers.
- Acceptance criteria
  - Layout consistent with rest of app sections (padding, background, typography).

Epic B — Library Browser & Discovery
B1. CommunityLibraryPage.tsx
- Files: src/pages/community/CommunityLibraryPage.tsx (new)
- Actions
  - Compose CommunityLibraryBrowser + FilterBottomSheet; bind to store filters and query service.
  - Sorting: recent/popular/trending; pagination or infinite scroll (stub).
  - Empty state, skeleton loading, error state.
- Acceptance criteria
  - Filters and sorting update the list; URL can reflect query state (optional).
  - Uses MUI tokens consistently.

B2. Filter system integration
- Files: src/components/community/FilterBottomSheet.tsx (update), src/store/communityStore.ts (new)
- Actions
  - Define filter model in store (categories, difficulty, people_count range, location_type, search, sortBy).
  - Wire apply/clear actions; keep UX consistent with app filters in other modules.
- Acceptance criteria
  - Applying filters refreshes results; clear resets to defaults.

Epic C — Pose Detail & Interactions
C1. PoseDetailPage.tsx
- Files: src/pages/community/PoseDetailPage.tsx (new)
- Actions
  - Compose PoseDetailView + CameraSettingsCard + PhotographerInfo + CommentsSection.
  - Surface moderation status badge if not approved (pending/flagged) for owner/moderator.
- Acceptance criteria
  - Details load via communityService.getPoseById; robust loading/error states.

C2. Interactions wiring
- Files: src/components/community/InteractionButtons.tsx (update), src/services/communityService.ts (new), src/store/communityStore.ts (update)
- Actions
  - Actions: like, save, share, open comment focus; update counters optimistically; handle errors.
- Acceptance criteria
  - Like/Save button states persist across navigation within the session (store-backed).

C3. Comments integration
- Files: src/components/community/CommentsSection.tsx (update), src/services/communityService.ts (update)
- Actions
  - loadComments(poseId), addComment(poseId, text), optional subscribeToComments(poseId) [stub].
- Acceptance criteria
  - New comment appears at top; scroll/focus management accessible.

Epic D — Contribution Wizard (Upload → EXIF → Details → Review & Submit)
D1. ContributionWizard container
- Files: src/pages/community/ContributionWizard.tsx (new)
- Actions
  - Stepper with 4 steps; route-friendly (single page OK for MVP).
  - Persist draft in store (zustand persist) with timestamps.
- Acceptance criteria
  - Progress saved on refresh; validation gating per step.

D2. Steps
- Files:
  - src/components/community/contribute/ContributionUploadStep.tsx (new)
  - src/components/community/contribute/EXIFReviewStep.tsx (new)
  - src/components/community/contribute/PoseDetailsStep.tsx (new)
  - src/components/community/contribute/ReviewAndSubmitStep.tsx (new)
- Actions
  - UploadStep: image picker, constraints (type: jpg/png, size ≤ 5MB), preview.
  - EXIFReviewStep: use exifService to extract; allow manual override; show success/failure flags.
  - PoseDetailsStep: posing_tips, difficulty_level, people_count, category, mood_emotion, equipment, lighting_setup, story_behind.
  - ReviewAndSubmitStep: summary; submitForReview → ModerationStatus.PENDING.
- Acceptance criteria
  - Validation utilities enforce required fields and constraints; friendly errors via MUI.
  - On submit, user sees confirmation and can navigate to “My Contributions”.

D3. Validation utilities
- Files: src/utils/communityContributionValidation.ts (new)
- Actions
  - Validators: isValidTitle, isValidTips, isValidPeopleCount, isValidCategory, isValidDifficulty, isValidImageFile.
- Acceptance criteria
  - Unit tests for validators; reused across steps.

Epic E — Moderation UI
E1. ModerationDashboard
- Files:
  - src/pages/community/ModerationDashboard.tsx (new)
  - src/components/community/moderation/ModerationQueueList.tsx (new)
  - src/components/community/moderation/ModerationDetailDrawer.tsx (new)
- Actions
  - List submissions with status (pending/approved/rejected/flagged), filters by status/date/user.
  - Detail drawer: view image, metadata, EXIF, context; actions approve/reject with feedback; flag/unflag.
  - Badge/status chips consistent with theme; role-gate behind feature flag or simple “moderatorMode” toggle.
- Acceptance criteria
  - Status transitions reflected immediately in list; snackbar confirmations.

E2. Reporting flow (from pose detail)
- Files: src/components/community/ReportPoseModal.tsx (new), PoseDetailView.tsx (update)
- Actions
  - Allow users to report inappropriate content; modal collects reason; stub submission to moderation.
- Acceptance criteria
  - Report sets “flagged” state on pose and surfaces moderation status clearly.

Epic F — Services & APIs (stubs)
F1. communityService
- Files: src/services/communityService.ts (new)
- Actions (all mocked with delays; no backend calls):
  - listPoses(filters, pagination)
  - getPoseById(poseId)
  - likePose(poseId), savePose(poseId), sharePose(poseId, platform)
  - listComments(poseId), addComment(poseId, text)
  - submitContribution(contributionDraft) → returns submission with ModerationStatus.PENDING
  - getMyContributions(userId)
  - getModerationQueue(filters), reviewPose(poseId, decision, feedback)
  - subscribeToComments(poseId, cb) [stub], subscribeToModeration(cb) [stub]
- Acceptance criteria
  - Methods typed with src/types/community.ts; error paths handled; easily swappable for backend.

F2. EXIF integration
- Files: src/services/exifService.ts (existing), EXIFReviewStep.tsx (new)
- Actions
  - Use exifService to extract; reflect exif_extraction_success in UI and contribution draft; provide manual override.
- Acceptance criteria
  - Accurate mapping to camera fields; clear manual override indication.

Epic G — State Store (Zustand)
G1. communityStore
- Files: src/store/communityStore.ts (new)
- Actions
  - State slices:
    - browse: filters, sortBy, list, pagination, loading, error
    - detail: pose, comments, interactions
    - contributionDraft: image, exif, details, progress, validationErrors
    - moderation: queue, filters, selectedSubmission
    - realtime: isConnected, lastEvent timestamps
  - Actions/selectors for each slice; persist draft with version key.
- Acceptance criteria
  - Store drives UI for routes; draft survives refresh; selectors optimize re-renders.

Epic H — Realtime & Notifications (stubs)
H1. Realtime subscriptions (optional, mocked)
- Files: src/services/communityService.ts (update), src/store/communityStore.ts (update)
- Actions
  - Provide subscribe/unsubscribe methods that push mock updates to comments and moderation statuses.
- Acceptance criteria
  - UI reflects incoming mock updates without refresh; unsubscribes on unmount.

Epic I — QA, Testing, Accessibility
I1. Unit tests
- Files: tests for communityContributionValidation.ts, communityStore slice reducers (if split), and small service stubs.
- Acceptance criteria
  - Validators and core store logic covered.

I2. Integration tests
- Scope:
  - Contribution happy path (upload → exif → details → submit PENDING)
  - Browsing filters/sort
  - Pose detail interactions (like/save/comment)
  - Moderation approve/reject
- Acceptance criteria
  - Critical paths green; loading/error states verified.

I3. Accessibility
- Actions
  - Verify keyboard traversal in wizard and filters; labels and descriptions on all inputs; focus management on dialog open/close; color contrast AA.
- Acceptance criteria
  - Keyboard-only flow possible; screen reader announces step and status changes.

Routing Changes (implementation notes)
- src/App.GetMyGrapher.tsx
  - Add nested routes for /community/browse, /community/pose/:id, /community/contribute, /community/moderation (guard).
  - Keep existing /community route but redirect it to /community/browse.
- main.tsx
  - Ensure /community resolves correctly with redirect to /community/browse (mirroring existing /availability redirect).

Security & Privacy Checklist (apply across tasks)
- Input sanitization for comments and forms.
- Image file constraints (type/size) enforced client-side; do not expose secrets.
- Clear moderation status surfacing; reporting flow non-abusive and rate-limited (stub note).
- Respect future backend-driven visibility rules in detail pages (owner vs public view).

Implementation Order & Dependencies
1) Epic A (Routing & Layout)
2) Epic F (Service stubs) + Epic G (Store)
3) Epic B (Browse) and Epic C (Detail & interactions)
4) Epic D (Contribution wizard)
5) Epic E (Moderation UI)
6) Epic H/I (Realtime stubs, tests, accessibility)

Deliverables Review (DoD)
- Routes added and integrated; no dead links.
- New/updated components and services listed above under src/pages/community/*, src/components/community/*, src/services/*, src/store/*.
- Store with typed actions/selectors and persisted contribution draft.
- Theming consistent via MUI v7 tokens; responsive and accessible UI.
- Tests created; basic screenshots of wizard steps, detail page, moderation dashboard.
## Documentation Status Update (2025-11-29)
- Implementation State: 88% complete
- Highlights:
  - Community browsing, pose detail, interactions, and comments implemented
  - Supabase realtime wired for comments/likes; EXIF extraction service active
  - Routing group `/community/*` present with browse and detail pages
- Known Gaps:
  - Contribution wizard and moderation dashboard require final polish
  - Test coverage and accessibility checks to be expanded
- Change Log:
  - 2025-11-29: Synchronized tasks with implemented community features; added status and change log
