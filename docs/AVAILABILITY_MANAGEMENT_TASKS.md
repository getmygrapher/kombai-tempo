# Availability Management – Frontend Task Breakdown (Kombai Agent)

Purpose
- Provide an implementation-ready task list focused on Availability_Management_System_Flow.md.
- Enforce proper routing (React Router v7) and UI consistency via MUI v7 theme tokens.
- Reuse existing components; extend or add only what’s missing to reach MVP parity with the flow.

Context Snapshot (what exists vs. missing)
- Exists (keep, enhance where noted)
  - Components: `src/components/availability/AvailabilityCalendar.tsx`, `DateCell.tsx`, `TimeSlotSelector.tsx`, `RecurringPatternManager.tsx`
  - Store: `src/store/availabilityStore.ts`
  - Types: `src/types/availability.ts`
  - Privacy controls: `src/components/availability/CalendarPrivacyControls.tsx` (or similarly named)
  - Basic stats: `src/components/availability/AvailabilityStats.tsx` (if present per audit)
- Missing (to implement)
  - Routing: `/availability` route group with nested screens
  - Calendar scaffolding: `CalendarHeader.tsx`, `CalendarLegend.tsx`
  - Interaction: `QuickAvailabilityActions.tsx`, `BulkAvailabilityEditor.tsx`, `AvailabilityPresets.tsx`, `AvailabilityManager.tsx`
  - Recurring flow: `PatternWizard.tsx`, `PatternPreview.tsx`, `PatternExceptions.tsx` (wire with `RecurringPatternManager.tsx`)
  - Booking integration: `BookingAvailabilityBridge.tsx`, `BookingConflictResolver.tsx`, `AvailabilityBookingStatus.tsx`, `BookingCalendarOverlay.tsx`
  - Privacy & visibility: `AvailabilityPrivacyDashboard.tsx`, `VisibilityPreview.tsx`, `AccessControlManager.tsx` (enhance existing `CalendarPrivacyControls.tsx`)
  - Services: `services/availabilityService.ts` (stub endpoints and adapters), realtime sync stub
  - Utilities: `utils/availabilityValidation.ts` (validators), `components/availability/CalendarExport.tsx`, `CalendarImport.tsx`, `CalendarSync.tsx`, `AvailabilityAnalytics.tsx`
  - Notifications: `AvailabilityNotifications.tsx` (preferences UI, hooks)

Design System & UI Consistency
- MUI v7 with theme tokens from `src/theme/index.ts`.
- Spacing: theme.spacing(n). Radius: theme.shape.borderRadius. Shadows: theme.shadows[x].
- Colors: palette.primary/secondary/success/warning/error/info/grey. No hardcoded colors.
- Typography: theme.typography variants; use consistent headings/subtitles.
- Loading: Skeletons/CircularProgress. Disabled states: disabled and aria-disabled set.
- Accessibility: keyboard navigable calendar/grid, ARIA roles/labels, focus rings, proper tab order.
- Mobile-first: verify 360–400px; avoid horizontal scroll; use responsive layout utilities.

Epics & Tasks

Epic A — Routing & App Shell for Availability
A1. Add Availability route group (React Router v7, declarative)
- Files: `main.tsx`, `src/App.GetMyGrapher.tsx`
- Actions
  - Introduce route group:
    - `/availability` → redirects to `/availability/calendar`
    - `/availability/calendar` (default calendar view)
    - `/availability/manage` (actions + slot editor orchestration)
    - `/availability/patterns` (recurring templates)
    - `/availability/privacy` (visibility and privacy)
    - `/availability/bookings` (booking status overlay/testing) [optional]
  - Guard route (if needed) with session check; redirect to `/auth` if unauthenticated.
- Acceptance criteria
  - Navigating to each route renders the correct screen in a shared Availability layout.
  - Bottom navigation “Calendar” tab routes to `/availability/calendar`.

A2. Providers at root
- Files: `main.tsx`
- Actions
  - Ensure `<QueryClientProvider>` and `<ThemeProvider>` + `<CssBaseline>` wrap app.
- Acceptance criteria
  - Data hooks and theming behave consistently across availability screens.

