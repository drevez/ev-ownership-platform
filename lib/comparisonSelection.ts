export const MIN_COMPARISON_ITEMS = 2
export const MAX_COMPARISON_ITEMS = 3

const SAFE_COMPARISON_ID = /^[a-z0-9][a-z0-9-]*$/

export interface ComparisonSelection {
  values: string[]
  rejected: string[]
}

export interface ComparisonApiResponse<T> {
  vehicles: T[]
  requested: string[]
  missing: string[]
  rejected: string[]
}

interface ComparisonModelChoice {
  slug: string
  variants: Array<{ id: string }>
}

export function modelSlugsToVersionIds(
  modelSlugs: string[],
  models: ComparisonModelChoice[],
  preferredVersionIds: string[] = []
): string[] {
  const selectedIds: string[] = []

  for (const slug of modelSlugs) {
    const model = models.find((candidate) => candidate.slug === slug)
    if (!model) continue

    const preferredId = preferredVersionIds.find((id) =>
      model.variants.some((variant) => variant.id === id)
    )
    const versionId = preferredId ?? model.variants[0]?.id

    if (versionId && !selectedIds.includes(versionId)) {
      selectedIds.push(versionId)
    }
  }

  return normalizeComparisonSelection(selectedIds).values
}

export function versionIdsToModelSlugs(
  versionIds: string[],
  models: ComparisonModelChoice[]
): string[] {
  const modelSlugs = versionIds
    .map((id) =>
      models.find((model) =>
        model.variants.some((variant) => variant.id === id)
      )?.slug
    )
    .filter((slug): slug is string => Boolean(slug))

  return normalizeComparisonSelection(modelSlugs).values
}

export function normalizeComparisonSelection(
  input: unknown,
  maximum = MAX_COMPARISON_ITEMS
): ComparisonSelection {
  if (!Array.isArray(input)) return { values: [], rejected: [] }

  const values: string[] = []
  const rejected: string[] = []

  for (const candidate of input) {
    if (
      typeof candidate !== 'string' ||
      !SAFE_COMPARISON_ID.test(candidate) ||
      values.includes(candidate)
    ) {
      if (typeof candidate === 'string' && !rejected.includes(candidate)) {
        rejected.push(candidate)
      }
      continue
    }

    if (values.length >= maximum) {
      rejected.push(candidate)
      continue
    }

    values.push(candidate)
  }

  return { values, rejected }
}

export function buildComparisonApiResponse<T extends { id: string }>(
  requested: string[],
  vehicles: T[],
  rejected: string[] = [],
  getPublicId: (vehicle: T) => string = (vehicle) => vehicle.id
): ComparisonApiResponse<T> {
  const byId = new Map(vehicles.map((vehicle) => [getPublicId(vehicle), vehicle]))

  return {
    vehicles: requested
      .map((id) => byId.get(id))
      .filter((vehicle): vehicle is T => vehicle != null),
    requested,
    missing: requested.filter((id) => !byId.has(id)),
    rejected,
  }
}
