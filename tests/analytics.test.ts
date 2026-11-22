import { describe, expect, it } from 'vitest'

import {
  comparisonDataProperties,
  comparisonIdentifierProperties,
  singleVehicleFlatProperties,
  toAnalyticsVehicle,
  vehicleQualityProperties,
  vehicleQualityAggregateProperties,
} from '@/lib/analytics'
import { normalizeVehicleForComparison } from '@/lib/normalizeVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'

describe('analytics vehicle identifiers', () => {
  it('normalizes a vehicle variant without duplicating the brand in model', () => {
    const vehicle = toAnalyticsVehicle({
      id: 'alfa-romeo-junior-elettrica-51kwh',
      brand: 'Alfa Romeo',
      model: 'Alfa Romeo Junior Elettrica',
      variant: '51kWh',
    })

    expect(vehicle).toMatchObject({
      id: 'alfa-romeo-junior-elettrica-51kwh',
      model_id: 'alfa-romeo-junior-elettrica',
      brand: 'Alfa Romeo',
      model: 'Junior Elettrica',
    })
    expect(singleVehicleFlatProperties(vehicle)).toMatchObject({
      vehicle_id: 'alfa-romeo-junior-elettrica-51kwh',
      model_id: 'alfa-romeo-junior-elettrica',
      model_slug: 'alfa-romeo-junior-elettrica',
    })
  })

  it('removes the internal model prefix and emits model_ids for model comparisons', () => {
    const vehicles = [
      toAnalyticsVehicle({
        id: 'model:alfa-romeo-junior-elettrica',
        brand: 'Alfa Romeo',
        model: 'Junior Elettrica',
      }),
      toAnalyticsVehicle({
        id: 'model:audi-q4-e-tron',
        brand: 'Audi',
        model: 'Q4 e-tron',
      }),
    ]

    expect(vehicles.map((vehicle) => vehicle.id)).toEqual([
      'alfa-romeo-junior-elettrica',
      'audi-q4-e-tron',
    ])
    expect(comparisonIdentifierProperties(vehicles, 'models')).toEqual({
      model_ids: ['alfa-romeo-junior-elettrica', 'audi-q4-e-tron'],
    })
  })

  it('emits vehicle_ids for version comparisons', () => {
    const vehicles = [
      toAnalyticsVehicle({
        id: 'alfa-romeo-junior-elettrica-51kwh',
        brand: 'Alfa Romeo',
        model: 'Junior Elettrica',
      }),
      toAnalyticsVehicle({
        id: 'audi-q4-e-tron-45',
        brand: 'Audi',
        model: 'Q4 e-tron',
      }),
    ]

    expect(comparisonIdentifierProperties(vehicles, 'versions')).toEqual({
      vehicle_ids: 'alfa-romeo-junior-elettrica-51kwh|audi-q4-e-tron-45',
    })
  })

  it('derives a deterministic comparison_set from rich entities', () => {
    const entities = [
      toAnalyticsVehicle({
        id: 'model:byd-seal',
        brand: 'BYD',
        model: 'Seal',
      }),
      toAnalyticsVehicle({
        id: 'model:audi-q4-e-tron',
        brand: 'Audi',
        model: 'Q4 e-tron',
      }),
      toAnalyticsVehicle({
        id: 'model:byd-seal',
        brand: 'BYD',
        model: 'Seal',
      }),
    ]

    const properties = comparisonDataProperties(entities, 'models')

    expect(properties.entities).toEqual(entities)
    expect(properties.vehicles).toBe(properties.entities)
    expect(properties.comparison_set).toBe('audi-q4-e-tron|byd-seal')
    expect(properties.vehicle_set).toBe(properties.comparison_set)
    expect(properties.vehicle_ids).toBe('byd-seal|audi-q4-e-tron|byd-seal')
    expect(properties.model_ids).toEqual([
      'byd-seal',
      'audi-q4-e-tron',
      'byd-seal',
    ])
    expect(properties.entities[0]).toMatchObject({
      id: 'byd-seal',
      model_id: 'byd-seal',
      brand: 'BYD',
      model: 'Seal',
    })
  })
})

describe('analytics price and image context', () => {
  it.each([
    ['new', 'official_pt', 'new'],
    ['used', 'used_pt', 'used'],
    ['used', 'imported_to_pt', 'imported_used'],
  ] as const)('preserves %s/%s context after comparison normalization', (condition, marketScope, expected) => {
    const raw = {
      id: 'test-car', brand: 'Test', model: 'Car', image: '/cars/test.webp',
      pricing: { offers: [{ condition, marketScope, status: 'available' as const, priceFrom: 20000 }] },
    }
    const normalized = normalizeVehicleForComparison(raw)
    for (const vehicle of [raw, normalized]) {
      expect(vehicleQualityProperties(vehicle)).toMatchObject({
        price_context: expected, has_price: true, data_quality_status: 'ready',
      })
    }
  })

  it('uses the same preferred raw offer as the pricing UI', () => {
    expect(vehicleQualityProperties({ pricing: { offers: [
      { condition: 'used', marketScope: 'used_pt', priceFrom: 10000 },
      { condition: 'new', marketScope: 'official_pt', priceFrom: 20000 },
    ] } }).price_context).toBe('new')
  })

  it('does not count placeholders or zero prices as usable data', () => {
    expect(vehicleQualityProperties({ image: VEHICLE_PLACEHOLDER_IMAGE, pricing: { basePriceEur: 0 } })).toMatchObject({
      has_image: false, has_price: false, price_context: 'unknown', data_quality_status: 'incomplete',
    })
    expect(vehicleQualityAggregateProperties([
      { image: '/cars/test.webp', pricing: { basePriceEur: 20000 } },
      { image: VEHICLE_PLACEHOLDER_IMAGE },
    ])).toMatchObject({ ready_vehicle_count: 1, incomplete_vehicle_count: 1, has_missing_data: true })
  })
})
