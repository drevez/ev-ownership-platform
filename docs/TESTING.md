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
- `tests/comparisonPricing.test.ts`
  - New, used, imported, and historical-reference price labels in comparison data
  - Single "from" price selection instead of displaying ranges
- `tests/vehicleDataValidation.test.ts`
  - Module ownership and field placement
  - Plausible numeric ranges and battery consistency
  - Pricing ranges, legacy migration warnings, and import context

## Manual Public Checks

- Open `/pt/modelos`, `/en/models`, and `/es/modelos`; confirm filters, sorting, language switching, and placeholder images.
- Open `/pt/comparador/modelos?models=xpeng-p7&models=xpeng-g6&mode=simple`; confirm the comparison keeps selected models while changing mode or editing selection.
- Open `/pt/comparador/versoes?ids=tesla-model-y-long-range&ids=kia-ev5-tech&mode=simple`; confirm exact variants remain selected while changing mode or editing selection.
- Test comparison on a narrow mobile viewport; cards, scores, CTAs, and share controls should stay inside the page width.
- Test the share button on desktop and mobile/touch emulation. Desktop should offer copy/WhatsApp/email options; touch-capable devices should prefer native share when available.
- Confirm page feedback appears subtly on model, comparison, and recommendation flows, and does not appear on legal, contact, about, guide, charging, or FAQ pages.
- Submit thumbs up/down feedback. With no webhook configured, `/api/feedback` should return `stored: false` without breaking the UI.
- Open `/pt/guias`, `/pt/carregamento`, `/pt/perguntas-frequentes`, and switch languages; URLs should translate to `/en/guides`, `/en/charging`, `/en/faq`, `/es/guias`, `/es/carga`, and `/es/preguntas-frecuentes`.

## Manual Internal Checks

Image review is currently verified manually because it writes real project files:

- Open `/internal/images` with internal credentials.
- Confirm the default view prioritizes pending or rejected candidates needing attention.
- Switch filters between needs review, approved, rejected, and all candidates.
- Sort by attention, recent, brand/model, and status.
- Approve and create WebP for a test candidate, then confirm `public/cars/{vehicle-id}.webp` exists and the candidate shows final image metadata.
- Move an approved candidate back to rejected or pending only when replacing it; confirm the generated final asset is removed.
- Confirm vehicles without a final image still render `/images/vehicle-placeholder.svg`.
- Confirm approved final images can still be replaced later, and that the default image review view prioritizes items needing attention rather than already-approved assets.

Add a regression test whenever a normalization, recommendation, or routing bug
is fixed. Keep scoring tests based on small explicit vehicle fixtures so their
expected ranking remains understandable.
