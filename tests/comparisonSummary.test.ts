import { describe, expect, it } from 'vitest'

import { generateComparisonSummary } from '@/lib/comparison'
import type { ComparisonVehicle } from '@/types/comparison'

function vehicle(id: string, price: number, range: number): ComparisonVehicle {
  return {
    id,
    displayName: id,
    brand: 'Test',
    model: id,
    variant: '',
    image: '',
    segment: '',
    bodyType: '',
    drivetrain: '',
    pricing: { basePriceEur: price },
    efficiency: { wltpRangeKm: range },
  }
}

describe('comparison summary', () => {
  it('uses one clear statement when the same vehicle leads price and range', () => {
    const summary = generateComparisonSummary([
      vehicle('Leader', 30000, 500),
      vehicle('Alternative', 40000, 400),
    ])

    expect(summary.recommendation).toContain('Leader combina')
    expect(summary.recommendation.match(/Leader/g)).toHaveLength(1)
  })

  it('reports ties instead of selecting an arbitrary vehicle', () => {
    const summary = generateComparisonSummary([
      vehicle('First', 30000, 450),
      vehicle('Second', 30000, 450),
    ])

    expect(summary.bestValue).toBe('Empate')
    expect(summary.bestRange).toBe('Empate')
  })
})
