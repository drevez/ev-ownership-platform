# File Manifest

This manifest summarizes the current app structure and the main files involved in vehicle data, comparison, recommendations, and validation.

## Core App

```txt
app/
├── page.tsx                    Home page
├── layout.tsx                  Root layout, locale provider, comparison provider
├── compare/page.tsx            Comparison route
├── recommend/page.tsx          Recommendation quiz route
├── models/page.tsx             Model catalog route
├── models/[slug]/page.tsx      Model variant route
├── vehicles/[id]/page.tsx      Vehicle detail route
└── api/
    ├── vehicles/route.ts       Normalized vehicle lookup by IDs
    ├── vehicles/all/route.ts   Registry lookup
    └── recommendations/route.ts
```

## Vehicle Data

```txt
public/data/vehicles/{vehicle-id}/
├── battery.json
├── charging.json
├── comfort.json
├── core.json
├── dimensions.json
├── efficiency.json
└── pricing.json
```

```txt
data/registry/vehicles.json     Listing and static-route registry
public/images/vehicle-placeholder.svg
```

## Data And Normalization

```txt
lib/loadVehicle.ts              Loads modular vehicle JSON files
lib/normalizeVehicle.ts         Maps canonical JSON to app/comparison fields
lib/vehicleImages.ts            Shared placeholder image constant
lib/models.ts                   Groups variants into model pages
lib/comparison.ts               Comparison metrics, badges, localStorage helpers
lib/recommendation/recommendEVs.ts
```

## UI Components

```txt
components/vehicle/             Vehicle detail cards and hero
components/model/               Model detail page
components/comparison/          Compare buttons, bar, page, metrics, badges
components/recommendation/      Quiz and recommendation result cards
components/search/              Search UI
components/SiteHeader.tsx
components/SiteFooter.tsx
```

## Context And Types

```txt
context/CompareContext.tsx      Client comparison state
context/LocaleContext.tsx       Locale state
types/comparison.ts             Comparison data contracts
types/model.ts                  Model page data contracts
types/recommendation.ts         Recommendation contracts
types/model.ts
```

## Scripts

```txt
scripts/validate-vehicles.mjs   Advisory vehicle JSON validator
```

Run with:

```bash
npm run validate:vehicles
```

## Documentation

```txt
README.md                       Project overview and development workflow
VEHICLE_DATA_GUIDE.md           Canonical vehicle JSON schema
IMPLEMENTATION_SUMMARY.md       Current architecture summary
TESTING_CHECKLIST.md            Build, data, UI, and comparison checks
FILE_MANIFEST.md                This file
```

Older comparison-specific docs may still exist for reference, but the current source of truth is the main README plus the vehicle data guide.
