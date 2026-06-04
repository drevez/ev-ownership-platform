# Testing Checklist

Use this checklist when adding vehicles, changing data normalization, or preparing a deploy.

## Build And Static Checks

- [ ] Run `npm run validate:vehicles`.
- [ ] Review validator errors first: invalid JSON, missing `core.id`, folder/core ID mismatches.
- [ ] Review validator warnings: missing images, missing pricing, unknown keys, registry mismatches.
- [ ] Run `npm run build`.
- [ ] Run `npm run lint` and note any remaining known lint debt.
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
- [ ] Pricing card appears when `pricing.pt.consumerPrice` exists.
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
- [ ] Selecting two vehicles opens a comparison result.
- [ ] Price comes from `pricing.pt.consumerPrice.min`.
- [ ] Battery comes from `battery.batteryUsableKWh`.
- [ ] Charging speed comes from `charging.dcMaxChargeKW`.
- [ ] Charging time comes from `charging.charge10to80Min`.
- [ ] Dimensions use `lengthMM`, `widthMM`, `heightMM`, and `wheelbaseMM`.
- [ ] Trunk capacity uses `cargoLitersSeatsUp`.
- [ ] Missing values display as unavailable rather than crashing.
- [ ] Comparison bar persists selected vehicles through refresh.

## Recommendations

- [ ] `/recommend` loads.
- [ ] Submitting the quiz returns results.
- [ ] Results tolerate missing pricing, range, comfort, or image data.
- [ ] Result cards link to vehicle detail pages.
- [ ] Placeholder image appears when the vehicle image has not been uploaded.

## Responsive And Visual QA

- [ ] Home page works on mobile, tablet, and desktop.
- [ ] Vehicle pages have no overlapping text on mobile.
- [ ] Comparison page is readable with two and three vehicles.
- [ ] Sticky comparison bar does not cover important content.
- [ ] Buttons are large enough for touch.
- [ ] Text contrast is readable on dark and light sections.

## Known Follow-Ups

- [ ] Search should use registry/core aliases instead of the current hardcoded list.
- [ ] Registry can later be generated from `core.json`.
- [ ] Remaining lint debt should be cleaned once data model stabilization is done.
