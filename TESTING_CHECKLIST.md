# Testing Checklist

Use this checklist when adding vehicles, changing data normalization, or preparing a deploy.

## Build And Static Checks

- [ ] Run `npm run validate:vehicles`.
- [ ] Review validator errors first: invalid JSON, missing `core.id`, folder/core ID mismatches.
- [ ] Review validator warnings: missing images, missing pricing, unknown keys, registry mismatches.
- [ ] Run `npm run generate:registry` after bulk vehicle folder/core changes.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint` and note the known warnings: remaining `<img>` usage and CompareContext hook dependency.
- [ ] Start the app with `npm run dev`.

## Vehicle Data

- [ ] New vehicle folder is under `public/data/vehicles/{vehicle-id}`.
- [ ] Folder includes `battery.json`, `charging.json`, `comfort.json`, `core.json`, `dimensions.json`, `efficiency.json`, and `pricing.json`.
- [ ] `core.id` exactly matches the folder name.
- [ ] `data/registry/vehicles.json` includes the same ID.
- [ ] Required `core.json` fields exist: `id`, `brand`, `model`.
- [ ] Optional values can be missing without breaking the page.
- [ ] Unknown dimension values are `null` or omitted.
- [ ] Missing local images show `/images/vehicle-placeholder.svg`.

## Vehicle Detail Pages

- [ ] Vehicle detail route loads for a complete vehicle.
- [ ] Vehicle detail route loads for a partial vehicle.
- [ ] Hero image shows the real image or placeholder.
- [ ] Battery and charging card displays known values.
- [ ] Efficiency card hides unknown values.
- [ ] Dimensions card accepts `null` values without crashing.
- [ ] Pricing card appears for `pricing.offers[]`.
- [ ] Pricing card still tolerates intermediate `pricing.pt.new` / `pricing.pt.used` and legacy `pricing.pt.consumerPrice`.
- [ ] Compare section appears and can add the vehicle.

## Model Pages

- [ ] `/models` loads.
- [ ] Model cards show real images or placeholders.
- [ ] Variant counts look correct.
- [ ] `/models/{slug}` loads.
- [ ] Variant cards link to the right vehicle pages.
- [ ] Variant price, range, and charging values use normalized data.

## Comparison

- [ ] `/compare` loads with no selected vehicles.
- [ ] `/compare/models?models=...` compares model families.
- [ ] `/compare/versions?ids=...` compares exact vehicle variants.
- [ ] Selecting two vehicles opens a comparison result.
- [ ] Editing selection preserves the current selected vehicles.
- [ ] Switching simple/advanced mode preserves the selected vehicles and URL mode.
- [ ] Price comes from normalized pricing, preferring `pricing.offers[]` where available.
- [ ] Price labels distinguish new, used, imported used, and historical-reference contexts when those offers exist.
- [ ] Battery comes from `battery.batteryUsableKWh`.
- [ ] Charging speed comes from `charging.dcMaxChargeKW`.
- [ ] Charging time comes from `charging.charge10to80Min`.
- [ ] Dimensions use `lengthMM`, `widthMM`, `heightMM`, and `wheelbaseMM`.
- [ ] Trunk capacity uses `cargoLitersSeatsUp`.
- [ ] Missing values display as unavailable rather than crashing.
- [ ] Comparison bar persists selected vehicles through refresh.
- [ ] Share action uses native share on touch devices when available, and copy/WhatsApp/email options on desktop.

## Recommendations

- [ ] `/recommend` loads.
- [ ] Submitting the quiz returns results.
- [ ] Results tolerate missing pricing, range, comfort, or image data.
- [ ] Result cards link to vehicle detail pages.
- [ ] Placeholder image appears when the vehicle image has not been uploaded.

## Internal Tools

- [ ] `/internal/vehicles` loads the data health dashboard.
- [ ] `/internal/vehicles/new` can prepare a new vehicle in the seven-file JSON structure.
- [ ] `/internal/vehicles/{id}` can save changes and update the registry entry.
- [ ] `/internal/content` loads editable PT/EN/ES content and SEO fields.
- [ ] Saving in `/internal/content` updates locale files and the app still builds.
- [ ] `/internal/images` defaults to items needing attention, and can filter/sort approved, rejected, missing, referenced, and orphan images.
- [ ] `/internal/*` returns `401` without valid Basic Auth credentials.
- [ ] `/api/internal/*` returns `401` without valid Basic Auth credentials.
- [ ] Authenticated internal API requests reach normal payload validation.

## Responsive And Visual QA

- [ ] Home page works on mobile, tablet, and desktop.
- [ ] Vehicle pages have no overlapping text on mobile.
- [ ] Comparison page is readable with two and three vehicles.
- [ ] Comparison scores, badges, and scale values do not overflow on mobile.
- [ ] Sticky comparison bar does not cover important content.
- [ ] Buttons are large enough for touch.
- [ ] Text contrast is readable on dark and light sections.

## Analytics And Consent

- [ ] `NEXT_PUBLIC_GTM_ID` is configured locally and in Vercel.
- [ ] No direct GA4 or `gtag.js` installation exists outside GTM.
- [ ] Consent defaults are denied before GTM loads.
- [ ] First visit shows Accept all, Reject all, and Manage preferences.
- [ ] Analytics and marketing can be selected independently.
- [ ] Accept all grants all four Consent Mode v2 values.
- [ ] Reject all keeps all four optional values denied.
- [ ] Every saved choice pushes `consent_update`.
- [ ] Choice persists after reload and expires after 180 days.
- [ ] `_ga` and `_ga_*` do not exist before analytics consent.
- [ ] GA cookies appear after analytics consent and are removed after withdrawal.
- [ ] Footer Cookie settings reopens the preference panel.
- [ ] GTM Preview shows the expected consent initialization order.
- [ ] Initial loads and Next.js client navigation each create exactly one intended page view.
- [ ] `/pt/privacidade`, `/pt/cookies`, and `/pt/termos` load, with EN and ES equivalents.

## Feedback

- [ ] Page feedback appears on models, comparison, and recommendation flows only.
- [ ] Feedback is visually subtle and does not compete with primary CTAs.
- [ ] Thumbs up/down can be submitted without a text note.
- [ ] Optional text note appears after a vote.
- [ ] `/api/feedback` returns `stored: false` when no webhook is configured.
- [ ] If a webhook is configured, stats are returned and displayed according to the public-count threshold.

## Known Follow-Ups

- [ ] Clean validator warnings, especially missing images and module fields saved in the wrong JSON file.
- [ ] Replace remaining `<img>` usage with optimized image handling where it affects LCP.
- [ ] Rotate internal credentials before sharing access with another administrator.
