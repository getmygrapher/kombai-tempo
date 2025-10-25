# GetMyGrapher — Profile Management Tasks (Frontend)

Purpose
- Translate Profile_Management_System_Flow into actionable, developer-ready tasks focused on frontend.
- Leverage existing components; add only what’s missing.
- Ensure strict UI consistency with MUI v7 theme and existing patterns.

Scope
- Profile creation/editing, equipment, pricing, availability integration, portfolio, privacy/visibility, analytics.

Existing vs Missing (from current codebase)
Existing (keep, extend where noted)
- components/profile: `ProfilePage.tsx`, `ProfileManagementContainer.tsx`, `ProfileDashboard.tsx`, `ProfileEditForm.tsx`, `EquipmentManager.tsx`, `ProfileHero.tsx`, `ProfileOverview.tsx`, `ProfileNavigation.tsx`, `ProfileViewContainer.tsx`, `EnhancedProfileViewContainer.tsx`, `ContactActions.tsx`, `PortfolioGallery.tsx`, `ImageLightbox.tsx`, `ReviewsSection.tsx`, `TierManagement.tsx`, `NotificationSettings.tsx`
- availability components: `AvailabilityCalendar.tsx`, `TimeSlotSelector.tsx`, `RecurringPatternManager.tsx`, etc. (in `src/components/availability`)
- routing: `/profile` -> `ProfilePage`
- theme: `src/theme/index.ts`

Missing (to implement)
- `ProfileEditPage.tsx` (wrapper with layout + uses existing `ProfileEditForm.tsx`)
- Pricing: `PricingManager.tsx`, `PricingCard.tsx`
- Equipment form: `EquipmentForm.tsx` (modal/form used by `EquipmentManager`)
- Portfolio: `PortfolioManager.tsx`, `InstagramIntegration.tsx`
- Privacy/visibility: `PrivacySettings.tsx`, `VisibilityControls.tsx` (integrate with existing `NotificationSettings.tsx`)
- Analytics: `ProfileAnalytics.tsx`, optional `ProfileInsights.tsx`
- Verification flows (stubs): `ProfileValidation.tsx`, `ContactVerification.tsx`
- Store: `profileManagementStore.ts` (Zustand)

Design System & UI Consistency
- Use MUI v7 components and `src/theme/index.ts` tokens.
- Spacing: theme.spacing(1..6); Typography: theme.typography; Radius: theme.shape.borderRadius; Colors: theme.palette.primary/secondary/success/warning/error/info/grey.
- Consistent containers: Paper sections with `sx={{ p: 3 }}`; lists with Divider; actions as `contained` primary; secondary as `text` / `outlined`.
- Icons: MUI icons used across existing profile screens; match sizes and color usage.
- States: Loading -> Skeletons; Empty -> neutral messaging; Error -> error color, retry.

Epics & Tasks
1) Routing & Entry
- Keep current pattern (toggle within `ProfilePage.tsx` to `ProfileManagementContainer`).
- Optional (later): add `/profile/manage` route that renders `ProfileManagementContainer` (behind a feature flag).

2) State Management (Zustand)
- Create `src/store/profileManagementStore.ts` with slices: editState, async status (saving, loading), profileDraft, equipmentDraft, pricingDraft, privacySettings, portfolioState.
- Actions: loadProfile(userId), saveProfile, saveEquipment, savePricing, savePrivacy, savePortfolio; optimistic update with rollback on failure (mock API for now).

3) Profile Edit
- `ProfileEditPage.tsx`: header (Back, Save), section tabs (Basic, Professional, Pricing), body uses `ProfileEditForm` in controlled mode.
- Validation: profile photo (JPG/PNG max 5MB), name required, +91 mobile (10 digits), email format, gender optional, PIN code numeric 6 digits; preferred locations multi-select.
- Save triggers store action; show success Snackbar.

4) Equipment Management
- `EquipmentForm.tsx`: add/edit item modal; fields by category (camera/support/lighting/other), condition dropdown, indoor/outdoor flags; dedupe check; submit -> `saveEquipment`.
- Integrate into `EquipmentManager.tsx`: replace inline add/edit with `EquipmentForm` modal and confirmation dialog for delete.

5) Pricing
- `PricingCard.tsx`: compact card with structure (per_hour/per_day/per_event), rate, negotiable toggle.
- `PricingManager.tsx`: form with validation (₹500–₹100000), min hours for hourly, overtime note for daily, inclusions for event; preview uses `PricingCard`.
- Wire into Profile sections (open from Profile actions list and dashboard tiles).

6) Availability Integration
- Surface `AvailabilityCalendar.tsx` & `TimeSlotSelector.tsx` inside a drawer from Pricing/Availability section; persist selection via store.
- Ensure read-only preview on Profile page (small monthly view with legend) linking to full calendar page.

7) Portfolio
- `PortfolioManager.tsx`: grid uploader (drag & drop), uses `ImageLightbox` for preview, reorder via drag, captions; mock upload.
- `InstagramIntegration.tsx`: gated by Pro tier; connect CTA, status chip, disconnect; mock OAuth; stores handle.

8) Privacy & Visibility
- `PrivacySettings.tsx`: tabs [Visibility, Contact, Notifications];
  - Visibility uses `VisibilityControls.tsx` (Public/Network/Private) + toggles for showing equipment/pricing/availability.
  - Contact integrates existing `NotificationSettings.tsx` for preferences; add contact-sharing toggles.
- Save persists via store; success Snackbar.

9) Analytics (MVP)
- `ProfileAnalytics.tsx`: metrics cards (views, saves, contact requests, completion%), simple line chart stub, recommendations list (static for now).

10) Verification Stubs
- `ProfileValidation.tsx`: placeholder for photo/doc verification steps with status chips.
- `ContactVerification.tsx`: placeholder for OTP email/mobile flows (UI only).

Implementation Order
1. Store (`profileManagementStore.ts`)
2. ProfileEditPage + validations
3. EquipmentForm integration
4. PricingManager + PricingCard
5. Availability integration
6. PortfolioManager + InstagramIntegration (Pro gating)
7. PrivacySettings + VisibilityControls (reuse NotificationSettings)
8. Analytics
9. Verification stubs
10. Optional manage route

Acceptance Criteria (general)
- Theming strictly via theme tokens; no hardcoded colors/sizes.
- Forms validate per rules; error helper texts shown; Save disabled until valid.
- All saves route through store; optimistic update + Snackbar feedback.
- Mobile-friendly layout; no horizontal scroll on 360px width.
- Accessibility: buttons have aria-labels where icons only; labels associated with inputs.

Deliverables
- New files listed under Missing; updated integrations in existing profile components.
- Store with typed selectors/actions.
- Mock services for save/load with simulated latency.
- Screenshot checklist: Profile Edit, Equipment modal, Pricing form, Availability drawer, Portfolio manager, Privacy tabs, Analytics cards.