# EV Ownership Platform

EV Ownership Platform is a growing electric vehicle database and comparison app focused on helping drivers understand EV ownership in practical terms: range, charging, pricing, storage, comfort, and fit for different lifestyles.

The project is built around a modular JSON vehicle dataset. Each vehicle variant lives in its own folder and can be added gradually, even before every image or market field is complete. The app normalizes incomplete vehicle data, uses placeholder images when real assets are missing, and includes an advisory validator to make dataset cleanup easier as the catalog grows.

## What The App Does

- Browse electric vehicle models and variants.
- View detailed vehicle pages from modular JSON files.
- Compare up to three vehicles side by side.
- Highlight best range, value, charging, and efficiency.
- Recommend EVs from budget, charging access, family size, commute, and road-trip habits.
- Fall back gracefully when a vehicle image or optional data field is missing.
- Validate vehicle data while the dataset is still being expanded.
- Manage vehicle JSON files from an internal dashboard.
- Edit public page copy, translations, and SEO metadata from an internal content editor.
- Load analytics through Google Tag Manager with a first-party Consent Mode v2 banner.
- Publish localized privacy, cookie, and terms pages.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- JSON-backed vehicle catalog
- Google Tag Manager through `@next/third-parties`

Important: this repo uses Next.js 16. Before changing Next-specific APIs, read the local docs in `node_modules/next/dist/docs/`.

## Project Structure

```txt
app/                         App Router pages and API routes
components/                  UI components for vehicles, comparison, search, recommendations
context/                     Client state providers
data/registry/vehicles.json  Vehicle registry used for listing/static params
docs/                        Localization and API reference docs
lib/                         Data loading, normalization, formatting, recommendation logic
locales/                     Portuguese, English, and Spanish copy
public/data/vehicles/        Canonical modular vehicle JSON dataset
public/images/               Shared images and placeholders
scripts/                     Maintenance scripts
types/                       Shared TypeScript types
```

## Analytics And Consent

Google Tag Manager is the only tracking container. Configure it with:

```env
NEXT_PUBLIC_GTM_ID=GTM-MG49P4DS
```

GA4 `G-050C1KBYPK` is configured inside GTM and must not be installed directly in the app. Consent defaults to denied before GTM loads. Visitors can accept, reject, or manage analytics and marketing separately; choices expire after 180 days.

See [docs/ANALYTICS_CONSENT.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md) for setup and testing.

## Vehicle Data Model

Each vehicle variant should live at:

```txt
public/data/vehicles/{vehicle-id}/
```

Expected files:

```txt
battery.json
charging.json
comfort.json
core.json
dimensions.json
efficiency.json
pricing.json
```

The canonical field names are the JSON names used in the vehicle files, for example:

- `batteryUsableKWh`
- `dcMaxChargeKW`
- `charge10to80Min`
- `estimatedRealRangeKm`
- `realWorldConsumptionWhKm`
- `lengthMM`, `widthMM`, `heightMM`, `wheelbaseMM`
- `cargoLitersSeatsUp`
- `pricing.offers[].priceFrom`

Older files may still use `pricing.pt.consumerPrice.min`; treat that as legacy while migrating the vehicle dataset.

The app adapts those fields through [lib/normalizeVehicle.ts](/Users/danielarevez/ev-ownership-platform/lib/normalizeVehicle.ts) so comparison and model pages can read a consistent internal shape.

For the full schema guide, see [VEHICLE_DATA_GUIDE.md](/Users/danielarevez/ev-ownership-platform/VEHICLE_DATA_GUIDE.md).

## Missing Images

Vehicle `core.json` files may point to a future image, for example:

```json
"image": "/cars/xpeng-p7-long-range-rwd.webp"
```

If the file is not present in `public/cars/`, the app uses:

```txt
/images/vehicle-placeholder.svg
```

This lets you add vehicle data first and upload real images later.

## Data Validation

Run:

```bash
npm run validate:vehicles
```

The validator checks every vehicle folder and reports:

- invalid JSON
- missing expected module files
- missing required `core.json` fields
- folder ID and `core.id` mismatches
- missing local image files
- unknown keys in known modules
- missing Portuguese pricing blocks
- registry entries that do not match vehicle folders

Validation is advisory for now. It reports issues but does not block builds.

## Internal Tools

The application includes internal tools for maintaining data and content. `/internal/*` and `/api/internal/*` are protected with server-side Basic Auth configured through private environment variables.

- **Vehicle data health and editor**: `/internal/vehicles`
  - Tracks completeness, legacy formats, missing price contexts, missing translations, and missing image files.
  - Adds, duplicates, edits, and saves modular vehicle JSON files.
  - Built on top of [lib/vehicleAudit.ts](/Users/danielarevez/ev-ownership-platform/lib/vehicleAudit.ts) and [lib/internalVehicleFiles.ts](/Users/danielarevez/ev-ownership-platform/lib/internalVehicleFiles.ts).
- **Content and SEO editor**: `/internal/content`
  - Edits page copy, translations, and SEO metadata for Portuguese, English, and Spanish.
  - Writes to [locales/pt.ts](/Users/danielarevez/ev-ownership-platform/locales/pt.ts), [locales/en.ts](/Users/danielarevez/ev-ownership-platform/locales/en.ts), and [locales/es.ts](/Users/danielarevez/ev-ownership-platform/locales/es.ts).
  - Cookie banner and legal-page copy currently remain direct locale-file edits.

## Technical Guides

For deep-dives into specific subsystems, see:
- [API Reference](/Users/danielarevez/ev-ownership-platform/docs/API_REFERENCE.md) - Documents public and internal API routes, parameters, and payloads.
- [Localization Guide](/Users/danielarevez/ev-ownership-platform/docs/LOCALIZATION.md) - Details language dictionaries, routing segment mapping, content editing, and adding new locales.
- [Analytics And Consent](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md) - Documents GTM, Consent Mode v2, cookie behaviour, and local testing.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Next.js selects another port automatically when `3000` is occupied. Always use the URL printed by `npm run dev`.

Run a production build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Current Development Notes

- `npm run build` passes.
- `npm run lint` passes with warnings only: remaining `<img>` usage and one CompareContext hook dependency warning.
- `npm run validate:vehicles` is the best way to see what vehicle data still needs cleanup. As of the latest review, it checks 82 vehicle folders and reports warnings only.
- `npm run generate:registry` can regenerate `data/registry/vehicles.json` from vehicle `core.json` files.
- Search, models, comparison, recommendation, localization, sitemap, robots, and internal tools are implemented, but data quality still depends on completing vehicle JSON and images.
- The latest production build generates 171 routes/pages, including localized legal pages.

## Recommended Next Improvements

1. Clean the validator-reported vehicle data issues.
2. Upload real vehicle images or keep placeholder usage intentional.
3. Replace remaining `<img>` usage with Next image handling where it matters for LCP.
4. Rotate internal credentials periodically and consider account-based authentication if more administrators are added.
5. Add richer ownership tools such as charging cost and incentives.
6. Validate the published GTM container for one GA4 page-view configuration and correct SPA navigation tracking.

## Vision

The goal is to make EV research feel concrete and transparent: not just which car has the biggest number, but which EV fits a driver’s budget, charging situation, driving range, family needs, and ownership expectations.

Built by Daniela Revez.
