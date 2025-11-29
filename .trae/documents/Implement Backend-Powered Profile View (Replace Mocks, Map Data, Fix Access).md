## Goals

* Replace mock-based profile view with backend services.

* Map Supabase RPC results to the UI’s expected `ProfileViewData` shape.

* Align public access for `/profile/:id` with backend function grants.

* Integrate portfolio, reviews, and basic availability into tabs.

* Preserve existing UX: skeletons, permissions, and view tracking.

## Backend Access Updates

* Grant public read for profile details:

  * Option B (safer): Create `get_profile_public_details` with limited fields and grant to `anon`.

* Keep ratings listing and view tracking as-is (already granted to `anon`).

* Do NOT open write operations (save profiles, contact requests) to `anon`.

## Data Loader & Mapping

* In `src/services/profileViewService.ts`, add a `getProfileViewData(profileId)` function that:

  * Calls `getProfileDetails`, `getPortfolio`, `getRatings`, and `calculateViewerPermissions`.

  * Maps to the UI shape:

    * `professional`: `{ id, name, profilePhoto, rating, totalReviews, isVerified, location, type, category, instagramHandle }`.

    * `analytics`: `{ totalViews, completionRate, averageRating, ratingDistribution }`.

    * `portfolio`: map items to `{ id, type: 'image', url, title, ... }`.

    * `equipment`: pass-through from `professional_profiles.equipment`.

    * `reviews`: map from `ratingsService.getProfessionalRatings(...)`.

    * `availability`: basic stub reading next-available date (see below).

* Export types that match current UI expectations to avoid component churn.

## Container Refactor

* Update `src/components/profile/EnhancedProfileViewContainer.tsx` to:

  * Replace `useProfileData` (mock) with a React Query call to `profileViewService.getProfileViewData(profileId)`.

  * Use returned `ProfileViewData` for all tabs.

  * Keep skeletons and error states unchanged.

  * Use `profileViewService.trackView(profileId, source)` on mount.

## Portfolio Tab Integration

* Use `profileViewService.getPortfolio(profileId)` data.

* Map to gallery items and keep existing filters (`type === 'image'`).

* Support simple pagination via function parameters when needed.

## Reviews Tab Integration

* Use `profileViewService.getRatings(profileId, sortBy, page, limit)`.

* Update `ReviewsSection` props to accept backend ratings list and sorting.

* Ensure helpful votes/respond actions use `profileViewService.markReviewHelpful` and `respondToRating` with optimistic UI updates.

## Availability Integration (Minimal Viable)

* Read `time_slots` for `profileId` where `status`/`is_booked` indicates availability windows.

* Map to `AvailabilityInfo.calendar` for the next 14 days; fall back to current mock generation when no data.

* Keep booking CTA as a no-op or wired to a placeholder until full booking flow is available.

## Permissions & Saved Profiles

* Use `profileViewService.calculateViewerPermissions(profileId)` to drive `PrivacyGate`.

* Use `profileViewService.toggleSave(profileId)` for save/unsave actions and reflect state in UI.

## Error Handling & UX

* Standardize error mapping across services (already implemented) and surface actionable messages.

* Preserve skeletons for initial load in `EnhancedProfileViewContainer` and each tab’s lazy content.

## Verification

* Test anon access to `/profile/:id`: if blocked, apply Option A/B grants.

* Test authenticated user access and viewer permissions (own vs others).

* Validate tabs: overview fields, portfolio images, reviews sorting/paging, availability rendering.

* Confirm view tracking events are recorded (no errors returned by RPC).

## Contingencies

* If public grants are not allowed, gate `/profile/:id` behind sign-in or show limited public stub using a public RPC.

* If availability schema differs, keep mock fallback but structure code to swap in real data later.

## Deliverables

* Refactored `EnhancedProfileViewContainer` using backend loader.

* Mapping implemented in `profileViewService` without creating new files unless strictly needed.

* Optional migration change to function grants for public viewing.

* Updated tabs to use backend data with consistent UX.

