# Quick Reference

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run validate:vehicles
npm run generate:registry
```

## Important Files

```txt
README.md
VEHICLE_DATA_GUIDE.md
scripts/validate-vehicles.mjs
lib/loadVehicle.ts
lib/normalizeVehicle.ts
lib/comparison.ts
lib/internalContentFiles.ts
lib/internalVehicleFiles.ts
lib/cookieConsent.ts
lib/i18nRouting.ts
app/api/feedback/route.ts
components/CookieConsentBanner.tsx
components/GoogleTagManager.tsx
components/PageFeedback.tsx
data/registry/vehicles.json
public/data/vehicles/
```

## Vehicle Folder Template

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

## Required Core Fields

```json
{
  "id": "xpeng-p7-long-range-rwd",
  "brand": "XPeng",
  "model": "P7"
}
```

## Canonical To Normalized Fields

```txt
batteryUsableKWh              -> battery.capacityKwh
dcMaxChargeKW                 -> charging.dcChargeSpeedKw
charge10to80Min               -> charging.chargeTime10To80Min
pricing.offers[].priceFrom    -> pricing.basePriceEur
pricing.pt.consumerPrice.min  -> pricing.basePriceEur (legacy)
lengthMM                      -> dimensions.lengthMm
cargoLitersSeatsUp            -> dimensions.trunkCapacityL
```

## Pricing JSON Rule

New or migrated `pricing.json` files should use the `offers` array documented in `VEHICLE_DATA_GUIDE.md`.

Important: the app, validator, pricing UI, and internal dashboard read `offers[]`, but legacy/intermediate pricing shapes are still tolerated while the dataset is being migrated.

The UI translates labels from semantic pricing fields:

```txt
new + available + official_pt       -> currently sold new in Portugal
used + available + used_pt          -> used Portugal market price
used + available + imported_to_pt   -> imported used estimate
new + not_sold_new                  -> historical new price, no longer sold new
```

Do not store translated UI labels such as `Novo desde` inside `pricing.json`.

Never use `0` for unknown prices. Use `null` or omit the value.

## Placeholder Image

If `core.image` points to a missing local file, the app uses:

```txt
/images/vehicle-placeholder.svg
```

## Comparison Limit

The app currently supports up to three vehicles in one comparison. The limit is enforced in:

```txt
context/CompareContext.tsx
components/comparison/VehicleSelector.tsx
```

## Current Checks

- `npm run build` should pass.
- `npm run validate:vehicles` reports data cleanup tasks without blocking.
- `npm run lint` should pass with warnings only: remaining `<img>` usage and one CompareContext hook dependency warning.

## Internal Tools

```txt
/internal              Internal tools hub
/internal/vehicles     Vehicle data health dashboard and JSON editor
/internal/content      Page copy, translation, and SEO editor
/internal/images       Vehicle image backlog, candidate review, and WebP creation
```

Internal pages and write APIs require `INTERNAL_AUTH_USERNAME` and `INTERNAL_AUTH_PASSWORD`.

## Public Route Families

```txt
/models                Model catalog
/vehicles/{id}         Vehicle detail
/compare/models        Model-family comparison
/compare/versions      Exact-variant comparison
/recommend             Recommendation quiz
/guides                Buying guides
/charging              Charging guide
/faq                   Frequently asked questions
```

Public URLs are localized through `lib/i18nRouting.ts`; use localized href helpers rather than hardcoded language paths.

## Feedback

```env
FEEDBACK_WEBHOOK_URL=
FEEDBACK_WEBHOOK_SECRET=
```

`/api/feedback` accepts thumbs up/down page feedback. Without a webhook it returns `stored: false`; with a webhook it can persist events and return aggregate stats.

## Analytics

```env
NEXT_PUBLIC_GTM_ID=GTM-MG49P4DS
```

GTM is the only tracking container. Do not add GA4 directly to the app. Consent is stored under `motorzero_cookie_consent_v1`, expires after 180 days, and can be reopened from the footer.

Full guide:

```txt
docs/ANALYTICS_CONSENT.md
```
