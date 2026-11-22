import type { Language } from '@/config/i18n'
import type { ComparisonVehicle } from '@/types/comparison'
import type { VehicleData } from '@/lib/loadVehicle'
import { getPrimaryVehiclePriceSummary, getVehiclePriceSummaries } from '@/lib/normalizeVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'

export type AnalyticsMarket = 'pt'
export type AnalyticsPageType =
  | 'home'
  | 'models'
  | 'model'
  | 'vehicle'
  | 'comparison'
  | 'recommender'
  | 'content'
  | 'contact'

export type AnalyticsValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | AnalyticsValue[]
  | { [key: string]: AnalyticsValue }

export type AnalyticsProperties = Record<string, AnalyticsValue>

export type AnalyticsPageContext = {
  path: string
  canonical_path: string
  type: AnalyticsPageType
  language: Language
  market: AnalyticsMarket
  locale: string
}

export type AnalyticsVehicle = {
  id: string
  model_id: string
  brand: string
  model: string
  variant?: string
  model_year?: number
  position: number
  name?: string
}

type VehicleLike = Pick<
  VehicleData | ComparisonVehicle,
  'id' | 'brand' | 'model' | 'variant' | 'modelYear'
> & {
  displayName?: string
  modelId?: string
}

function slugifyAnalyticsId(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function canonicalModelId(vehicle: VehicleLike) {
  if (vehicle.modelId) return vehicle.modelId
  if (vehicle.id.startsWith('model:')) return vehicle.id.slice('model:'.length)
  const model = normalizedModelName(vehicle.brand, vehicle.model)
  return `${slugifyAnalyticsId(vehicle.brand)}-${slugifyAnalyticsId(model)}`
}

function normalizedModelName(brand: string, model: string) {
  const brandPrefix = `${brand} `
  return model.toLocaleLowerCase().startsWith(brandPrefix.toLocaleLowerCase())
    ? model.slice(brandPrefix.length).trim()
    : model
}

type VehicleQualityLike = Partial<Pick<VehicleData | ComparisonVehicle, 'image' | 'pricing'>>

export type VehicleDataQualityStatus = 'ready' | 'incomplete'
export type VehiclePriceContext = 'new' | 'used' | 'imported_used' | 'unknown'

export function getAnalyticsLocale(
  language: Language,
  market: AnalyticsMarket = 'pt'
) {
  return `${language}-${market.toUpperCase()}`
}

export function buildPageContext({
  path,
  canonicalPath,
  type,
  language,
  market = 'pt',
}: {
  path: string
  canonicalPath: string
  type: AnalyticsPageType
  language: Language
  market?: AnalyticsMarket
}): AnalyticsPageContext {
  return {
    path,
    canonical_path: canonicalPath,
    type,
    language,
    market,
    locale: getAnalyticsLocale(language, market),
  }
}

export function pageContextToFlatProperties(page: AnalyticsPageContext) {
  return {
    page_path: page.path,
    page_type: page.type,
    canonical_path: page.canonical_path,
    language: page.language,
    market: page.market,
    locale: page.locale,
  }
}

export function toAnalyticsVehicle(
  vehicle: VehicleLike,
  position = 1
): AnalyticsVehicle {
  return {
    id: vehicle.id.replace(/^model:/, ''),
    model_id: canonicalModelId(vehicle),
    brand: vehicle.brand,
    model: normalizedModelName(vehicle.brand, vehicle.model),
    variant: vehicle.variant,
    model_year: vehicle.modelYear,
    position,
    name: vehicle.displayName,
  }
}

export function toAnalyticsVehicles(vehicles: VehicleLike[]) {
  return vehicles.map((vehicle, index) => toAnalyticsVehicle(vehicle, index + 1))
}

export function vehicleIdsFromVehicles(vehicles: AnalyticsVehicle[]) {
  return vehicles.map((vehicle) => vehicle.id).join('|')
}

export function vehicleNamesFromVehicles(vehicles: AnalyticsVehicle[]) {
  return vehicles
    .map((vehicle) => vehicle.name)
    .filter((name): name is string => Boolean(name))
    .join('|')
}

function sortedUniqueValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .sort((a, b) => a.localeCompare(b))
    .join('|')
}

export function vehicleSetFromVehicles(vehicles: AnalyticsVehicle[]) {
  return sortedUniqueValues(vehicles.map((vehicle) => vehicle.id))
}

export function brandSetFromVehicles(vehicles: AnalyticsVehicle[]) {
  return sortedUniqueValues(vehicles.map((vehicle) => vehicle.brand))
}

