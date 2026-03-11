# MBT Cleanup Plan

## Current Baseline

Completed in this session:
- Reduced `apps/mbt-app` lint status from 28 errors / 62 warnings to 0 errors / 55 warnings.
- Kept `pnpm check-types` passing at repo scope.
- Removed the main React safety issues caused by synchronous state updates inside effects.
- Replaced mount-flag portal patterns with a shared client-safe approach via `apps/mbt-app/hooks/useIsClient.ts`.
- Refactored several form/detail flows to avoid effect-driven derived state.

Verified commands:
- `pnpm exec eslint .` in `apps/mbt-app`
- `pnpm check-types` in repo root

## What Changed

Primary files already cleaned up:
- `apps/mbt-app/app/[authorized]/platform/page.tsx`
- `apps/mbt-app/components/maps/MapPicker.tsx`
- `apps/mbt-app/components/services/AllServicesView.tsx`
- `apps/mbt-app/components/shared/AddServiceModal.tsx`
- `apps/mbt-app/components/shared/Notes.tsx`
- `apps/mbt-app/components/shared/PDFGeneratorModal.tsx`
- `apps/mbt-app/components/shared/ServiceDetailModal.tsx`
- `apps/mbt-app/components/single/fixedSwitch/index.tsx`
- `apps/mbt-app/components/single/navbar/Configurator.tsx`
- `apps/mbt-app/views/personnel/allies/AllyForm.tsx`
- `apps/mbt-app/views/personnel/hotels/PlaceForm.tsx`
- `apps/mbt-app/views/personnel/hotels/PlaceDetail.tsx`
- `apps/mbt-app/views/personnel/utils/mockDataHelpers.ts`

## Remaining Work

### 1. Low-risk warning cleanup

Target first because it is fast and unlikely to change behavior.

- Remove unused variables/imports in:
  - `apps/mbt-app/app/[authorized]/platform/page.tsx`
  - `apps/mbt-app/app/page.tsx`
  - `apps/mbt-app/components/shared/AddServiceModal.tsx`
  - `apps/mbt-app/components/shared/PDFGeneratorModal.tsx`
  - `apps/mbt-app/components/services/SacbeTransferService.tsx`
  - `apps/mbt-app/views/itinerary/services/SacbeTransfeService.tsx`
  - `apps/mbt-app/components/single/card/Course.tsx`
  - `apps/mbt-app/components/single/card/index.tsx`
  - `apps/mbt-app/components/single/sidebar/index.tsx`
  - `apps/mbt-app/views/itinerary/components/Schedule.tsx`
  - `apps/mbt-app/views/itinerary/index.tsx`
  - `apps/mbt-app/views/itinerary/services/AirportTransferService.tsx`
  - `apps/mbt-app/views/personnel/vehicles/VehicleDetail.tsx`

Success criteria:
- Warning count drops materially without behavior changes.

### 2. Hook dependency warnings

Target next because these can hide stale data bugs, but need careful review before changing dependencies.

- Review and fix `react-hooks/exhaustive-deps` warnings in:
  - `apps/mbt-app/components/services/MBTransferService.tsx`
  - `apps/mbt-app/components/shared/FlightComparisonModal.tsx`
  - `apps/mbt-app/components/single/minicalendar/index.tsx`
  - `apps/mbt-app/contexts/AuthContext.tsx`
  - `apps/mbt-app/contexts/ServiceDataContext.tsx`
  - `apps/mbt-app/views/itinerary/index.tsx`
  - `apps/mbt-app/views/itinerary/services/AirportTransferService.tsx`
  - `apps/mbt-app/views/personnel/drivers/DriverDetail.tsx`
  - `apps/mbt-app/views/personnel/drivers/DriverForm.tsx`
  - `apps/mbt-app/views/personnel/employees/EmployeeDetail.tsx`
  - `apps/mbt-app/views/personnel/employees/EmployeeForm.tsx`
  - `apps/mbt-app/views/personnel/vehicles/VehicleDetail.tsx`
  - `apps/mbt-app/views/personnel/vehicles/VehicleForm.tsx`

Rules for this pass:
- Prefer stabilizing callbacks with existing patterns already used in the file.
- Do not silence warnings by disabling ESLint unless the code is truly intentional and documented.
- Re-run the affected flow after changing dependencies, especially data-fetching screens.

### 3. Image optimization warnings

These are lower priority because they are not correctness issues.

- Evaluate replacing `<img>` with `next/image` in:
  - driver grids/details
  - employee grids/details
  - vehicle grids/details

Rules for this pass:
- Preserve current layout dimensions to avoid regressions.
- Only migrate images that are local/static or have a safe remote strategy.

### 4. Itinerary warning pass

This area already had user changes before the cleanup session and should be handled deliberately.

- Revisit:
  - `apps/mbt-app/views/itinerary/index.tsx`
  - `apps/mbt-app/views/itinerary/services/AirportTransferService.tsx`
  - `apps/mbt-app/views/itinerary/services/SacbeTransfeService.tsx`
  - `apps/mbt-app/components/services/SacbeTransferService.tsx`

Focus:
- Remove dead state and dead helpers.
- Validate tab/action state still works after dependency fixes.
- Avoid broad refactors unless needed to remove a warning safely.

## Recommended Next Session Order

1. Run `pnpm exec eslint .` in `apps/mbt-app` to confirm the same baseline.
2. Complete the unused variable/import cleanup.
3. Tackle hook dependency warnings in small batches, testing after each batch.
4. Re-run lint.
5. Decide whether the remaining `next/image` warnings are worth addressing now or deferring.

## Acceptance Target For Next Pass

- Keep lint errors at 0.
- Reduce warnings significantly, ideally by clearing all unused-var warnings first.
- Keep `pnpm check-types` green.
- Do not introduce route, API, or state-management behavior changes outside the touched warning fixes.
