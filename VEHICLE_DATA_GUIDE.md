# Vehicle Data Guide

This project uses a modular JSON structure for every EV variant. The JSON files are the canonical source of vehicle data. Application code should adapt to this schema through normalization instead of forcing the JSON to match older UI field names.

## Folder Layout

Each vehicle variant lives in:

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

The folder name, `core.id`, and registry `id` should match exactly.

## Current Implementation Status

The vehicle files are being migrated toward a cleaner schema. Keep these two states separate:

- **Current app support:** the app currently reads legacy `pricing.pt.consumerPrice`, plus the intermediate `pricing.pt.new`, `pricing.pt.used`, and `pricing.pt.importedUsed` shape used by normalization and the internal audit.
- **Target data format:** new or migrated pricing files should use the `pricing.offers[]` shape documented below.

Before converting all vehicle files to `pricing.offers[]`, update these code paths so the app, validator, and internal dashboard all read the target schema:

```txt
lib/loadVehicle.ts
lib/normalizeVehicle.ts
lib/vehicleAudit.ts
scripts/validate-vehicles.mjs
components/vehicle/PricingCard.tsx
```

Until that migration is implemented, `pricing.offers[]` is the documented target format for future agents, not yet the only runtime format.

## Registry Entry

Every vehicle folder should have a matching entry in:

```txt
data/registry/vehicles.json
```

Minimum registry entry:

```json
{
  "id": "xpeng-p7-long-range-rwd",
  "brand": "XPeng",
  "model": "P7",
  "variant": "Long Range RWD",
  "segment": "D-Sedan",
  "bodyType": "Sedan",
  "heroImage": "/cars/xpeng-p7-long-range-rwd.webp"
}
```

Registry values should match `core.json` where both exist. The registry is used for fast lists, model grouping, and app navigation, while the per-vehicle JSON files remain the canonical detailed source.

## Required Core Fields

`core.json` must include:

```json
{
  "id": "xpeng-p7-long-range-rwd",
  "brand": "XPeng",
  "model": "P7"
}
```

Recommended fields:

```json
{
  "variant": "Long Range RWD",
  "modelYear": 2026,
  "segment": "D-Sedan",
  "bodyType": "Sedan",
  "drivetrain": "RWD",
  "doors": 4,
  "seats": 5,
  "image": "/cars/xpeng-p7-long-range-rwd.webp",
  "localized": {
    "pt": {
      "displayName": "XPeng P7 Long Range RWD",
      "searchAliases": ["xpeng p7", "p7 long range"]
    }
  }
}
```

## Localization

Portuguese is the primary market language. English and Spanish should be included when available, but incomplete translations should not block vehicle creation.

Recommended `localized` shape in `core.json`:

```json
{
  "localized": {
    "pt": {
      "displayName": "XPeng P7 Long Range RWD",
      "searchAliases": [
        "xpeng p7",
        "p7",
        "xpeng p7 long range"
      ]
    },
    "en": {
      "displayName": "XPeng P7 Long Range RWD",
      "searchAliases": [
        "xpeng p7",
        "p7 long range"
      ]
    },
    "es": {
      "displayName": "XPeng P7 Long Range RWD",
      "searchAliases": [
        "xpeng p7",
        "p7 long range"
      ]
    }
  }
}
```

Rules:

- `pt.displayName` is the most important localized name.
- `searchAliases` should include common Portuguese names, accents/no-accents variants when useful, old model names, and common user shortcuts.
- Keep aliases lowercase unless the official name needs uppercase characters.
- Do not invent localized variant names if the market uses the English trim name.

## Module Field Reference

## General Data Rules

- Use metric units only.
- Use numbers for numeric values, not formatted strings.
- Use `null` when a value is intentionally unknown.
- Omit a field only when it is not relevant or not researched yet.
- Do not use `0` for unknown values. Use `0` only when the real value is zero, for example `frunkLiters: 0`.
- Keep dates simple: `YYYY-MM` for current market data, `YYYY` for historical references.
- Prefer truthful incomplete data over invented precision.
- Do not add new top-level keys to required module files unless the validator and loader are updated too.

### battery.json

```json
{
  "batteryChemistry": "NMC",
  "batteryGrossKWh": 86.2,
  "batteryUsableKWh": 82.7,
  "voltageArchitecture": 400
}
```

