import { describe, expect, it } from 'vitest'

import {
  buildComparisonApiResponse,
  modelSlugsToVersionIds,
  normalizeComparisonSelection,
  versionIdsToModelSlugs,
} from '@/lib/comparisonSelection'

describe('comparison selection', () => {
  it('preserves order while rejecting duplicates, unsafe values, and overflow', () => {
    expect(normalizeComparisonSelection([
      'model-b',
      'model-a',
      'model-b',
      '../unsafe',
      'model-c',
      'model-d',
    ])).toEqual({
      values: ['model-b', 'model-a', 'model-c'],
      rejected: ['model-b', '../unsafe', 'model-d'],
    })
  })

  it('reports missing items and returns vehicles in requested order', () => {
    const response = buildComparisonApiResponse(
      ['car-b', 'missing-car', 'car-a'],
      [{ id: 'car-a' }, { id: 'car-b' }]
    )

    expect(response.vehicles).toEqual([{ id: 'car-b' }, { id: 'car-a' }])
    expect(response.missing).toEqual(['missing-car'])
  })

  it('supports public URL identities that differ from internal vehicle IDs', () => {
    const response = buildComparisonApiResponse(
      ['model-a'],
      [{ id: 'model:model-a' }],
      [],
      (vehicle) => vehicle.id.replace(/^model:/, '')
    )

    expect(response.vehicles).toEqual([{ id: 'model:model-a' }])
    expect(response.missing).toEqual([])
  })

  it('keeps one corresponding version selected when switching from models', () => {
    const models = [
      {
        slug: 'model-a',
        variants: [{ id: 'model-a-standard' }, { id: 'model-a-long-range' }],
      },
      {
        slug: 'model-b',
        variants: [{ id: 'model-b-standard' }],
      },
    ]

    expect(
      modelSlugsToVersionIds(
        ['model-a', 'model-b'],
        models,
        ['model-a-long-range']
      )
    ).toEqual(['model-a-long-range', 'model-b-standard'])
  })

  it('restores the corresponding models when switching from versions', () => {
    const models = [
      {
        slug: 'model-a',
        variants: [{ id: 'model-a-standard' }, { id: 'model-a-long-range' }],
      },
      {
        slug: 'model-b',
        variants: [{ id: 'model-b-standard' }],
      },
    ]

    expect(
      versionIdsToModelSlugs(
        ['model-a-long-range', 'model-b-standard'],
        models
      )
    ).toEqual(['model-a', 'model-b'])
  })
})
