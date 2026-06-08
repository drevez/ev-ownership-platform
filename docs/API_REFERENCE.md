# API Reference

This document covers the API endpoints provided by the EV Ownership Platform for fetching vehicle registries, loading detailed vehicle data, and evaluating recommendation profiles.

---

## 1. Registry API

### `GET /api/vehicles/all`
Returns the complete list of registered vehicles from the flat JSON registry. Useful for populating vehicle filters, lists, and search queries.

#### Response
- **Status**: `200 OK`
- **Content-Type**: `application/json`
- **Format**:
```json
{
  "vehicles": [
    {
      "id": "citroen-e-c3-30kwh-you",
      "brand": "Citroen",
      "model": "e-C3",
      "variant": "30kWh You",
      "segment": "B-Hatch",
      "bodyType": "Hatchback",
      "drivetrain": "FWD",
      "heroImage": "https://..."
    }
  ]
}
```

---

## 2. Vehicle Lookup API

### `GET /api/vehicles`
Loads, parses, and normalizes specific vehicle variant files by ID.

#### Query Parameters
- `ids`: Repeating query parameter string representing target vehicle variant folders (e.g. `?ids=tesla-model-y-long-range&ids=kia-ev5-tech`).

#### Response
- **Status**: `200 OK` (or `500 Internal Server Error` on lookup failure)
- **Content-Type**: `application/json`
- **Format**:
```json
{
  "vehicles": [
    {
      "id": "tesla-model-y-long-range",
      "brand": "Tesla",
      "model": "Model Y",
      "variant": "Long Range",
      "displayName": "Tesla Model Y Long Range",
      "image": "https://...",
      "segment": "D-SUV",
      "bodyType": "SUV",
      "drivetrain": "AWD",
      "doors": 5,
      "seats": 5,
      "modelYear": 2026,
      "battery": {
        "capacityKwh": 75,
        "usableKwh": 75,
        "type": "NMC"
      },
      "charging": {
        "maxPowerKw": 250,
        "dcChargeSpeedKw": 250,
        "acChargeSpeedKw": 11,
        "chargeTime10To80Min": 27
      },
      "efficiency": {
        "realWorldRangeKm": 435,
        "realWorldConsumption": 169
      },
      "dimensions": {
        "lengthMm": 4751,
        "widthMm": 1921,
        "heightMm": 1624,
        "wheelbaseMm": 2890,
        "trunkCapacityL": 854
      },
      "pricing": {
        "basePriceEur": 44990,
        "recommendedPriceEur": 44990
      }
    }
  ]
}
```

---

## 3. Recommendations API

### `POST /api/recommendations`
Accepts user preferences and priorities and executes the scoring recommendation engine.

#### Request Body
- **Content-Type**: `application/json`
- **Parameters**:
  - `budget` (number, required): Maximum purchasing budget in Euros.
  - `purchaseType` (string): `'new' | 'used' | 'either'`. Defaults to `'either'`.
  - `chargingAccess` (string): `'home' | 'work' | 'public' | 'mixed'`. Defaults to `'mixed'`.
  - `familySize` (number): Target number of passenger seats. Defaults to `2`.
  - `dailyCommuteKm` (number): Daily driving distance. Defaults to `30`.
  - `roadTrips` (string): `'never' | 'sometimes' | 'often'`. Defaults to `'sometimes'`.
  - `cargoNeed` (string): `'light' | 'medium' | 'large'`. Defaults to `'medium'`.
  - `bodyPreference` (string): `'any' | 'suv' | 'hatchback' | 'sedan' | 'wagon'`. Defaults to `'any'`.
  - `ownershipStyle` (string): `'balanced' | 'premium' | 'lowest_cost'`. Defaults to `'balanced'`.
  - `priorities` (array of strings): Subset of `['budget', 'range', 'charging', 'space', 'efficiency', 'comfort']`. Defaults to `['budget', 'range', 'charging']`.
  - `locale` (string): Target locale for localized descriptions (`'pt' | 'en' | 'es'`).

```json
{
  "budget": 35000,
  "purchaseType": "either",
  "chargingAccess": "home",
  "familySize": 4,
  "dailyCommuteKm": 50,
  "roadTrips": "sometimes",
  "cargoNeed": "large",
  "bodyPreference": "suv",
  "ownershipStyle": "balanced",
  "priorities": ["budget", "space"],
  "locale": "pt"
}
```