### charging.json

```json
{
  "dcMaxChargeKW": 175,
  "acMaxChargeKW": 11,
  "charge10to80Min": 29,
  "chargePer10MinKm": 155,
  "plugAndChargeSupport": false,
  "teslaSuperchargerAccess": false,
  "chargingCurveId": "xpeng-p7-long-range-rwd"
}
```

### comfort.json

The level fields are simple editorial scores for comparison and recommendation logic.

- `softwareExperienceLevel`: 1 means basic, 10 means excellent.
- `maintenanceLevel`: 1 means low expected maintenance burden, 10 means high.
- `insuranceLevel`: 1 means low expected insurance burden, 10 means high.

```json
{
  "heatPumpAvailable": true,
  "vehicleToLoad": false,
  "vehicleToGrid": false,
  "panoramicRoof": true,
  "softwareExperienceLevel": 9,
  "maintenanceLevel": 1,
  "insuranceLevel": 2
}
```

### dimensions.json

Use `null` when the value is intentionally unknown.

```json
{
  "cargoLitersSeatsUp": 440,
  "cargoLitersSeatsDown": null,
  "frunkLiters": 0,
  "rearLegroomMM": null,
  "wheelbaseMM": 2998,
  "lengthMM": 4888,
  "widthMM": 1896,
  "heightMM": 1450
}
```

### efficiency.json

```json
{
  "wltpRangeKm": 576,
  "estimatedRealRangeKm": 490,
  "motorwayRangeKm": 400,
  "realWorldConsumptionWhKm": 169,
  "realMotorwayConsumptionWhKm": 215
}
```

### pricing.json

Use the `offers` structure for new vehicle data. This keeps Portugal as the market context while allowing the app to distinguish current new prices, used prices, imported used prices, and historical new-reference prices.

Note: older files may still use `pt.consumerPrice`, `pt.businessPriceExVat`, and `pt.usedPrice`. Treat those as legacy. New or migrated vehicle files should use the `offers` structure below.

```json
{
  "market": "pt",
  "currency": "EUR",
  "lastReviewedAt": "2026-05",
  "offers": [
    {
      "condition": "new",
      "status": "available",
      "marketScope": "official_pt",
      "priceFrom": 55990,
      "priceTo": 64990,
      "priceDate": "2026-05",
      "modelYear": 2026,
      "includesVat": true,
      "sourceType": "official_brand",
      "sourceLabel": "XPeng Portugal",
      "sourceUrl": null,
      "confidence": "medium",
      "displayPriority": 1,
      "notes": null
    }
  ]
}
```

Keep dates simple and user-readable:

- Use `YYYY-MM` for current market prices, for example `2026-05`.
- Use `YYYY` for historical reference prices when only the year matters, for example `2024`.
- Do not use full dates unless the source really needs day-level precision.

Use `null` for unknown prices. Do not use `0` to mean unknown, because `0` can break sorting, filters, recommendations, and "from price" labels.

Do not store user-facing price labels in JSON. The app derives translated labels from `condition`, `status`, and `marketScope`:

```txt
new + available + official_pt       -> Novo desde / New from / Nuevo desde
used + available + used_pt          -> Usado desde / Used from / Usado desde
used + available + imported_to_pt   -> Importado usado desde / Imported used from / Importado usado desde
new + not_sold_new                  -> Preço novo de referência / Reference new price / Precio nuevo de referencia
```

#### Pricing Offer Fields

Each object in `offers` should use these fields:

```json
{
  "condition": "new",
  "status": "available",
  "marketScope": "official_pt",
  "priceFrom": 55990,
  "priceTo": 64990,
  "priceDate": "2026-05",
  "modelYear": 2026,
  "yearFrom": null,
  "yearTo": null,
  "includesVat": true,
  "originMarkets": [],
  "estimatedPortugalCostsIncluded": null,
  "sourceType": "official_brand",
  "sourceLabel": "XPeng Portugal",
  "sourceUrl": null,
  "confidence": "medium",
  "displayPriority": 1,
  "notes": null
}
```

Allowed `condition` values:

- `new`: new vehicle price or historical new-reference price.
- `used`: used vehicle price.

Allowed `status` values:

- `available`: this price is currently relevant and available.
- `not_sold_new`: the vehicle is no longer sold new; the price is only a historical new-reference price.
- `not_enough_data`: there is not enough reliable data yet.
- `not_sold_in_pt`: not officially sold in Portugal in this condition.
- `unknown`: not confirmed.

Allowed `marketScope` values:

- `official_pt`: official Portugal new price.
- `new_import`: new vehicle from another market that may be imported.
- `used_pt`: used vehicle in Portugal.
- `imported_to_pt`: used vehicle from another market, considered for Portugal.
- `unknown`: market scope not confirmed.

Allowed `sourceType` values:

- `official_brand`
- `dealer`
- `classifieds`
- `market_estimate`
- `manual`
- `unknown`

Allowed `confidence` values:

- `high`
- `medium`
- `low`
- `unknown`

#### Current New Vehicle Example

Use this when the vehicle is currently sold new in Portugal.

```json
{
  "market": "pt",
  "currency": "EUR",
  "lastReviewedAt": "2026-05",
  "offers": [
    {
      "condition": "new",
      "status": "available",
      "marketScope": "official_pt",
      "priceFrom": 55990,
      "priceTo": 64990,
      "priceDate": "2026-05",
      "modelYear": 2026,
      "includesVat": true,
      "sourceType": "official_brand",
      "sourceLabel": "Official Portugal price",
      "sourceUrl": null,
      "confidence": "medium",
      "displayPriority": 1,
      "notes": null
    }
  ]
}
```

User-facing copy should read:

```txt
Novo desde 55 990 €
Atualizado em 2026-05
```

#### No Longer Sold New Example

Use this when the vehicle is mainly relevant as used, but the historical new price is still useful as a reference.

```json
{
  "market": "pt",
  "currency": "EUR",
  "lastReviewedAt": "2026-05",
  "offers": [
    {
      "condition": "used",
      "status": "available",
      "marketScope": "used_pt",
      "priceFrom": 28900,
      "priceTo": 36000,
      "priceDate": "2026-05",
      "yearFrom": 2021,
      "yearTo": 2023,
      "includesVat": true,
      "sourceType": "classifieds",
      "sourceLabel": "Portugal used market",
      "sourceUrl": null,
      "confidence": "medium",
      "displayPriority": 1,
      "notes": null
    },
    {
      "condition": "new",
      "status": "not_sold_new",
      "marketScope": "official_pt",
      "priceFrom": 46990,
      "priceTo": 52990,
      "priceDate": "2021",
      "modelYear": 2021,
      "includesVat": true,
      "sourceType": "official_brand",
      "sourceLabel": "Official price when sold new",
      "sourceUrl": null,
      "confidence": "low",
      "displayPriority": 2,
      "notes": "Historical new price kept only as reference."
    }
  ]
}
```

User-facing copy should read:

```txt
Usado desde 28 900 €
Mercado usado PT, atualizado em 2026-05

Preço novo de referência 46 990 €
Quando vendido novo em 2021
```

#### Imported Used Example

Use this when the price refers to used vehicles from other markets that may be imported into Portugal.

```json
{
  "condition": "used",
  "status": "available",
  "marketScope": "imported_to_pt",
  "originMarkets": ["DE", "FR", "ES"],
  "priceFrom": 31900,
  "priceTo": 42000,
  "priceDate": "2026-05",
  "yearFrom": 2021,
  "yearTo": 2023,
  "estimatedPortugalCostsIncluded": false,
  "sourceType": "market_estimate",
  "sourceLabel": "EU used market estimate",
  "sourceUrl": null,
  "confidence": "low",
  "displayPriority": 3,
  "notes": "Portuguese import costs are not included."
}
```

User-facing copy must make the import context clear:

```txt
Importado usado desde 31 900 €
Custos de legalização em Portugal não incluídos
```

#### Pricing Display Rules

Use `displayPriority` to decide which price appears first.

Recommended priority:

1. Current official Portugal new price: `condition: "new"`, `status: "available"`, `marketScope: "official_pt"`.
2. Portugal used price: `condition: "used"`, `status: "available"`, `marketScope: "used_pt"`.
3. Imported used estimate: `condition: "used"`, `status: "available"`, `marketScope: "imported_to_pt"`.
4. Historical new-reference price: `condition: "new"`, `status: "not_sold_new"`.

