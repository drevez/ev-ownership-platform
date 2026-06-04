import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'

export interface ModelVariantSummary {
  id: string
  variant: string
  displayName: string
  drivetrain: string
  segment: string
  bodyType: string
  image: string
  wltpRangeKm?: number
  dcChargeKw?: number
  priceFromEur?: number
  primaryPrice?: VehiclePriceSummary
  priceSummaries: VehiclePriceSummary[]
}

export interface ModelPageData {
  slug: string
  brand: string
  model: string
  displayName: string
  segment: string
  bodyType: string
  heroImage: string
  variants: ModelVariantSummary[]
}

export interface ModelExplorerVariant {
  id: string
  displayName: string
  variant: string
  brand: string
  model: string
  segment: string
  bodyType: string
  drivetrain: string
  image: string
  priceFromEur?: number
  primaryPrice?: VehiclePriceSummary
  priceSummaries: VehiclePriceSummary[]
  realRangeKm?: number
  wltpRangeKm?: number
  motorwayRangeKm?: number
  dcChargeKw?: number
  usableBatteryKwh?: number
  consumptionWhKm?: number
  seats?: number
  trunkLiters?: number
  modelYear?: number
  missingFields: string[]
  dataCompleteness: number
}

export interface ModelExplorerItem {
  slug: string
  brand: string
  model: string
  displayName: string
  heroImage: string
  segment: string
  bodyTypes: string[]
  drivetrains: string[]
  variantCount: number
  priceFromEur?: number
  primaryPrice?: VehiclePriceSummary
  priceSummaries: VehiclePriceSummary[]
  maxRealRangeKm?: number
  maxWltpRangeKm?: number
  maxMotorwayRangeKm?: number
  maxDcChargeKw?: number
  maxUsableBatteryKwh?: number
  bestConsumptionWhKm?: number
  maxSeats?: number
  maxTrunkLiters?: number
  newestModelYear?: number
  missingFields: string[]
  dataCompleteness: number
  variants: ModelExplorerVariant[]
}