Epic B — Calendar UI & Interactions
B1. CalendarHeader.tsx
- Files: `src/components/availability/CalendarHeader.tsx`
- Actions
  - Props:
    - `currentDate: Date`
    - `onNavigate(direction: 'prev' | 'next'): void`
    - `onToday(): void`
    - `viewMode: 'month' | 'week'`
    - `onViewModeChange(mode: 'month' | 'week'): void`
  - Include action buttons: Add Availability, Bulk Actions.
- AC
  - Mobile-friendly header; accessible buttons; uses theme tokens only.

B2. DateCell.tsx enhancements
- Files: `src/components/availability/DateCell.tsx` (update)
- Actions
  - Show color-coded status: green (available), yellow (partial), red (unavailable), blue (booked), grey (past).
  - Mini time-slot indicators; selected/hover states; booking count badge.
- AC
  - Visual contrast meets AA; keyboard focus visible.

B3. CalendarLegend.tsx
- Files: `src/components/availability/CalendarLegend.tsx`
- Actions
  - Display legend with color chips and labels matching system spec.
- AC
  - Used in calendar footer or side area; hides on small screens if space constrained.

B4. AvailabilityCalendar.tsx enhancements
- Files: `src/components/availability/AvailabilityCalendar.tsx` (update)
- Actions
  - Support single/multi date selection, drag range (desktop), tap-to-extend (mobile).
  - Integrate header, legend, and quick actions entry.
- AC
  - Smooth navigation across months; performance acceptable on low-end devices.

B5. TimeSlotSelector.tsx upgrades
- Files: `src/components/availability/TimeSlotSelector.tsx` (update)
- Actions
  - Range selection via drag, presets (Morning/Afternoon/Evening), granularity options (30m [Pro, stub], 1h [default], 2h, 4h).
  - Props align with doc; respect operating hours (6:00–23:00).
- AC
  - Ensures no overlap; displays validation errors with helper text.

Epic C — Quick Actions & Bulk Editing
C1. QuickAvailabilityActions.tsx
- Files: `src/components/availability/QuickAvailabilityActions.tsx`
- Actions
  - Buttons: Mark Available, Mark Unavailable, Copy From Date, Clear Selection.
- AC
  - Emits actions to store; disabled until selection exists; ARIA labels present.

C2. BulkAvailabilityEditor.tsx
- Files: `src/components/availability/BulkAvailabilityEditor.tsx`
- Actions
  - Controls: Select All, Weekdays, Weekends, Custom Pattern (invoke presets).
- AC
  - Efficient multi-date operations; undo via store rollback if failure.

C3. AvailabilityPresets.tsx
- Files: `src/components/availability/AvailabilityPresets.tsx`
- Actions
  - Provide reusable presets (e.g., 9–5 M-F).
- AC
  - Applied consistently across month/week; preview before apply.

C4. AvailabilityManager.tsx (orchestrator)
- Files: `src/components/availability/AvailabilityManager.tsx`
- Actions
  - Hosts Calendar, QuickActions, BulkEditor, SlotSelector cohesive UI.
- AC
  - Used by `/availability/manage`; responsive layout.

Epic D — Recurring Patterns
D1. RecurringPatternManager.tsx upgrades
- Files: `src/components/availability/RecurringPatternManager.tsx` (update)
- Actions
  - Integrate with wizard/preview/exceptions below; list patterns; enable/disable/pause.
- AC
  - Patterns can be created, edited, deleted; status chip shows active/inactive.

D2. PatternWizard.tsx
- Files: `src/components/availability/PatternWizard.tsx`
- Actions
  - Steps: Type selection → Weekly schedule → Date range → Exceptions → Review & Apply.
- AC
  - Validates schedule; applies to store; shows success Snackbar.

D3. PatternPreview.tsx
- Files: `src/components/availability/PatternPreview.tsx`
- Actions
  - Visualize how pattern affects selected date range; rollback option.
- AC
  - Performance acceptable for multiple months in range (stub server apply).

D4. PatternExceptions.tsx
- Files: `src/components/availability/PatternExceptions.tsx`
- Actions
  - Add/remove exception dates; annotate notes.
- AC
  - Exceptions override pattern application.

