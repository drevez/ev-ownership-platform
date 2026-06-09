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

Add a regression test whenever a normalization, recommendation, or routing bug
is fixed. Keep scoring tests based on small explicit vehicle fixtures so their
expected ranking remains understandable.
