# Comparison System Notes

Status: legacy/reference. This document is useful historical context for the comparison feature, but it may lag behind the current UI and routing details. Prefer the current implementation in `components/comparison`, `context/CompareContext.tsx`, `lib/comparison.ts`, `lib/i18nRouting.ts`, and localized route files when making changes.

The comparison system lets users select up to three EV variants and compare pricing, range, battery, charging, efficiency, dimensions, badges, and summary recommendations.

## Current Integration

The comparison flow is integrated through:

```txt
context/CompareContext.tsx
components/comparison/
components/vehicle/VehicleComparisonSection.tsx
app/compare/page.tsx
app/compare/models/page.tsx
app/compare/versions/page.tsx
app/api/models/compare/route.ts
app/api/vehicles/route.ts
lib/comparison.ts
lib/normalizeVehicle.ts
types/comparison.ts
```

`app/api/vehicles/route.ts` returns normalized vehicles, so comparison UI can read stable fields even though the canonical JSON uses names such as `batteryUsableKWh`, `charge10to80Min`, and `pricing.offers[].priceFrom`. Legacy `pricing.pt.consumerPrice.min` is still tolerated during migration, but new or fixed data should use `pricing.offers[]`.

## Data Flow

1. User selects vehicles from a detail page or selector.
2. Selected IDs are stored in `CompareContext` and persisted to localStorage.
3. `/compare/versions?ids=...` loads exact variants; `/compare/models?models=...` compares model families.
4. `/api/vehicles` loads each vehicle with `loadVehicle`.
5. `normalizeVehicleForComparison` adapts canonical JSON to comparison fields.
6. Comparison components calculate badges, winners, and summary values.

## Normalized Fields Used By Comparison

```txt
pricing.basePriceEur            from the best available "from" offer, with legacy fallback
pricing.offers[]                new, used, imported used, and historical-reference price contexts
battery.capacityKwh             from battery.batteryUsableKWh
charging.dcChargeSpeedKw        from charging.dcMaxChargeKW
charging.chargeTime10To80Min    from charging.charge10to80Min
dimensions.trunkCapacityL       from dimensions.cargoLitersSeatsUp
dimensions.lengthMm             from dimensions.lengthMM
```

Comparison should show "from" prices, not price ranges. When data exists, price copy should distinguish new, used, imported used, and historical-reference prices so users understand what is being compared.

## User Features

- Add/remove vehicles from comparison.
- Compare up to three vehicles.
- Persist selected vehicles in localStorage.
- Preserve selected vehicles when editing selection or switching simple/advanced mode.
- Open a full comparison page.
- Highlight best range, value, charging, efficiency, and performance where data exists.
- Share comparison pages with a native share flow on touch devices and copy/WhatsApp/email options on desktop.
- Use placeholder images when real images are missing.
- Display unavailable values gracefully when vehicle data is incomplete.

## Maintenance Notes

- Keep canonical vehicle JSON in the schema described by `VEHICLE_DATA_GUIDE.md`.
- Add new mapping rules in `lib/normalizeVehicle.ts` when the canonical schema grows.
- Add new comparison metrics in `lib/comparison.ts`.
- Run `npm run validate:vehicles` after adding or renaming vehicle folders.
- Run `npm run build` before deploying.
- Use localized href helpers rather than hardcoding public `/compare` URLs.