Epic E — Booking Integration
E1. BookingAvailabilityBridge.tsx
- Files: `src/components/availability/BookingAvailabilityBridge.tsx`
- Actions
  - Reacts to booking state changes to update availability (tentative/confirmed/cancelled).
- AC
  - Simulated integration; optimistic updates; visible status indicators.

E2. BookingConflictResolver.tsx
- Files: `src/components/availability/BookingConflictResolver.tsx`
- Actions
  - UI to resolve overlaps: auto-decline, manual resolve, flexible adjust, waitlist stub.
- AC
  - Presents clear options; emits store actions; shows warnings.

E3. AvailabilityBookingStatus.tsx and BookingCalendarOverlay.tsx
- Files: `src/components/availability/AvailabilityBookingStatus.tsx`, `src/components/availability/BookingCalendarOverlay.tsx`
- Actions
  - Show booking chips/overlays over dates and slots; filter booked vs available.
- AC
  - Legend updated; accessible labels (e.g., “Booked: 2 slots, 10:00–12:00”).

Epic F — Privacy & Visibility
F1. CalendarVisibilityControls.tsx upgrade
- Files: `src/components/availability/CalendarVisibilityControls.tsx` (update)
- Actions
  - Support: Public, Professional Network, Private (Pro), Contacts Only; toggles for show partial availability and allow booking requests.
- AC
  - Enforced via store on views; Persisted; success Snackbar.

F2. AvailabilityPrivacyDashboard.tsx
- Files: `src/components/availability/AvailabilityPrivacyDashboard.tsx`
- Actions
  - Summary of current privacy settings; access log (stub), recommendations (static).
- AC
  - Used by `/availability/privacy`; responsive cards.

F3. VisibilityPreview.tsx, AccessControlManager.tsx
- Files: `src/components/availability/VisibilityPreview.tsx`, `src/components/availability/AccessControlManager.tsx`
- Actions
  - Preview how others see calendar; manage explicit allowed users (stub).
- AC
  - Clear differences in views by visibility level.

Epic G — Services & APIs (stubs)
G1. AvailabilityService
- Files: `src/services/availabilityService.ts`
- Actions
  - Methods:
    - `getAvailability(userId, dateRange)`
    - `updateAvailability(availabilityUpdate)`
    - `setTimeSlots(date, slots)`, `getTimeSlots(date)`
    - `saveRecurringPattern(pattern)`, `applyPattern(patternId, dateRange)`
    - `syncBookings()`, `handleBookingConflict(conflict)`
    - `updatePrivacySettings(settings)`
  - All mocked with latency; ready to swap to backend.
- AC
  - Centralized adapter; no secrets committed.

G2. Realtime Sync (stub)
- Files: `src/services/availabilityRealtime.ts` (optional)
- Actions
  - Event subscribers for booking updates and availability changes.
- AC
  - Pluggable; no hard dependency for UI tests.

G3. Export/Import/Sync helpers
- Files: `src/components/availability/CalendarExport.tsx`, `CalendarImport.tsx`, `CalendarSync.tsx`
- Actions
  - Stubs with disabled Pro-only actions; basic dialogs and placeholders.
- AC
  - Clearly labeled as coming soon; not blocking MVP.

Epic H — State Management (Zustand) updates
H1. Expand availabilityStore
- Files: `src/store/availabilityStore.ts` (update)
- Data
  - `calendarData: CalendarEntry[]`
  - `selectedDates: Date[]`
  - `currentViewDate: Date`
  - `timeSlots: TimeSlot[]`
  - `selectedTimeSlots: TimeSlot[]`
  - `operatingHours: { start: string; end: string }`
  - `recurringPatterns: RecurringPattern[]`
  - `activePattern: RecurringPattern | null`
  - `bookings: Booking[]`
  - `conflicts: BookingConflict[]`
  - `privacySettings: CalendarPrivacySettings`
- Actions
  - `setAvailability(dates, slots)`
  - `updateTimeSlot(slot)`
  - `applyRecurringPattern(pattern)`
  - `handleBookingUpdate(booking)`
  - `updatePrivacySettings(settings)`
  - `loadCalendar(userId, dateRange)` and `saveCalendar()`
