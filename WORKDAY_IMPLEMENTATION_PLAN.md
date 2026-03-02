# Workday Section Implementation Plan

## Goal
Deliver a new `Workday` section to manage today's itinerary with real-time operational actions for dispatch and drivers.

## Phase 1: Foundation and Navigation
1. Add `Workday` as a first-class section in navigation (sidebar + section router).
2. Create `WorkdayView` scaffold with clear blocks:
   - Past services
   - Ongoing services
   - Upcoming services
3. Add a minimal loading/skeleton state for the section.
4. Keep all interactions local-state first so UI can be validated before API coupling.

## Phase 2: Data Model and API Contract
1. Define backend query for today's services:
   - Date window boundaries (timezone-safe)
   - Company filtering (AT/ST/MBT where needed)
2. Define workday DTO including:
   - Core service info
   - Driver assignment info
   - Current state
   - Revenue field
   - PDF metadata/url
3. Add backend endpoints:
   - `GET /api/v1/workday/services`
   - `PATCH /api/v1/workday/services/:id` (state, driver, revenue)
4. Add validation and permissions checks.

## Phase 3: Slides-like Timeline UX
1. Implement horizontal slide navigation by status bucket:
   - Past
   - Ongoing
   - Upcoming
2. Add service card component with compact critical fields:
   - Time
   - Passenger/client
   - Route summary
   - Driver
   - Status
3. Add filter/search controls for high-volume days.
4. Keep mobile-first behavior with snap scrolling and sticky controls.

## Phase 4: Operational Actions
1. Driver assignment for upcoming services.
2. Service status transitions (`PENDING`, `ONGOING`, `COMPLETED`, `CANCELLED`, etc.).
3. Manual total revenue setter with inline validation.
4. Move action controls into a consistent panel/modal pattern to reduce accidental edits.

## Phase 5: Notifications and Mailer Subscription
1. Create reminder worker/check that identifies services starting in <= 30 minutes.
2. Add idempotent notification records to prevent duplicate sends.
3. Subscribe configured recipients to mailer notifications.
4. Provide UI controls to enable/disable notifications per user/company if required.

## Phase 6: PDF Preview
1. Add secure PDF preview action in service detail.
2. Support inline preview modal (desktop) and fallback open/download on mobile.
3. Add loading/error handling for missing or expired URLs.

## Phase 7: Reliability and QA
1. Add loading, empty, and error states across all workday flows.
2. Add optimistic UI where safe + rollback on failed mutations.
3. Add telemetry/logging for key actions (assign driver, status update, revenue update).
4. Test matrix:
   - Mobile and desktop layout
   - High-volume day performance
   - Notification trigger correctness around timezone boundaries
   - Permission boundaries

## Delivery Order (Recommended)
1. Phase 1
2. Phase 2
3. Phase 3 + Phase 4 together
4. Phase 6
5. Phase 5
6. Phase 7 hardening pass
