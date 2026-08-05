# File Manifest

This manifest summarizes the current app structure and the main files involved in vehicle data, comparison, recommendations, and validation.

## Core App

```txt
app/
├── page.tsx                    Home page
├── layout.tsx                  Root layout, locale provider, comparison provider
├── compare/page.tsx            Comparison route
├── compare/models/page.tsx      Model-family comparison route
├── compare/versions/page.tsx    Exact-variant comparison route
├── recommend/page.tsx          Recommendation quiz route
├── models/page.tsx             Model catalog route
├── models/[slug]/page.tsx      Model variant route
├── vehicles/[id]/page.tsx      Vehicle detail route
├── charging/page.tsx            Charging guide page
├── guides/page.tsx              Buying guides page
├── faq/page.tsx                 Frequently asked questions page
├── privacy/page.tsx             Privacy policy
├── cookies/page.tsx             Cookie policy
├── terms/page.tsx               Terms of use
├── internal/page.tsx            Internal tools hub
├── internal/content/page.tsx    Internal content and SEO editor
├── internal/images/page.tsx     Internal image review workflow
├── internal/vehicles/page.tsx   Internal vehicle data health dashboard
├── internal/vehicles/new/page.tsx
├── internal/vehicles/[id]/page.tsx
├── internal/vehicles/[id]/edit/page.tsx
└── api/
    ├── feedback/route.ts        Public page feedback adapter
    ├── internal/content/route.ts
    ├── internal/images/review/route.ts
    ├── internal/login/route.ts
    ├── internal/vehicles/route.ts
    ├── internal/vehicles/[id]/route.ts
    ├── models/all/route.ts
    ├── models/compare/route.ts
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
lib/internalContentFiles.ts     Internal content/SEO field map and locale writer
lib/internalVehicleFiles.ts     Internal vehicle JSON and registry writer
lib/vehicleAudit.ts             Dataset health audit for internal dashboard
lib/cookieConsent.ts            Consent storage, updates, expiry, cookie cleanup
lib/i18nRouting.ts              Localized route segment helpers
lib/recommendation/recommendEVs.ts
```

## UI Components

```txt
components/vehicle/             Vehicle detail cards and hero
components/model/               Model detail page
components/comparison/          Compare buttons, bar, page, metrics, badges
components/recommendation/      Quiz and recommendation result cards
components/search/              Search UI
components/internal/            Internal content and vehicle data editors
components/contact/             Contact form UI
components/SiteHeader.tsx
components/SiteFooter.tsx
components/GoogleTagManager.tsx
components/CookieConsentBanner.tsx
components/PageFeedback.tsx
components/legal/LegalPage.tsx
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
scripts/generate-registry.mjs   Rebuilds data/registry/vehicles.json from core.json files
```

Run with:

```bash
npm run validate:vehicles
npm run generate:registry
```

## Documentation

```txt
README.md                       Project overview and development workflow
VEHICLE_DATA_GUIDE.md           Canonical vehicle JSON schema
IMPLEMENTATION_SUMMARY.md       Current architecture summary
TESTING_CHECKLIST.md            Build, data, UI, and comparison checks
docs/API_REFERENCE.md           Public and internal route API reference
docs/LOCALIZATION.md            Localization, route translation, and content editing guide
docs/ANALYTICS_CONSENT.md       GTM and Consent Mode v2 implementation guide
FILE_MANIFEST.md                This file
```

Older comparison-specific docs may still exist for reference, but the current source of truth is the main README plus the vehicle data guide.
