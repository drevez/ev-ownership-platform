# Implementation Summary

This project is now structured around a growing modular EV dataset and a normalized app data layer.

## Current Foundation

- Next.js 16 App Router application.
- Modular vehicle data stored in `public/data/vehicles/{vehicle-id}`.
- Vehicle detail pages generated from `data/registry/vehicles.json`.
- Model pages group variants by brand/model.
- Comparison flow supports up to three vehicles.
- Recommendation quiz scores vehicles from lifestyle inputs.
- Placeholder vehicle images are used until real car images are uploaded.

## Data Layer

### Loader

[lib/loadVehicle.ts](/Users/danielarevez/ev-ownership-platform/lib/loadVehicle.ts) loads the seven vehicle modules:

```txt
battery.json
charging.json
comfort.json
core.json
dimensions.json
efficiency.json
pricing.json
```

It also normalizes missing local image files to `/images/vehicle-placeholder.svg`.

### Normalizer

[lib/normalizeVehicle.ts](/Users/danielarevez/ev-ownership-platform/lib/normalizeVehicle.ts) adapts canonical JSON fields to the older internal UI shape:

```txt
batteryUsableKWh              -> battery.capacityKwh
charge10to80Min               -> charging.chargeTime10To80Min
pricing.pt.consumerPrice.min  -> pricing.basePriceEur
lengthMM                      -> dimensions.lengthMm
cargoLitersSeatsUp            -> dimensions.trunkCapacityL
```

This keeps the JSON schema stable while allowing existing comparison/model components to work.

## Vehicle Validation

Run:

```bash
npm run validate:vehicles
```

The validator is advisory. It reports issues while allowing the app to keep building during active data entry.

It checks:

- invalid JSON
- missing files
- required `core.json` fields
- folder/core ID mismatches
- unknown keys
- missing images
- missing Portuguese pricing
- registry/folder mismatches

## Build Status

- `npm run build` passes.
- Full lint still has known follow-up issues in older components and recommendation typing.
- Vehicle validation currently reports dataset cleanup work, which is expected while the catalog is being expanded.

## Main Follow-Ups

1. Clean vehicle data reported by `npm run validate:vehicles`.
2. Move search to real registry/core aliases.
3. Generate the registry from `core.json`.
4. Remove remaining `any` types in recommendation and generic rendering code.
5. Add richer ownership tools such as charging cost, incentives, and used-price insights.
