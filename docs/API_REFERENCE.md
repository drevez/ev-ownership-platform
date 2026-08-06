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

## 2. Model APIs

### `GET /api/models/all`
Returns grouped model data for the public model catalog. Use this when the UI
needs model families rather than exact vehicle variants.

#### Response
- **Status**: `200 OK`
- **Content-Type**: `application/json`

### `GET /api/models/compare`
Returns comparison-ready model-family data for selected model slugs.

#### Query Parameters
- `models`: Repeating query parameter string representing model slugs (e.g. `?models=xpeng-p7&models=xpeng-g6`).

#### Response
- **Status**: `200 OK`
- **Content-Type**: `application/json`

---

## 3. Vehicle Lookup API

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

## 4. Recommendations API

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

## 5. Feedback API

### `GET /api/feedback`
Returns page-level feedback stats when a persistence webhook is configured.

This route is public, but it only returns aggregate counts from the configured
webhook. If no webhook exists, it returns `stats: null`.

#### Query Parameters
- `pagePath` (string, required): Delocalized or localized page path to look up.

#### Response
- `200 OK`: `{ "stats": { "helpfulCount": 12, "notHelpfulCount": 3, "totalCount": 15 } }`
- `200 OK`: `{ "stats": null }` when not configured or no stats exist.
- `502 Bad Gateway`: webhook stats request failed.

### `POST /api/feedback`
Receives lightweight page feedback from public pages such as models, comparison,
and recommendation. The route sanitizes text, validates the vote, and forwards
the event to `FEEDBACK_WEBHOOK_URL` if configured.

No database is bundled with the app. The endpoint is intentionally adapter-like
so it can later forward to Google Apps Script, Supabase, PostHog, or another
private endpoint.

#### Request Body
- **Content-Type**: `application/json`
- **Parameters**:
  - `kind` (string): `vote` or `note`. Defaults to `vote`.
  - `helpful` (boolean, required): `true` for thumbs up, `false` for thumbs down.
  - `pagePath` (string, required): Page path where feedback was submitted.
  - `pageUrl` (string): Full browser URL.
  - `locale` (string): Current language code.
  - `message` (string): Optional note, capped server-side.
  - `viewport` (string): Optional viewport dimensions.

```json
{
  "kind": "vote",
  "helpful": true,
  "pagePath": "/pt/comparador/modelos",
  "pageUrl": "https://motorzero.pt/pt/comparador/modelos?models=xpeng-p7&models=xpeng-g6",
  "locale": "pt",
  "viewport": "390x844"
}
```

#### Response
- `200 OK`: `{ "stored": true, "stats": { ... } }` when webhook forwarding succeeds.
- `200 OK`: `{ "stored": false, "stats": null }` when no webhook is configured.
- `400 Bad Request`: invalid vote or missing page path.
- `500 Internal Server Error`: feedback submission failed.

Relevant environment variables:

```env
FEEDBACK_WEBHOOK_URL=
FEEDBACK_WEBHOOK_SECRET=
```

### `POST /api/vehicle-suggestions`
Receives lightweight missing-vehicle suggestions from no-result states in search,
model exploration, and comparison selection. The route sanitizes text, requires a
model name, and forwards the event to `VEHICLE_SUGGESTIONS_WEBHOOK_URL` if
configured.

No database is bundled with the app. The endpoint is intentionally adapter-like
so it can later forward to Google Apps Script, Supabase, or another private
endpoint used by the internal backlog.

#### Request Body
- **Content-Type**: `application/json`
- **Parameters**:
  - `brand` (string): Suggested brand.
  - `model` (string, required): Suggested model.
  - `variant` (string): Suggested version/variant.
  - `marketContext` (string): `portugal_new`, `portugal_used`, `import`, or `not_sure`.
  - `note` (string): Optional context, capped server-side.
  - `sourcePage` (string, required): Page path where suggestion was submitted.
  - `sourceComponent` (string): UI source such as `home_search`, `models_explorer`, or `comparison_selector`.
  - `locale` (string): Current language code.
  - `queryNormalized` (string): Normalized search query that led to the suggestion.
  - `resultCount` (number): Result count at the time of suggestion.

```json
{
  "brand": "Renault",
  "model": "Scenic E-Tech",
  "variant": "Long Range",
  "marketContext": "portugal_new",
  "sourcePage": "/pt/modelos",
  "sourceComponent": "models_explorer",
  "locale": "pt",
  "queryNormalized": "renault scenic",
  "resultCount": 0
}
```

#### Response
- `200 OK`: `{ "stored": true }` when webhook forwarding succeeds.
- `200 OK`: `{ "stored": false }` when no webhook is configured.
- `400 Bad Request`: missing model or source page.
- `500 Internal Server Error`: suggestion submission failed.

Relevant environment variables:

```env
VEHICLE_SUGGESTIONS_WEBHOOK_URL=
VEHICLE_SUGGESTIONS_WEBHOOK_SECRET=
```

---

## 6. Internal Vehicle Create API

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

## 7. Internal Vehicle Update API

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

## 8. Internal Content And SEO API

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

## 9. Internal Image Review API

### `POST /api/internal/images/review`
Updates the review state for a vehicle image candidate or promotes an approved
candidate into a final WebP asset.

This endpoint requires the same server-side Basic Auth credentials as
`/internal/*`. It is designed for form submissions from `/internal/images`.

#### Request Body
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `vehicleId` (string, required): Vehicle id the candidate belongs to.
  - `filename` (string, required): Expected WebP filename, usually `{vehicle-id}.webp`.
  - `status` (string, required): `ai_selected_pending_review`, `approved`, or `rejected`.
  - `action` (string, optional): `promote` creates the final WebP asset and marks the candidate approved.
  - `returnTo` (string, optional): Safe internal path to redirect back to.

Promotion reads either a local candidate path or a direct image URL from
`data/internal/vehicle-image-candidates.json`, creates a WebP file in
`public/cars/`, and stores final image metadata in the same manifest.

#### Response
- `303 See Other`: redirects back to the internal image page with `imageUpdated` or `imageError`.
- `400 Bad Request`: invalid form payload.
- `401 Unauthorized`: missing or invalid internal credentials.

---

## 10. Internal Route Summary

These routes support the private working surfaces:

```txt
/internal
/internal/vehicles
/internal/vehicles/new
/internal/vehicles/{id}
/internal/vehicles/{id}/edit
/internal/content
/internal/images
```

They are protected by server-side Basic Auth in the Proxy. Internal write APIs also verify authorization inside their Route Handlers.

---

## 11. Analytics Note

Analytics does not use an application API route. GTM is loaded centrally from `NEXT_PUBLIC_GTM_ID`, and consent state is handled in the browser.

See [ANALYTICS_CONSENT.md](/Users/danielarevez/ev-ownership-platform/docs/ANALYTICS_CONSENT.md). Do not add GA4 directly to API routes, layouts, or page components.
