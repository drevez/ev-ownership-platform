# Quick Reference

## Common Commands

```bash
npm run dev
npm run build
npm run lint
npm run validate:vehicles
```

## Important Files

```txt
README.md
VEHICLE_DATA_GUIDE.md
scripts/validate-vehicles.mjs
lib/loadVehicle.ts
lib/normalizeVehicle.ts
lib/comparison.ts
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

Important: `offers[]` is the target schema. The current app and validator still need a migration pass before it becomes the only supported runtime format.

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
- `npm run lint` still includes known follow-up issues in older code.
