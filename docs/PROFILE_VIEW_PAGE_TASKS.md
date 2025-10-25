# Profile View Page – Frontend Task Breakdown (Kombai Agent)

Purpose
- Provide a precise, implementation-ready task list modeled on AUTH_ONBOARDING_TASKS.md, focused on the Profile View Page System Flow.
- Ensure proper routing (React Router v7) and strict UI consistency across the app using the existing theme and component patterns.
- Leverage existing components and stores; add only what’s missing.

Source Document
- See: Profile_View_Page_System_Flow.md

Scope
- Public profile view with nested tab routes: Overview, Portfolio, Equipment, Reviews, Availability.
- Mobile and desktop-optimized layouts.
- Contact and actions (message, call with consent, share, report).
- Pricing and availability display with quick booking stub.
- Privacy/visibility gating.
- Analytics and tracking.
- Accessibility and performance.

Context Snapshot (what exists vs missing)
Existing (extend, do not rewrite)
- Components (view layer)
  - src/components/profile: 
    - ProfileViewContainer.tsx, EnhancedProfileViewContainer.tsx, ProfileNavigation.tsx
    - PortfolioGallery.tsx, ImageLightbox.tsx, ReviewsSection.tsx, ContactActions.tsx, ProfileOverview.tsx
  - Availability widgets (for integration):
    - src/components/availability/* (AvailabilityCalendar.tsx, TimeSlotSelector.tsx, etc.)
- Data & Hooks
  - src/hooks/useProfileView.ts
  - src/data/profileViewSystemMockData.ts
- State
  - src/store/profileViewStore.ts
- Theme
  - src/theme/index.ts

Missing (to implement)
- Proper routing with nested routes for /profile/:id and tab URLs.
- PrivacyGate.tsx (viewer-based content visibility).
- PricingDisplay.tsx (public pricing card).
- BookingWidget.tsx (quick booking; stubbed flows).
- ContactCard.tsx (centralized contact + actions panel).
- ShareModal.tsx and ReportModal.tsx (stubs).
- MobileProfileView.tsx and optional DesktopProfileView.tsx (or SidebarLayout.tsx) for adaptive layouts.
- Analytics for profile view, tab navigation, and action conversions.
- Route loaders, skeletons, error/empty states with consistent patterns.
- A11y coverage (ARIA, keyboard nav, focus management).
- Performance & image handling polish (lazy-loading, responsive images).

Design System and UI Consistency Rules (apply to all new/updated components)
- Use MUI v7 with src/theme/index.ts tokens (palette, spacing, typography).
- Use styled() from @mui/material/styles for variants; avoid inline style objects.
- Spacing: theme.spacing(n); Radius: theme.shape.borderRadius; Shadows: theme.shadows[x].
- Colors: palette.primary/secondary/success/warning/error/info; greys from palette.grey.
- Loading: use Skeleton and/or CircularProgress; disabled states with aria-disabled.
- Accessibility: labels and aria-* attributes; keyboard focus visible; focus management in modals.
- Mobile-first layout; confirm at 360–400px width; use useMediaQuery breakpoints.

Epics & Tasks

Epic A — Routing & Data Loading
A1. Add profile view route group (React Router v7)
- Files: main.tsx, src/App.GetMyGrapher.tsx
- Actions
  - Introduce nested routes:
    - /profile/:id -> ProfileViewContainer (layout)
      - index -> Overview tab
      - /profile/:id/portfolio
      - /profile/:id/equipment
      - /profile/:id/reviews
      - /profile/:id/availability
  - Use route-based code-splitting (lazy and Suspense fallbacks).
  - Ensure BottomNavigation triggers navigation by route (not only store state).
- Acceptance criteria
  - Direct links to any tab work (e.g., /profile/123/portfolio).
  - Tab clicks update URL and preserve browser history (Back/Forward).
  - Route refresh restores tab and data.

A2. Route loaders and not-found handling
- Files: src/App.GetMyGrapher.tsx, src/hooks/useProfileView.ts (update)
- Actions
  - On route match, load profile data by :id (mock via profileViewSystemMockData initially).
  - Provide errorElement or not-found fallback when profile isn’t available.
  - Show skeletons during loading; meaningful empty states.
- Acceptance criteria
  - 404 renders a friendly “Profile not found” with CTA to go back.
  - Loading and error states are theme-consistent and accessible.

Epic B — State Management (Zustand) and Hooks
B1. Extend profileViewStore.ts
- Files: src/store/profileViewStore.ts
- Actions
  - Add slices for:
    - profile: data, loading, error
    - viewerPermissions: canViewContact, canViewInstagram, canViewAvailability, canViewEquipment, canViewPricing
    - ui: activeTab, isContactModalOpen, isShareOpen, isReportOpen
  - Actions: loadProfile(id), setActiveTab(tab), setViewerPermissions(perms), open/close modals.
- Acceptance criteria
  - Store derives permissions from profile tier + viewer state; selectors typed and memoized.

B2. useProfileView.ts route integration
- Files: src/hooks/useProfileView.ts
- Actions
  - Read :id from params; call store.loadProfile(id) with caching strategy.
  - Prefetch adjacent tab data when appropriate (e.g., portfolio on Overview view).
- Acceptance criteria
  - Smooth tab switches; no redundant network/mock calls; cache TTL is configurable.

Epic C — Core Layout & Navigation
C1. ProfileViewContainer.tsx (update)
- Files: src/components/profile/ProfileViewContainer.tsx
- Actions
  - Convert to a route layout using Outlet for tabs.
  - Integrate ProfileNavigation with route-aware active tab.
  - Add top skeleton placeholders for header while loading.
- Acceptance criteria
  - URL is source of truth; active tab syncs with route; skeletons consistent with theme.

C2. ProfileNavigation.tsx (update)
- Files: src/components/profile/ProfileNavigation.tsx
- Actions
  - Turn internal tab clicks into <Link> navigation to child routes.
  - Preserve accessibility (role="tablist", aria-selected, keyboard nav).
- Acceptance criteria
  - Keyboard-accessible; ARIA attributes correct; deep-linking works.

Epic D — Tab Content
D1. Overview tab (refine)
- Files: src/components/profile/ProfileOverview.tsx (update or split sections)
- Actions
  - Ensure AboutSection + key stats + badges + quick availability status.
  - Consistent Paper sections with sx={{ p: 3 }}; responsive columns.
- Acceptance criteria
  - Clear hierarchy; mobile-friendly; matches theme tokens.

D2. Portfolio tab
- Files: src/components/profile/PortfolioGallery.tsx (update), src/components/profile/ImageLightbox.tsx (update, if needed)
- Actions
  - Lazy-load images with responsive sizes; empty state when no items.
  - Gate Instagram feed (Pro) within PrivacyGate (see Epic F).
- Acceptance criteria
  - Fast image load; lightbox ARIA-compliant; gated content respects permissions.

D3. Equipment tab
- Files: src/components/profile/EquipmentShowcase.tsx (new)
- Actions
  - Summarize equipment categories (camera, lenses, lighting, support, other).
  - Reuse existing equipment models; add empty/limited states.
- Acceptance criteria
  - Clear grouping, responsive grid, accessible headings per category.

D4. Reviews tab
- Files: src/components/profile/ReviewsSection.tsx (update), src/components/profile/RatingBreakdown.tsx (new, optional)
- Actions
  - Provide rating distribution chart (static or simple bars).
  - Filters (e.g., by rating) can be stubbed; ensure pagination or “load more.”
- Acceptance criteria
  - Good readability on mobile; keyboard navigable list.

D5. Availability tab
- Files: src/components/profile/AvailabilityWidget.tsx (new)
- Actions
  - Read-only calendar view with legend; show quick availability summary.
  - CTA “Book Now” to open BookingWidget (Epic G).
- Acceptance criteria
  - Color legend consistent with app; calendar keyboard/accessibility baseline.

Epic E — Contact & Actions
E1. ContactCard.tsx (new) and ActionButtons.tsx (new or reuse from ContactActions.tsx)
- Files: src/components/profile/ContactCard.tsx, src/components/profile/ActionButtons.tsx
- Actions
  - Centralize message/call/book/share/report actions; use consistent button variants.
  - Integrate with communication flow: open conversation with prefilled template stub.
- Acceptance criteria
  - Buttons have aria-labels; disabled states reflect permissions.

E2. ShareModal.tsx and ReportModal.tsx (new)
- Files: src/components/profile/ShareModal.tsx, src/components/profile/ReportModal.tsx
- Actions
  - Basic modal structure; stub handlers; clear accessibility labeling and focus trap.
- Acceptance criteria
  - Modals accessible; keyboard-only operation works.

Epic F — Privacy & Visibility
F1. PrivacyGate.tsx (new)
- Files: src/components/profile/PrivacyGate.tsx
- Actions
  - Render children based on viewerPermissions and profile tier.
  - Provide consistent gated UI (mask or inline callout) with CTA (e.g., “Sign in” or “Upgrade”).
- Acceptance criteria
  - Pricing, contact, availability, Instagram visibility follow permissions.

Epic G — Pricing & Booking
G1. PricingDisplay.tsx (new)
- Files: src/components/profile/PricingDisplay.tsx
- Actions
  - Show pricingType, baseRate, negotiable flag; inline tooltips for structure explanations.
- Acceptance criteria
  - Matches profile management pricing scheme; responsive card.

G2. BookingWidget.tsx (new, stub)
- Files: src/components/profile/BookingWidget.tsx
- Actions
  - Quick flow: pick date/time slot -> create booking request stub OR open messages with booking context.
  - Handle conflicts visually (read-only check vs availability).
- Acceptance criteria
  - Non-blocking UX; clear messaging for unavailable slots.

Epic H — Mobile & Desktop Variants
H1. MobileProfileView.tsx (new)
- Files: src/components/profile/MobileProfileView.tsx
- Actions
  - Sticky bottom actions; swipe-able tabs (or keep tabs clickable but touch-friendly).
- Acceptance criteria
  - 360px width usability; no horizontal scroll; actions always reachable.

H2. DesktopProfileView.tsx or SidebarLayout.tsx (new, optional)
- Files: src/components/profile/DesktopProfileView.tsx (or SidebarLayout.tsx)
- Actions
  - Multi-column layout with sidebar for actions; supports wide screens gracefully.
- Acceptance criteria
  - Layout shifts minimized; readable on large displays.

Epic I — Analytics & Tracking
I1. Analytics events
- Files: src/utils/analyticsEvents.ts (update), src/components/profile/* (wire)
- Actions
  - Fire events: profile_viewed, profile_tab_viewed, contact_action_clicked, booking_cta_clicked, share_clicked, report_clicked.
  - Include profile id, tab name, source (e.g., “search”, “job detail”).
- Acceptance criteria
  - Events fire once per view/tab; debounced appropriately.

Epic J — Accessibility & Performance
J1. A11y enhancements
- Files: all new components
- Actions
  - Modal focus trap, ARIA roles for tabs and dialogs, keyboard nav, color contrast checks.
- Acceptance criteria
  - Keyboard-only paths complete; screen readers announce tab and modal changes.

J2. Performance & images
- Files: PortfolioGallery.tsx, ImageLightbox.tsx, ProfileHero.tsx (if exists), AvailabilityWidget.tsx
- Actions
  - Lazy-loading, responsive srcset, memoization, virtualization where needed (reviews list).
- Acceptance criteria
  - Profile loads under 2s on average local dev conditions; smooth tab transitions.

Implementation Order & Dependencies
1. Epic A (Routing, loaders, skeleton/error states)
2. Epic B (State & hooks integration)
3. Epic C (Container + Navigation updates)
4. Epic D (Tabs: Overview → Portfolio → Equipment → Reviews → Availability)
5. Epic F (Privacy gating across tabs)
6. Epic E (Contact & Actions + Modals)
7. Epic G (Pricing & Booking stubs)
8. Epic H (Mobile/Desktop polish)
9. Epic I (Analytics)
10. Epic J (A11y & Performance)

Acceptance Criteria Summary (global)
- Route structure supports deep links to tabs: /profile/:id/(overview|portfolio|equipment|reviews|availability).
- URL is the source of truth for active tab; refresh preserves context.
- Permissions gating enforced via PrivacyGate across pricing/contact/availability/Instagram.
- Contact and share/report flows present and accessible (stubs allowed).
- Image-heavy views are lazy-loaded and responsive.
- Mobile-first UX; no horizontal scroll at 360px; actions reachable.
- Analytics events fire with correct payloads and debounce.
- All UI adheres to src/theme/index.ts tokens and MUI v7 patterns.

Security & Privacy Checklist
- Do not expose contact info without consent (respect viewerPermissions).
- Sanitize any rich text or external links in portfolio items.
- Enforce file-type/size constraints on any future uploads triggered from view (if any).
- Avoid logging sensitive user data in analytics.

Deliverables
- New files:
  - src/components/profile/PrivacyGate.tsx
  - src/components/profile/PricingDisplay.tsx
  - src/components/profile/BookingWidget.tsx
  - src/components/profile/ContactCard.tsx
  - src/components/profile/ActionButtons.tsx
  - src/components/profile/ShareModal.tsx
  - src/components/profile/ReportModal.tsx
  - src/components/profile/EquipmentShowcase.tsx
  - src/components/profile/AvailabilityWidget.tsx
  - src/components/profile/MobileProfileView.tsx
  - (Optional) src/components/profile/DesktopProfileView.tsx or SidebarLayout.tsx
  - (Optional) src/components/profile/RatingBreakdown.tsx
- Updated files:
  - main.tsx
  - src/App.GetMyGrapher.tsx
  - src/components/profile/ProfileViewContainer.tsx
  - src/components/profile/ProfileNavigation.tsx
  - src/components/profile/PortfolioGallery.tsx
  - src/components/profile/ImageLightbox.tsx
  - src/components/profile/ReviewsSection.tsx
  - src/components/profile/ProfileOverview.tsx
  - src/hooks/useProfileView.ts
  - src/store/profileViewStore.ts
  - src/utils/analyticsEvents.ts (wire new events)

QA & Testing
- Unit tests for:
  - PrivacyGate logic
  - profileViewStore selectors and actions
  - Routing utilities (active tab resolution)
- Integration tests:
  - Navigate across tabs with mocked data; ensure loader/skeleton/empty states.
  - Permissions gating for availability, contact, and pricing.
- A11y checks:
  - Focus management in ShareModal/ReportModal and ImageLightbox.
  - Keyboard nav across tabs and lists.

Notes
- Keep real-time messaging and booking backend integration out of scope; use stubs but ensure UI flows are complete and consistent.
- Prefer composition over duplication; reuse existing ContactActions where feasible by wrapping in ContactCard.