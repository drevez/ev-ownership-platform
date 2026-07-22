import { describe, expect, it } from 'vitest'

import { buildComparisonMetrics } from '@/lib/comparison'
import { mapModelExplorerItemToComparisonVehicle } from '@/lib/models'
import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'
import type { VehicleDataForComparison } from '@/types/comparison'
import type { ModelExplorerItem } from '@/types/model'

function comparisonVehicle(
  id: string,
  price: NonNullable<VehicleDataForComparison['pricing']>['primaryPrice'],
  basePriceEur: number
): VehicleDataForComparison {
  return {
    id,
    brand: 'Test',
    model: id,
    variant: '',
    image: '',
    segment: '',
    bodyType: '',
    drivetrain: '',
    pricing: {
      basePriceEur,
      primaryPrice: price,
    },
  }
}

function priceSummary(
  kind: VehiclePriceSummary['kind'],
  priceFrom: number,
  extra: Partial<VehiclePriceSummary> = {}
): VehiclePriceSummary {
  return {
    kind,
    status: 'available',
    marketScope: kind === 'importedUsed'
      ? 'imported_to_pt'
      : kind === 'used'
        ? 'used_pt'
        : 'official_pt',
    market: 'PT',
    currency: 'EUR',
    priceFrom,
    isLegacy: false,
    ...extra,
  }
}

describe('comparison pricing', () => {
  it('labels comparison prices by new, used, imported used, and reference-new context', () => {
    const metrics = buildComparisonMetrics([
      comparisonVehicle('new', {
        kind: 'new',
        status: 'available',
        priceFrom: 42000,
      }, 42000),
      comparisonVehicle('used', {
        kind: 'used',
        status: 'available',
        priceFrom: 31000,
      }, 31000),
      comparisonVehicle('imported', {
        kind: 'importedUsed',
        status: 'available',
        priceFrom: 29000,
      }, 29000),
      comparisonVehicle('reference', {
        kind: 'new',
        status: 'not_sold_new',
        priceFrom: 51000,
      }, 51000),
    ], 'en')

    const priceMetric = metrics.find((metric) => metric.unit === '€')

    expect(priceMetric?.values.map((value) => value.displayValue)).toEqual([
      'New from 42,000 €',
      'Used from 31,000 €',
      'Imported used from 29,000 €',
      'Reference new price 51,000 €',
    ])
  })

  it('maps a model comparison to one from-price per price kind', () => {
    const model: ModelExplorerItem = {
      slug: 'test-model',
      brand: 'Test',
      model: 'Model',
      displayName: 'Test Model',
      heroImage: '',
      segment: 'C-SUV',
      bodyTypes: ['SUV'],
      drivetrains: ['RWD'],
      variantCount: 2,
      priceFromEur: 30000,
      primaryPrice: priceSummary('used', 30000),
      priceSummaries: [
        priceSummary('new', 47000, { modelYear: 2026 }),
        priceSummary('new', 45000, { modelYear: 2025 }),
        priceSummary('used', 32000, { yearFrom: 2024 }),
        priceSummary('used', 30000, { yearFrom: 2023 }),
        priceSummary('importedUsed', 28500, { yearFrom: 2022 }),
      ],
      maxRealRangeKm: 420,
      maxWltpRangeKm: 500,
      maxMotorwayRangeKm: 360,
      maxDcChargeKw: 170,
      minChargeTime10To80Min: 28,
      maxUsableBatteryKwh: 77,
      bestConsumptionWhKm: 165,
      maxSeats: 5,
      maxTrunkLiters: 520,
      newestModelYear: 2026,
      missingFields: [],
      dataCompleteness: 100,
      variants: [],
    }

    const comparisonVehicle = mapModelExplorerItemToComparisonVehicle(model)

    expect(comparisonVehicle.id).toBe('model:test-model')
    expect(comparisonVehicle.detailPath).toBe('/models/test-model')
    expect(comparisonVehicle.pricing?.basePriceEur).toBe(28500)
    expect(comparisonVehicle.pricing?.primaryPrice).toMatchObject({
      kind: 'importedUsed',
      priceFrom: 28500,
    })
    expect(comparisonVehicle.pricing?.priceSummaries).toEqual([
      expect.objectContaining({ kind: 'new', priceFrom: 45000 }),
      expect.objectContaining({ kind: 'used', priceFrom: 30000 }),
      expect.objectContaining({ kind: 'importedUsed', priceFrom: 28500 }),
    ])
  })
})
