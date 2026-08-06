import type { Language } from '@/config/i18n'
import type { ComparisonVehicle } from '@/types/comparison'
import type { VehicleData } from '@/lib/loadVehicle'

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
}

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
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
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
    vehicle_count: vehicles.length,
    vehicle_ids: vehicleIdsFromVehicles(vehicles),
    vehicle_set: vehicleSetFromVehicles(vehicles),
    brand_set: brandSetFromVehicles(vehicles),
    vehicle_names: vehicleNamesFromVehicles(vehicles),
  }
}

export function singleVehicleFlatProperties(vehicle: AnalyticsVehicle) {
  return {
    vehicle_id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    variant: vehicle.variant,
    model_year: vehicle.model_year,
  }
}
