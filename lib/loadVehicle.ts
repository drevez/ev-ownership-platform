import fs from 'fs/promises'
import path from 'path'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'

/**
 * Shared JSON object type
 */
export type JsonObject = Record<string, unknown>

/**
 * Vehicle modules
 */
export interface VehicleBattery {
  batteryGrossKWh?: number
  batteryUsableKWh?: number
  batteryChemistry?: string
  voltageArchitecture?: number
}

export interface VehicleCharging {
  dcMaxChargeKW?: number
  acMaxChargeKW?: number
  charge10to80Min?: number
  chargePer10MinKm?: number
  plugAndChargeSupport?: boolean
  teslaSuperchargerAccess?: boolean
  chargingCurveId?: string
}

export interface VehicleEfficiency {
  wltpRangeKm?: number
  estimatedRealRangeKm?: number
  motorwayRangeKm?: number
  realWorldConsumptionWhKm?: number
  realMotorwayConsumptionWhKm?: number
  wltpConsumptionKwh100km?: number
  realWorldRangeKm?: number
  realWorldConsumption?: number
  [key: string]: unknown
}

export interface VehicleDimensions {
  cargoLitersSeatsUp?: number | null
  cargoLitersSeatsDown?: number | null
  frunkLiters?: number | null
  rearLegroomMM?: number | null
  wheelbaseMM?: number | null
  lengthMM?: number | null
  widthMM?: number | null
  heightMM?: number | null
  lengthMm?: number
  widthMm?: number
  heightMm?: number
  wheelbaseMm?: number
  trunkCapacityL?: number
  [key: string]: unknown
}

export interface VehiclePricing {
  market?: string
  currency?: string
  lastReviewedAt?: string
  offers?: VehiclePricingTargetOffer[]
  pt?: {
    currency?: string
    market?: string
    updatedAt?: string
    confidence?: 'high' | 'medium' | 'low' | 'unknown'
    sourcesStatus?: 'verified' | 'estimated' | 'partial' | 'stale' | 'unknown'
    new?: VehiclePricingOffer
    used?: VehiclePricingOffer
    importedUsed?: VehiclePricingOffer & {
      originMarkets?: string[]
      estimatedPortugalCostsIncluded?: boolean
    }
    consumerPrice?: {
      min?: number
      max?: number
    }
    businessPriceExVat?: {
      min?: number
      max?: number
    }
    usedPrice?: {
      min?: number
      max?: number
    }
  }
  basePriceEur?: number
  recommendedPriceEur?: number
  highestPriceEur?: number
  [key: string]: unknown
}

export interface VehiclePricingOffer {
  available?: boolean
  priceFrom?: number
  priceTo?: number
  modelYear?: number
  yearFrom?: number
  yearTo?: number
  includesVat?: boolean
  sourceType?:
    | 'official_brand'
    | 'dealer'
    | 'market_estimate'
    | 'classifieds'
    | 'manual'
    | 'unknown'
  sourceLabel?: string
  sourceUrl?: string | null
  updatedAt?: string
  confidence?: 'high' | 'medium' | 'low' | 'unknown'
  notes?: string
}

export interface VehiclePricingTargetOffer extends VehiclePricingOffer {
  condition?: 'new' | 'used'
  status?:
    | 'available'
    | 'not_sold_new'
    | 'not_enough_data'
    | 'not_sold_in_pt'
    | 'unknown'
  label?: string
  marketScope?:
    | 'official_pt'
    | 'new_import'
    | 'used_pt'
    | 'imported_to_pt'
    | 'unknown'
  price?: {
    min?: number | null
    max?: number | null
  }
  priceDate?: string
  sourceUrl?: string | null
  displayPriority?: number
  originMarkets?: string[]
  estimatedPortugalCostsIncluded?: boolean | null
}

export interface VehicleComfort {
  heatPumpAvailable?: boolean
  vehicleToLoad?: boolean
  vehicleToGrid?: boolean
  panoramicRoof?: boolean
  softwareExperienceLevel?: number
  maintenanceLevel?: number
  insuranceLevel?: number
}

/**
 * Main vehicle type
 */
export interface VehicleData {
  id: string

