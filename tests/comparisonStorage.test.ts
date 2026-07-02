import { describe, expect, it } from 'vitest'

import {
  normalizeComparisonIds,
  parseStoredComparison,
} from '@/lib/comparisonStorage'

describe('comparison storage', () => {
  it('keeps unique safe IDs and limits comparison size', () => {
    expect(normalizeComparisonIds([
      'car-a',
      'car-a',
      '../unsafe',
      'car-b',
      'car-c',
      'car-d',
    ])).toEqual(['car-a', 'car-b', 'car-c'])
  })

  it('migrates old stored objects without retaining vehicle payloads', () => {
    const stored = JSON.stringify({
      vehicleIds: ['car-a', 'car-b'],
      vehicles: [{ id: 'stale-payload', pricing: { basePriceEur: 1 } }],
    })

    expect(parseStoredComparison(stored)).toEqual({
      vehicleIds: ['car-a', 'car-b'],
    })
  })

  it('supports the oldest array format and malformed storage', () => {
    expect(parseStoredComparison(JSON.stringify(['car-a']))).toEqual({
      vehicleIds: ['car-a'],
    })
    expect(parseStoredComparison('{broken')).toEqual({ vehicleIds: [] })
  })
})
