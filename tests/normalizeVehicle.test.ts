import { describe, expect, it } from 'vitest'

import {
  getPrimaryVehiclePriceSummary,
  getVehiclePriceSummaries,
  normalizeVehicleForComparison,
} from '@/lib/normalizeVehicle'
import type { VehicleData, VehiclePricing } from '@/lib/loadVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'

describe('vehicle normalization', () => {
  it('normalizes the current modular vehicle fields for comparison', () => {
    const vehicle: VehicleData = {
      id: 'test-ev',
      brand: 'Marca',
      model: 'Modelo',
      variant: 'Long Range',
      image: '/cars/test.webp',
      localized: {
        pt: { displayName: 'Marca Modelo Long Range' },
        en: { displayName: 'Brand Model Long Range' },
      },
      battery: {
        batteryGrossKWh: 82,
        batteryUsableKWh: 77,
        batteryChemistry: 'NMC',
      },
      charging: {
        dcMaxChargeKW: 175,
        acMaxChargeKW: 11,
        charge10to80Min: 29,
      },
      efficiency: {
        wltpRangeKm: 530,
        estimatedRealRangeKm: 450,
        realWorldConsumptionWhKm: 171,
      },
      dimensions: {
        cargoLitersSeatsUp: 520,
        lengthMM: 4700,
      },
    }

    const normalized = normalizeVehicleForComparison(vehicle, 'en')

    expect(normalized.displayName).toBe('Brand Model Long Range')
    expect(normalized.battery?.capacityKwh).toBe(77)
    expect(normalized.charging).toMatchObject({
      maxPowerKw: 175,
      dcChargeSpeedKw: 175,
      acChargeSpeedKw: 11,
      chargeTime10To80Min: 29,
    })
    expect(normalized.efficiency).toMatchObject({
      realWorldRangeKm: 450,
      realWorldConsumption: 171,
      wltpConsumptionKwh100km: 17.1,
    })
    expect(normalized.dimensions).toMatchObject({
      trunkCapacityL: 520,
      lengthMm: 4700,
    })
  })

  it('orders target offers by display priority and keeps market context', () => {
    const pricing: VehiclePricing = {
      market: 'pt',
      currency: 'EUR',
      lastReviewedAt: '2026-06',
      offers: [
        {
          condition: 'used',
          marketScope: 'used_pt',
          status: 'available',
          priceFrom: 26000,
          yearFrom: 2024,
          displayPriority: 2,
        },
        {
          condition: 'new',
          marketScope: 'official_pt',
          status: 'available',
          price: { min: 38900, max: 42000 },
          modelYear: 2026,
          displayPriority: 1,
        },
      ],
    }

    const summaries = getVehiclePriceSummaries(pricing)

    expect(summaries.map((summary) => summary.kind)).toEqual(['new', 'used'])
    expect(summaries[0]).toMatchObject({
      market: 'PT',
      currency: 'EUR',
      priceFrom: 38900,
      priceTo: 42000,
      modelYear: 2026,
      updatedAt: '2026-06',
      isLegacy: false,
    })
    expect(getPrimaryVehiclePriceSummary(pricing)?.kind).toBe('new')
  })

  it('uses a used offer when a new price is only a historical reference', () => {
    const pricing: VehiclePricing = {
      offers: [
        {
          condition: 'new',
          marketScope: 'official_pt',
          status: 'not_sold_new',
          priceFrom: 42000,
          displayPriority: 2,
        },
        {
          condition: 'used',
          marketScope: 'used_pt',
          status: 'available',
          priceFrom: 23500,
          displayPriority: 1,
        },
      ],
    }

    expect(getPrimaryVehiclePriceSummary(pricing)).toMatchObject({
      kind: 'used',
      priceFrom: 23500,
    })
  })

  it('supports legacy prices and falls back when no image exists', () => {
    const vehicle: VehicleData = {
      id: 'legacy-ev',
      brand: 'Legacy',
      model: 'EV',
      pricing: {
        pt: {
          currency: 'EUR',
          consumerPrice: { min: 31000, max: 35000 },
          usedPrice: { min: 19000, max: 24000 },
          updatedAt: '2025-12',
        },
      },
    }

    const normalized = normalizeVehicleForComparison(vehicle)

    expect(normalized.image).toBe(VEHICLE_PLACEHOLDER_IMAGE)
    expect(normalized.pricing?.priceSummaries).toEqual([
      expect.objectContaining({ kind: 'new', priceFrom: 31000, isLegacy: true }),
      expect.objectContaining({ kind: 'used', priceFrom: 19000, isLegacy: true }),
    ])
  })
})