#### Response
- **Status**: `200 OK` (or `500 Internal Server Error` on scoring breakdown error)
- **Content-Type**: `application/json`
- **Format**:
```json
{
  "results": [
    {
      "vehicle": { ... },
      "score": 88.5,
      "matchPercentage": 89,
      "confidence": "high",
      "reasons": [
        "Preço confortável dentro do orçamento: 32,990 €",
        "Espaço adequado para passageiros e bagagens (5 lugares, 520 L)"
      ],
      "drawbacks": [],
      "tags": ["Dentro do Orçamento", "Familiar"],
      "estimatedMonthlyCost": 58,
      "priceDeltaEur": -2010,
      "breakdown": [
        {
          "category": "budget",
          "label": "Orçamento",
          "score": 27.5,
          "maxScore": 27.5,
          "reason": "..."
        }
      ]
    }
  ]
}
```

### `GET /api/recommendations`
Legacy GET endpoint fallback. Reads parameters from search parameters and returns recommendations.

#### Query Parameters
- `budget` (number)
- `homeCharging` (`'1'` to map charging access to `'home'`, otherwise maps to `'mixed'`)
- `roadTrips` (`'never'`, `'sometimes'`, `'often'`)
- `familySize` (number)
- `dailyCommuteKm` (number)
- `lang` (string, e.g. `pt`, `en`, `es`)

---

## 4. Internal Vehicle Create API

### `POST /api/internal/vehicles`
Creates a new modular vehicle folder and upserts a registry entry generated from `core.json`.

This endpoint requires the same server-side Basic Auth credentials as `/internal/*`.

#### Request Body
- **Content-Type**: `application/json`
- **Parameters**:
  - `id` (string, required): Vehicle folder id. Must use lowercase letters, numbers, and hyphens.
  - `files` (object, required): Object containing all vehicle module payloads.

Expected `files` keys:

```txt
core
battery
charging
comfort
dimensions
efficiency
pricing
```

```json
{
  "id": "xpeng-p7-long-range-rwd",
  "files": {
    "core": {
      "id": "xpeng-p7-long-range-rwd",
      "brand": "XPeng",
      "model": "P7",
      "variant": "Long Range RWD"
    },
    "battery": {},
    "charging": {},
    "comfort": {},
    "dimensions": {},
    "efficiency": {},
    "pricing": {}
  }
}
```

#### Response
- `200 OK`: `{ "ok": true, "id": "xpeng-p7-long-range-rwd" }`
- `400 Bad Request`: missing or invalid body
- `409 Conflict`: vehicle already exists

---

## 5. Internal Vehicle Update API

### `PUT /api/internal/vehicles/[id]`
Updates an existing modular vehicle folder and upserts the corresponding registry entry from `core.json`.

This endpoint requires the same server-side Basic Auth credentials as `/internal/*`.

#### Request Body
- **Content-Type**: `application/json`
- **Parameters**:
  - `files` (object, required): Full set of vehicle module payloads.

#### Response
- `200 OK`: `{ "ok": true, "id": "..." }`
- `400 Bad Request`: missing or invalid body
- `404 Not Found`: vehicle folder does not exist

---

## 6. Internal Content And SEO API

### `POST /api/internal/content`
Saves editable page copy, translations, and SEO metadata for Portuguese, English, and Spanish.

This endpoint writes directly to locale source files and requires server-side Basic Auth.

#### Request Body
- **Content-Type**: `application/json`
- **Parameters**:
  - `values` (object, required): Language-keyed map of editable field ids to strings.

Required top-level language keys:

```txt
pt
en
es
```

Example:

```json
{
  "values": {
    "pt": {
      "metadata.title": "MotorZero | Elétricos em linguagem humana",
      "metadata.description": "Compara modelos elétricos, autonomia, carregamento e preços."
    },
    "en": {
      "metadata.title": "MotorZero | EVs in human language",
      "metadata.description": "Compare electric vehicles, range, charging and prices."
    },
    "es": {
      "metadata.title": "MotorZero | Vehículos eléctricos en lenguaje humano",
      "metadata.description": "Compara vehículos eléctricos, autonomía, carga y precios."
    }
  }
}
```

Editable field ids are defined in [lib/internalContentFiles.ts](/Users/danielarevez/ev-ownership-platform/lib/internalContentFiles.ts).

#### Response
- `200 OK`: `{ "ok": true }`
- `400 Bad Request`: invalid content payload or write failure

---

## 7. Internal Route Summary

These routes support the private working surfaces:

```txt
/internal/vehicles
/internal/vehicles/new
/internal/vehicles/{id}
/internal/vehicles/{id}/edit
/internal/content
```

They are protected by server-side Basic Auth in the Proxy. Internal write APIs also verify authorization inside their Route Handlers.

---

## 8. Analytics Note

Analytics does not use an application API route. GTM is loaded centrally from `NEXT_PUBLIC_GTM_ID`, and consent state is handled in the browser.

See [ANALYTICS_CONSENT.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md). Do not add GA4 directly to API routes, layouts, or page components.
