# Testing

The project uses Vitest for unit and contract tests.

## Commands

```bash
npm test
npm run test:watch
```

Before deployment, run:

```bash
npm test
npm run lint
npm run build
```

## Current coverage

- `tests/normalizeVehicle.test.ts`
  - Current and legacy pricing structures
  - New, used, imported, and historical-reference price selection
  - Technical field normalization
  - Localized display names and fallback images
- `tests/recommendEVs.test.ts`
  - Recommendation ranking
  - New versus used price selection
  - Budget, body preference, result limit, and incomplete data behavior
- `tests/i18nRouting.test.ts`
  - Localized and internal paths
  - Language switching with query strings and hashes
  - External, API, and fragment links
- `tests/vehicleDataValidation.test.ts`
  - Module ownership and field placement
  - Plausible numeric ranges and battery consistency
  - Pricing ranges, legacy migration warnings, and import context

## Manual Internal Checks

Image review is currently verified manually because it writes real project files:

- Open `/internal/images` with internal credentials.
- Confirm the default view prioritizes pending or rejected candidates needing attention.
- Switch filters between needs review, approved, rejected, and all candidates.
- Sort by attention, recent, brand/model, and status.
- Approve and create WebP for a test candidate, then confirm `public/cars/{vehicle-id}.webp` exists and the candidate shows final image metadata.
- Move an approved candidate back to rejected or pending only when replacing it; confirm the generated final asset is removed.
- Confirm vehicles without a final image still render `/images/vehicle-placeholder.svg`.

Add a regression test whenever a normalization, recommendation, or routing bug
is fixed. Keep scoring tests based on small explicit vehicle fixtures so their
expected ranking remains understandable.
