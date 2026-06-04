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

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- JSON-backed vehicle catalog

Important: this repo uses Next.js 16. Before changing Next-specific APIs, read the local docs in `node_modules/next/dist/docs/`.

## Project Structure

```txt
app/                         App Router pages and API routes
components/                  UI components for vehicles, comparison, search, recommendations
context/                     Client state providers
data/registry/vehicles.json  Vehicle registry used for listing/static params
lib/                         Data loading, normalization, formatting, recommendation logic
locales/                     Portuguese, English, and Spanish copy
public/data/vehicles/        Canonical modular vehicle JSON dataset
public/images/               Shared images and placeholders
scripts/                     Maintenance scripts
types/                       Shared TypeScript types
```

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

## Data Health Dashboard

The application includes an internal visual dashboard to audit the entire dataset, tracking completeness, legacy formats, missing price contexts, and missing image files:

- **Path**: `/internal/vehicles`
- **Logic**: Built on top of [lib/vehicleAudit.ts](file:///Users/danielarevez/ev-ownership-platform/lib/vehicleAudit.ts), which performs comprehensive schema audits across all vehicle variant directories.

## Technical Guides

For deep-dives into specific subsystems, see:
- [API Reference](file:///Users/danielarevez/ev-ownership-platform/docs/API_REFERENCE.md) - Documents internal routes, parameters, and payloads.
- [Localization Guide](file:///Users/danielarevez/ev-ownership-platform/docs/LOCALIZATION.md) - Details language dictionaries, routing segment mapping, and adding new locales.

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
- `npm run validate:vehicles` is the best way to see what vehicle data still needs cleanup.
- Full lint still has known follow-up work in older components and recommendation typing.
- Search is still a follow-up area: the app should eventually search from registry/core aliases instead of a small hardcoded list.
- The registry can later be generated from `core.json` files to remove duplicate data entry.

## Recommended Next Improvements

1. Clean the validator-reported vehicle data issues.
2. Replace remaining older `any` types in recommendation and generic rendering code.
3. Move search to real vehicle data and localized aliases.
4. Generate `data/registry/vehicles.json` from vehicle `core.json` files.
5. Add richer ownership tools such as charging cost and incentives.

## Vision

The goal is to make EV research feel concrete and transparent: not just which car has the biggest number, but which EV fits a driver’s budget, charging situation, driving range, family needs, and ownership expectations.

Built by Daniela Revez.