- Persistence
  - Persist selected settings and drafts; optimistic updates with rollback.
- AC
  - Types aligned with `src/types/availability.ts`; unit-tested transitions.

Epic I — Analytics & Notifications
I1. AvailabilityAnalytics.tsx
- Files: `src/components/availability/AvailabilityAnalytics.tsx`
- Actions
  - Cards: availability utilization %, booked hours, conflicts resolved; simple line chart stub.
- AC
  - Loads mock data; no blocking backend dependency.

I2. AvailabilityNotifications.tsx
- Files: `src/components/availability/AvailabilityNotifications.tsx`
- Actions
  - Preference toggles (booking requests, reminders, conflicts, weekly report, email/push).
- AC
  - Wired to `privacySettings.notificationPreferences` in store.

Epic J — Validation & Business Logic
J1. Validation utilities
- Files: `src/utils/availabilityValidation.ts` (new) or extend `availabilityFormatters.ts`
- Actions
  - Validate: no past dates; date range limit (≤ 6 months); lead time; hours within 06:00–23:00; min 1h; max 12h continuous; automatic break insertion guidance.
- AC
  - Reused in calendar, bulk editor, patterns; unit tests included.

J2. Conflict validation
- Files: store/services integration
- Actions
  - Detect slot overlap; prevent availability marking over confirmed bookings; warn on tentative.
- AC
  - User receives clear, actionable errors.

Epic K — Testing & Accessibility
K1. Unit tests
- Scope
  - Components: CalendarHeader, DateCell, TimeSlotSelector, QuickAvailabilityActions
  - Store: actions/reducers; recurring pattern apply/rollback
  - Validators: edge cases for time ranges and dates
- AC
  - >80% coverage on core logic; zero P1/P2 test failures.

K2. Integration tests
- Scope
  - Set availability flow; apply recurring pattern; resolve conflict; privacy changes
- AC
  - Happy paths green; key error paths covered.

K3. Accessibility
- Actions
  - Calendar grid uses appropriate roles/labels; focus management; keyboard selection of dates/slots.
- AC
  - Keyboard-only completion feasible; screen readers announce state changes.

Implementation Order & Dependencies
1) Epic A (Routing/Providers) — unlocks deep-linking and screen composition
2) Epic H (Store expansions) — enables consistent data flows
3) Epics B–C (Calendar UI and bulk actions)
4) Epic D (Recurring patterns)
5) Epic E (Booking integration UI + conflict resolution)
6) Epic F (Privacy & visibility)
7) Epics G, I, J (Services stubs, analytics, validation) in parallel
8) Epic K (Testing & Accessibility) ongoing

Acceptance Criteria (global)
- All calendar interactions adhere to validation rules and provide clear feedback.
- Proper routing for `/availability/*` with back/forward navigation preserved.
- UI conforms strictly to theme tokens; responsive on mobile; no horizontal scroll at 360px.
- State updates are optimistic with rollback on simulated failures; persistence for key preferences.
- Accessibility: keyboard nav, ARIA, focus states; color contrast meets AA.

Security & Privacy Checklist
- Input sanitization for notes/labels; no inline HTML injection risk.
- Time slot and booking state transitions validated in store (no illegal transitions).
- Privacy levels enforced at view boundaries; sensitive info hidden as configured.
- No secrets in repository; service adapters are swappable and environment-driven.

Deliverables
- New/updated components and services listed above under `src/components/availability/*`, `src/services/*`.
- Store (`src/store/availabilityStore.ts`) extended with typed actions/selectors.
- Utilities: validators added; export/import/sync stubs present.
- Tests for validators and store; screenshots of calendar, bulk editor, patterns, privacy dashboard, booking overlay.
## Documentation Status Update (2025-11-29)
- Implementation State: 92% complete
- Highlights:
  - Routing group `/availability/*` active; layout and providers wired
  - Store expanded; booking and privacy flows integrated
  - Core UI (header, legend, quick actions, bulk editor) functional
- Known Gaps:
  - Broader test coverage and accessibility verification needed
  - External calendar sync/export/import pending backend
- Change Log:
  - 2025-11-29: Tasks aligned with implemented components; added status and change log