export function vehicleFlatProperties(vehicles: AnalyticsVehicle[]) {
  return {
    ...vehicleAggregateProperties(vehicles),
    vehicle_ids: vehicleIdsFromVehicles(vehicles),
  }
}

export function vehicleAggregateProperties(vehicles: AnalyticsVehicle[]) {
  return {
    ...entityAggregateProperties(vehicles),
    vehicle_set: vehicleSetFromVehicles(vehicles),
  }
}

export function entityAggregateProperties(entities: AnalyticsVehicle[]) {
  return {
    vehicle_count: entities.length,
    brand_set: brandSetFromVehicles(entities),
    vehicle_names: vehicleNamesFromVehicles(entities),
  }
}

export function comparisonIdentifierProperties(
  vehicles: AnalyticsVehicle[],
  comparisonType: 'models' | 'versions'
) {
  const ids = vehicles.map((vehicle) => vehicle.id)

  return comparisonType === 'models'
    ? { model_ids: ids }
    : { vehicle_ids: vehicleIdsFromVehicles(vehicles) }
}

export function comparisonDataProperties(
  entities: AnalyticsVehicle[],
  comparisonType: 'models' | 'versions'
) {
  const comparisonSet = vehicleSetFromVehicles(entities)

  return {
    entities,
    // Backward-compatible alias. New collection features should use entities.
    vehicles: entities,
    comparison_set: comparisonSet,
    // Backward-compatible alias. New analytics mappings should use comparison_set.
    vehicle_set: comparisonSet,
    // Keep the joined scalar consumed by existing GTM/GA4 mappings.
    vehicle_ids: vehicleIdsFromVehicles(entities),
    ...comparisonIdentifierProperties(entities, comparisonType),
  }
}

function hasUsableVehicleImage(vehicle: VehicleQualityLike) {
  return Boolean(vehicle.image && vehicle.image !== VEHICLE_PLACEHOLDER_IMAGE)
}

function primaryPriceContext(vehicle: VehicleQualityLike): VehiclePriceContext {
  const normalizedPricing = vehicle.pricing as ComparisonVehicle['pricing']
  const candidates = normalizedPricing?.primaryPrice
    ? [normalizedPricing.primaryPrice, ...(normalizedPricing.priceSummaries ?? [])]
    : normalizedPricing?.priceSummaries ?? [
      getPrimaryVehiclePriceSummary(vehicle.pricing),
      ...getVehiclePriceSummaries(vehicle.pricing),
    ]
  const primaryPrice = candidates.find((summary) => summary &&
    [summary.priceFrom, summary.priceTo].some((price) =>
      typeof price === 'number' && Number.isFinite(price) && price > 0
    )
  )

  if (!primaryPrice) return 'unknown'
  if (primaryPrice.kind === 'importedUsed') return 'imported_used'
  return primaryPrice.kind === 'new' || primaryPrice.kind === 'used'
    ? primaryPrice.kind
    : 'unknown'
}

export function vehicleQualityProperties(vehicle: VehicleQualityLike) {
  const hasImage = hasUsableVehicleImage(vehicle)
  const priceContext = primaryPriceContext(vehicle)
  const hasPrice = priceContext !== 'unknown'

  return {
    data_quality_status:
      hasImage && hasPrice ? 'ready' : 'incomplete',
    has_image: hasImage,
    has_price: hasPrice,
    price_context: priceContext,
  } satisfies {
    data_quality_status: VehicleDataQualityStatus
    has_image: boolean
    has_price: boolean
    price_context: VehiclePriceContext
  }
}

export function vehicleQualityAggregateProperties(vehicles: VehicleQualityLike[]) {
  const qualities = vehicles.map(vehicleQualityProperties)
  const readyCount = qualities.filter(
    (quality) => quality.data_quality_status === 'ready'
  ).length
  const priceContexts = sortedUniqueValues(
    qualities.map((quality) => quality.price_context)
  )

  return {
    data_quality_status:
      vehicles.length > 0 && readyCount === vehicles.length ? 'ready' : 'incomplete',
    ready_vehicle_count: readyCount,
    incomplete_vehicle_count: vehicles.length - readyCount,
    has_missing_data: readyCount !== vehicles.length,
    price_context_set: priceContexts,
  }
}

export function singleVehicleFlatProperties(vehicle: AnalyticsVehicle) {
  return {
    vehicle_id: vehicle.id,
    model_id: vehicle.model_id,
    // Preserve existing GTM variables while reports adopt model_id.
    model_slug: vehicle.model_id,
    brand: vehicle.brand,
    model: vehicle.model,
    variant: vehicle.variant,
    model_year: vehicle.model_year,
  }
}
