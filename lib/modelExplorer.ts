import type { ModelExplorerItem, ModelExplorerVariant } from '@/types/model'

export type ExplorerMode = 'models' | 'variants'
export type IntentFilter =
  | 'budget'
  | 'family'
  | 'city'
  | 'longTrips'
  | 'suv'
  | 'fastCharging'
  | 'firstEv'
  | 'range'
export type SortKey =
  | 'recommended'
  | 'priceAsc'
  | 'rangeDesc'
  | 'chargingDesc'
  | 'efficiencyAsc'
  | 'newest'
  | 'completeDesc'
  | 'az'

export type FlattenedModelVariant = ModelExplorerVariant & {
  modelSlug: string
  modelDisplayName: string
}

export const intentFilters: IntentFilter[] = [
  'budget',
  'family',
  'city',
  'longTrips',
  'suv',
  'fastCharging',
  'firstEv',
  'range',
]

export const sortKeys: SortKey[] = [
  'recommended',
  'priceAsc',
  'rangeDesc',
  'chargingDesc',
  'efficiencyAsc',
  'newest',
  'completeDesc',
  'az',
]

export function modelMatchesIntent(model: ModelExplorerItem, intent: IntentFilter) {
  const body = model.bodyTypes.join(' ').toLowerCase()
  const segment = model.segment.toLowerCase()
  const price = model.priceFromEur ?? Number.MAX_SAFE_INTEGER
  const range = model.maxRealRangeKm ?? model.maxWltpRangeKm ?? 0
  const dc = model.maxDcChargeKw ?? 0
  const seats = model.maxSeats ?? 0
  const trunk = model.maxTrunkLiters ?? 0
  const consumption = model.bestConsumptionWhKm ?? 999

  if (intent === 'budget') return price <= 35000
  if (intent === 'family') return seats >= 5 && (trunk >= 430 || body.includes('suv'))
  if (intent === 'city') {
    return segment.startsWith('a-') || segment.startsWith('b-') || body.includes('hatch')
  }
  if (intent === 'longTrips') return range >= 420 && dc >= 130
  if (intent === 'suv') return body.includes('suv')
  if (intent === 'fastCharging') return dc >= 170
  if (intent === 'firstEv') return price <= 40000 && consumption <= 185
  if (intent === 'range') return range >= 500
  return true
}

export function sortModels(models: ModelExplorerItem[], sortKey: SortKey) {
  return [...models].sort((a, b) => {
    if (sortKey === 'priceAsc') {
      return (a.priceFromEur ?? Number.MAX_SAFE_INTEGER) - (b.priceFromEur ?? Number.MAX_SAFE_INTEGER)
    }
    if (sortKey === 'rangeDesc') {
      return (b.maxRealRangeKm ?? b.maxWltpRangeKm ?? 0) - (a.maxRealRangeKm ?? a.maxWltpRangeKm ?? 0)
    }
    if (sortKey === 'chargingDesc') return (b.maxDcChargeKw ?? 0) - (a.maxDcChargeKw ?? 0)
    if (sortKey === 'efficiencyAsc') {
      return (a.bestConsumptionWhKm ?? Number.MAX_SAFE_INTEGER) - (b.bestConsumptionWhKm ?? Number.MAX_SAFE_INTEGER)
    }
    if (sortKey === 'newest') return (b.newestModelYear ?? 0) - (a.newestModelYear ?? 0)
    if (sortKey === 'completeDesc') return b.dataCompleteness - a.dataCompleteness
    if (sortKey === 'az') return a.displayName.localeCompare(b.displayName, 'pt-PT')

    const score = (model: ModelExplorerItem) =>
      model.dataCompleteness +
      (model.priceFromEur ? 15 : 0) +
      ((model.maxRealRangeKm ?? model.maxWltpRangeKm ?? 0) >= 400 ? 12 : 0) +
      ((model.maxDcChargeKw ?? 0) >= 120 ? 8 : 0)

    return score(b) - score(a)
  })
}

export function flattenVariants(models: ModelExplorerItem[]): FlattenedModelVariant[] {
  return models.flatMap((model) =>
    model.variants.map((variant) => ({
      ...variant,
      modelSlug: model.slug,
      modelDisplayName: model.displayName,
    }))
  )
}

export function sortVariants(variants: FlattenedModelVariant[], sortKey: SortKey) {
  return [...variants].sort((a, b) => {
    if (sortKey === 'priceAsc') {
      return (a.priceFromEur ?? Number.MAX_SAFE_INTEGER) - (b.priceFromEur ?? Number.MAX_SAFE_INTEGER)
    }
    if (sortKey === 'rangeDesc') {
      return (b.realRangeKm ?? b.wltpRangeKm ?? 0) - (a.realRangeKm ?? a.wltpRangeKm ?? 0)
    }
    if (sortKey === 'chargingDesc') return (b.dcChargeKw ?? 0) - (a.dcChargeKw ?? 0)
    if (sortKey === 'efficiencyAsc') {
      return (a.consumptionWhKm ?? Number.MAX_SAFE_INTEGER) - (b.consumptionWhKm ?? Number.MAX_SAFE_INTEGER)
    }
    if (sortKey === 'newest') return (b.modelYear ?? 0) - (a.modelYear ?? 0)
    if (sortKey === 'completeDesc') return b.dataCompleteness - a.dataCompleteness
    return a.displayName.localeCompare(b.displayName, 'pt-PT')
  })
}

export function modelIncludesQuery(model: ModelExplorerItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  return [
    model.brand,
    model.model,
    model.displayName,
    model.segment,
    model.bodyTypes.join(' '),
    model.variants.map((variant) => variant.displayName).join(' '),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}