Important wording rules for the UI:

- Never show `Novo desde` for `status: "not_sold_new"`.
- Use `Preço novo de referência` for historical new prices.
- Use `Usado desde` only for used prices in Portugal.
- Use `Importado usado desde` when `marketScope` is `imported_to_pt`.
- If `estimatedPortugalCostsIncluded` is `false`, always mention that Portugal import costs are not included.

## Normalization

The app normalizes canonical JSON fields in [lib/normalizeVehicle.ts](/Users/danielarevez/ev-ownership-platform/lib/normalizeVehicle.ts).

Examples:

```txt
batteryUsableKWh              -> battery.capacityKwh
dcMaxChargeKW                 -> charging.dcChargeSpeedKw
charge10to80Min               -> charging.chargeTime10To80Min
pricing.offers[].priceFrom    -> pricing.basePriceEur
pricing.pt.consumerPrice.min  -> pricing.basePriceEur (legacy)
lengthMM                      -> dimensions.lengthMm
cargoLitersSeatsUp            -> dimensions.trunkCapacityL
```

This keeps the vehicle JSON clean while allowing old and new UI code to consume stable values.

## Image Workflow

Set the future image path in `core.json`:

```json
"image": "/cars/xpeng-p7-long-range-rwd.webp"
```

If the image file is missing, the app uses:

```txt
/images/vehicle-placeholder.svg
```

Run validation to see which vehicles still need real images.

## Validation

Run:

```bash
npm run validate:vehicles
```

The validator reports data issues without failing the command. Use it while adding vehicles to find:

- invalid JSON
- missing files
- missing required core fields
- ID mismatches
- unknown keys
- missing images
- missing pricing blocks
- registry mismatches

The current validator still expects the runtime-supported pricing structures. After the app is migrated to `pricing.offers[]`, update the validator so future agents do not receive false warnings for correctly migrated pricing files.

## Optional Files

Some folders may contain extra files such as:

```txt
pros-cons.json
```

These files are optional and are not part of the required seven-module vehicle schema unless the app code is updated to read and validate them. Future agents should not create optional files unless specifically asked.

## Data Entry Checklist

- Folder name matches `core.id`.
- Registry entry exists for the vehicle ID.
- All seven module files exist.
- JSON parses correctly.
- `core.brand` and `core.model` are present.
- `pricing.offers` exists with at least one relevant offer when pricing is known.
- Each pricing offer has `condition`, `status`, `marketScope`, `priceDate`, `sourceType`, `confidence`, and `displayPriority`.
- Do not store translated UI labels in `pricing.json`; the app translates labels from `condition`, `status`, and `marketScope`.
- Used prices include `yearFrom` and `yearTo` when known.
- Imported used prices include `originMarkets` and whether Portuguese import costs are included.
- Image path is set, even if the real image will be uploaded later.
- Unknown numeric values use `null` or are omitted.

## Instructions For Future Data Agents

When asked to create or migrate vehicle JSON files, follow these rules:

1. Keep each vehicle variant in its own folder under `public/data/vehicles/{vehicle-id}/`.
2. Use the modular files listed in this guide: `core.json`, `battery.json`, `charging.json`, `comfort.json`, `dimensions.json`, `efficiency.json`, and `pricing.json`.
3. For `pricing.json`, use the `offers` array, not the legacy `pt.consumerPrice` format.
4. Decide whether the vehicle is currently sold new in Portugal:
   - If yes, add a `new` offer with `status: "available"` and `marketScope: "official_pt"`.
   - If no, add a `new` offer with `status: "not_sold_new"` only when a historical new price is useful.
5. Add used market data separately:
   - Use `condition: "used"` and `marketScope: "used_pt"` for Portugal used-market prices.
   - Use `condition: "used"` and `marketScope: "imported_to_pt"` for imported used-market estimates.
6. Keep dates simple:
   - Use `YYYY-MM` for current market observations.
   - Use `YYYY` for historical new-reference prices.
7. Never use `0` for unknown prices. Use `null` or omit the price field.
8. Include source and confidence fields even when the value is `unknown`; this makes later cleanup easier.
9. Prefer truthful incomplete data over invented precision. If the source is weak, set `confidence: "low"` and explain the uncertainty in `notes`.
