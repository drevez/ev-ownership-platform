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
