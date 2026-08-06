# Implementation Summary

MotorZero is structured around a growing modular EV dataset, a normalized app data layer, localized public routes, internal maintenance tools, and consent-aware analytics.

## Current Foundation

- Next.js 16 App Router application.
- Modular vehicle data stored in `public/data/vehicles/{vehicle-id}`.
- Vehicle detail pages generated from `data/registry/vehicles.json`.
- Model pages group variants by brand/model.
- Comparison flow supports up to three vehicles.
- Recommendation quiz scores vehicles from lifestyle inputs.
- Placeholder vehicle images are used until real car images are uploaded.
- Internal vehicle and content tools support dataset maintenance, translation editing, and SEO copy editing.
- Internal image review supports missing image triage, candidate approval/rejection, WebP creation, and replacement.
- GTM is the only analytics container and loads after denied Consent Mode v2 defaults.
- A translated first-party cookie banner supports accept, reject, and category preferences.
- Optional PostHog product analytics loads only after analytics consent when configured.
- Search, no-result states, and page feedback can produce product signals for future backlog decisions.
- Localized guides, charging, FAQ, privacy, cookie, and terms pages are included in the sitemap.
- Key public flows can collect subtle thumbs up/down feedback through `/api/feedback`.

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
pricing.offers[].priceFrom    -> pricing.basePriceEur
pricing.pt.consumerPrice.min  -> pricing.basePriceEur (legacy)
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
- `npm run lint` passes.
- `npm run validate:vehicles` reports current data cleanup tasks, which is expected while the catalog is being expanded.
- Use the current `npm run build` output for the exact generated route/page count.

## Analytics And Consent

- GTM ID comes from `NEXT_PUBLIC_GTM_ID`.
- GA4 must be configured inside GTM; there is no direct GA4 script in the codebase.
- Consent defaults to denied before GTM.
- Choices persist for 180 days and are invalidated by a policy-version change.
- Withdrawing analytics consent removes accessible `_ga` and `_ga_*` cookies.
- Current GA4/dataLayer events are documented in `docs/ANALYTICS_CONSENT.md`.
- The proposed tracking v2 schema is documented separately in `docs/ANALYTICS_EVENT_SCHEMA.md`.
- GTM Preview is still required to confirm one page view per initial load and client navigation.

## Internal Tools

- `/internal/vehicles` audits vehicle data, filters issues, and links to vehicle JSON editing flows.
- `/internal/vehicles/new` creates a new modular vehicle folder and registry entry.
- `/internal/vehicles/{id}` shows the internal vehicle detail/workflow page.
- `/internal/vehicles/{id}/edit` edits existing vehicle JSON files.
- `/internal/content` edits page copy, translations, and SEO metadata in `locales/pt.ts`, `locales/en.ts`, and `locales/es.ts`.
- `/internal/images` audits missing vehicle images and manages image candidates.

These routes are protected by server-side Basic Auth in `proxy.ts`, with write APIs performing an additional authorization check.

## Main Follow-Ups

1. Clean vehicle data reported by `npm run validate:vehicles`.
2. Upload real vehicle images or intentionally accept placeholder usage.
3. Decide and implement the approved tracking v2 schema only after reviewing the analytics docs.
4. Consider account-based authentication if the internal tooling gains multiple administrators.
5. Add richer ownership tools such as charging cost, incentives, and used-price insights.
