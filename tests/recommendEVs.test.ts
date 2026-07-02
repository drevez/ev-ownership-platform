import { describe, expect, it } from 'vitest'

import type { VehicleData } from '@/lib/loadVehicle'
import { scoreRecommendationCandidates } from '@/lib/recommendation/recommendEVs'
import type { QuizAnswers } from '@/types/recommendation'

const balancedAnswers: QuizAnswers = {
  budget: 40000,
  purchaseType: 'new',
  chargingAccess: 'home',
  familySize: 4,
  dailyCommuteKm: 40,
  roadTrips: 'sometimes',
  cargoNeed: 'medium',
  bodyPreference: 'any',
  ownershipStyle: 'balanced',
  priorities: ['budget', 'range', 'charging'],
}

function vehicle(
  id: string,
  overrides: Partial<VehicleData> = {}
): VehicleData {
  return {
    id,
    brand: 'Test',
    model: id,
    variant: 'Standard',
    bodyType: 'SUV',
    segment: 'C-SUV',
    seats: 5,
    pricing: {
      offers: [{
        condition: 'new',
        status: 'available',
        marketScope: 'official_pt',
        priceFrom: 38000,
      }],
    },
    battery: { batteryUsableKWh: 65 },
    charging: { dcMaxChargeKW: 150, charge10to80Min: 30 },
    efficiency: {
      wltpRangeKm: 450,
      estimatedRealRangeKm: 390,
      motorwayRangeKm: 330,
      realWorldConsumptionWhKm: 170,
    },
    dimensions: { cargoLitersSeatsUp: 450 },
    comfort: {
      heatPumpAvailable: true,
      softwareExperienceLevel: 8,
      maintenanceLevel: 2,
    },
    ...overrides,
  }
}

describe('recommendation scoring', () => {
  it('ranks a balanced in-budget vehicle above an expensive weak match', () => {
    const goodMatch = vehicle('good-match')
    const weakMatch = vehicle('weak-match', {
      pricing: {
        offers: [{
          condition: 'new',
          status: 'available',
          marketScope: 'official_pt',
          priceFrom: 72000,
        }],
      },
      charging: { dcMaxChargeKW: 70, charge10to80Min: 48 },
      efficiency: {
        wltpRangeKm: 300,
        estimatedRealRangeKm: 240,
        motorwayRangeKm: 190,
        realWorldConsumptionWhKm: 225,
      },
      dimensions: { cargoLitersSeatsUp: 280 },
    })

    const results = scoreRecommendationCandidates(
      [weakMatch, goodMatch],
      balancedAnswers
    )

    expect(results[0].vehicle.id).toBe('good-match')
    expect(results[0].matchPercentage).toBeGreaterThan(results[1].matchPercentage)
    expect(results[0].priceDeltaEur).toBe(-2000)
    expect(results[0].breakdown).toHaveLength(7)
  })

  it('uses used prices when the user chooses a used vehicle', () => {
    const usedValue = vehicle('used-value', {
      pricing: {
        offers: [
          {
            condition: 'new',
            status: 'available',
            marketScope: 'official_pt',
            priceFrom: 52000,
          },
          {
            condition: 'used',
            status: 'available',
            marketScope: 'used_pt',
            priceFrom: 29000,
          },
        ],
      },
    })

    const [result] = scoreRecommendationCandidates(
      [usedValue],
      { ...balancedAnswers, purchaseType: 'used', budget: 30000 }
    )

    expect(result.keySpecs.priceFromEur).toBe(29000)
    expect(result.keySpecs.priceKind).toBe('used')
    expect(result.priceDeltaEur).toBe(-1000)
    expect(result.breakdown.find((part) => part.category === 'budget')?.score)
      .toBeGreaterThan(20)
  })

  it('does not substitute a new price when the user explicitly wants used', () => {
    const newOnly = vehicle('new-only')

    const [result] = scoreRecommendationCandidates(
      [newOnly],
      { ...balancedAnswers, purchaseType: 'used', budget: 30000 }
    )

    expect(result.keySpecs.priceFromEur).toBeUndefined()
    expect(result.priceDeltaEur).toBeUndefined()
    expect(result.breakdown.find((part) => part.category === 'budget')?.score)
      .toBeLessThan(3)
    expect(result.drawbacks.some((reason) => reason.includes('preço usado')))
      .toBe(true)
  })

  it('shows the selected new price even when a cheaper used offer exists', () => {
    const mixedPricing = vehicle('mixed-pricing', {
      pricing: {
        offers: [
          {
            condition: 'new',
            status: 'available',
            marketScope: 'official_pt',
            priceFrom: 52000,
          },
          {
            condition: 'used',
            status: 'available',
            marketScope: 'used_pt',
            priceFrom: 28000,
          },
        ],
      },
    })

    const [result] = scoreRecommendationCandidates(
      [mixedPricing],
      { ...balancedAnswers, purchaseType: 'new', budget: 55000 }
    )

    expect(result.keySpecs.priceFromEur).toBe(52000)
    expect(result.keySpecs.priceKind).toBe('new')
    expect(result.priceDeltaEur).toBe(-3000)
  })

  it('respects body preference and result limits', () => {
    const suv = vehicle('suv')
    const sedan = vehicle('sedan', { bodyType: 'Sedan', segment: 'D-Sedan' })
    const hatchback = vehicle('hatch', { bodyType: 'Hatchback', segment: 'B-Hatchback' })

    const results = scoreRecommendationCandidates(
      [sedan, hatchback, suv],
      { ...balancedAnswers, bodyPreference: 'suv' },
      2
    )

    expect(results).toHaveLength(2)
    expect(results[0].vehicle.id).toBe('suv')
  })

  it('returns deterministic percentages and confidence with incomplete data', () => {
    const incomplete = vehicle('incomplete', {
      pricing: undefined,
      charging: undefined,
      efficiency: undefined,
      dimensions: undefined,
      comfort: undefined,
    })

    const [first] = scoreRecommendationCandidates([incomplete], balancedAnswers)
    const [second] = scoreRecommendationCandidates([incomplete], balancedAnswers)

    expect(first.matchPercentage).toBe(second.matchPercentage)
    expect(first.score).toBe(second.score)
    expect(first.confidence).toMatch(/high|medium|low/)
    expect(Number.isFinite(first.matchPercentage)).toBe(true)
  })

  it('bases confidence on data coverage rather than match quality', () => {
    const expensiveButComplete = vehicle('expensive-complete', {
      pricing: {
        offers: [{
          condition: 'new',
          status: 'available',
          marketScope: 'official_pt',
          priceFrom: 120000,
        }],
      },
    })

    const [result] = scoreRecommendationCandidates(
      [expensiveButComplete],
      balancedAnswers
    )

    expect(result.matchPercentage).toBeLessThan(90)
    expect(result.dataCompleteness).toBe(100)
    expect(result.confidence).toBe('high')
  })
})