  brand: string
  model: string

  variant?: string
  modelYear?: number

  segment?: string
  bodyType?: string
  drivetrain?: string
  doors?: number
  seats?: number

  image?: string
  heroImage?: string

  localized?: {
    pt?: {
      displayName?: string
    }
    [locale: string]: {
      displayName?: string
    } | undefined
  }

  core?: JsonObject

  battery?: VehicleBattery
  charging?: VehicleCharging
  efficiency?: VehicleEfficiency
  dimensions?: VehicleDimensions
  pricing?: VehiclePricing
  comfort?: VehicleComfort
}

interface ModuleResult {
  key: string
  data: JsonObject
}

const VEHICLE_MODULES = [
  'core.json',
  'battery.json',
  'charging.json',
  'efficiency.json',
  'dimensions.json',
  'pricing.json',
  'comfort.json',
]

async function localPublicImageExists(src: string): Promise<boolean> {
  if (!src.startsWith('/')) return true

  const cleanSrc = src.split(/[?#]/)[0]
  const filePath = path.join(process.cwd(), 'public', cleanSrc)

  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function normalizeVehicleImage(
  image?: string
): Promise<string> {
  if (!image) return VEHICLE_PLACEHOLDER_IMAGE

  return (await localPublicImageExists(image))
    ? image
    : VEHICLE_PLACEHOLDER_IMAGE
}

/**
 * Load full vehicle data from JSON modules
 */
export async function loadVehicle(
  vehicleId: string
): Promise<VehicleData | null> {
  try {
    const vehiclePath = path.join(
      process.cwd(),
      'public',
      'data',
      'vehicles',
      vehicleId
    )

    const results = await Promise.all(
      VEHICLE_MODULES.map(async (module): Promise<ModuleResult | null> => {
        try {
          const filePath = path.join(vehiclePath, module)

          const content = await fs.readFile(filePath, 'utf-8')

          const data = JSON.parse(content) as JsonObject

          if (Object.keys(data).length === 0) {
            return null
          }

          return {
            key: module.replace('.json', ''),
            data,
          }
        } catch {
          return null
        }
      })
    )

    const vehicle: Partial<VehicleData> = {}

    results.forEach((result) => {
      if (!result) return

      switch (result.key) {
        case 'core':
          Object.assign(vehicle, result.data)
          break

        case 'battery':
          vehicle.battery = result.data as VehicleBattery
          break

        case 'charging':
          vehicle.charging = result.data as VehicleCharging
          break

        case 'efficiency':
          vehicle.efficiency = result.data as VehicleEfficiency
          break

        case 'dimensions':
          vehicle.dimensions = result.data as VehicleDimensions
          break

        case 'pricing':
          vehicle.pricing = result.data as VehiclePricing
          break

        case 'comfort':
          vehicle.comfort = result.data as VehicleComfort
          break
      }
    })

    /**
     * Runtime validation
     */
    if (
      typeof vehicle.id !== 'string' ||
      typeof vehicle.brand !== 'string' ||
      typeof vehicle.model !== 'string'
    ) {
      return null
    }

    vehicle.image = await normalizeVehicleImage(vehicle.image)

    return vehicle as VehicleData
  } catch (error) {
    console.error(`Failed to load vehicle "${vehicleId}"`, error)
    return null
  }
}

/**
 * Registry type
 */
export interface VehicleRegistryItem {
  id: string
  brand: string
  model: string
  variant?: string
}

/**
 * Load vehicle registry
 */
export async function loadVehicleRegistry(): Promise<
  VehicleRegistryItem[]
> {
  try {
    const registryPath = path.join(
      process.cwd(),
      'data',
      'registry',
      'vehicles.json'
    )

    const content = await fs.readFile(registryPath, 'utf-8')

    return JSON.parse(content) as VehicleRegistryItem[]
  } catch (error) {
    console.error('Failed to load vehicle registry', error)
    return []
  }
}

/**
 * Generate static params
 */
export async function getVehicleParams(): Promise<
  { id: string }[]
> {
  const registry = await loadVehicleRegistry()

  return registry.map((vehicle) => ({
    id: vehicle.id,
  }))
}
