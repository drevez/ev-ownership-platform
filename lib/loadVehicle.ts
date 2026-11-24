import { usesSupabase, readCatalogRecord, readCatalogRegistry, readCatalog } from '@/lib/catalog/repository'
import type { VehicleFiles } from '@/lib/internalVehicleFiles'
import fs from 'fs/promises'
import path from 'path'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { getTechnicalGroup, groupTechnicalVariants, VEHICLE_ID_ALIASES } from '@/lib/technicalVariants'

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
  acSinglePhaseKW?: number
  acThreePhaseKW?: number
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
  motorPowerKW?: number

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
  equipmentTrims?: {
    id: string
    label: string
    wltpRangeKm?: number
    pricing?: VehiclePricing
    comfort?: VehicleComfort
  }[]
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
  const canonicalId = VEHICLE_ID_ALIASES[vehicleId]
  if (canonicalId) {
    // Historical links resolve to the surviving record; fallback covers rollout order.
    const canonical = await loadRawVehicle(canonicalId)
    if (canonical) return canonical
  }
  const group = getTechnicalGroup(vehicleId)
  if (group) {
    const members = await Promise.all(group.members.map(id => loadRawVehicle(id)))
    const existing = members.filter((vehicle): vehicle is VehicleData => vehicle !== null)
    if (!existing.some(vehicle => vehicle.id === vehicleId)) return null
    const projected = groupTechnicalVariants(existing)
    // Fall back to the actual record when grouping is invalid or incomplete.
    return projected.find(vehicle => vehicle.id === vehicleId)
      ?? projected.find(vehicle => vehicle.id === group.id)
      ?? null
  }
  const vehicle = await loadRawVehicle(vehicleId)
  return vehicle ? groupTechnicalVariants([vehicle])[0] : null
}

async function loadRawVehicle(
  vehicleId: string
): Promise<VehicleData | null> {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(vehicleId)) return null
  if (usesSupabase()) {
    const record = await readCatalogRecord(vehicleId)
    return record ? vehicleFromFiles(record.files) : null
  }
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
  segment: string
  bodyType: string
  drivetrain: string
  heroImage?: string
}

/**
 * Load vehicle registry
 */
async function loadRawVehicleRegistry(): Promise<
  VehicleRegistryItem[]
> {
  if (usesSupabase()) return readCatalogRegistry()
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

export async function loadVehicleRegistry(): Promise<VehicleRegistryItem[]> {
  return (await loadAllVehicles()).map(vehicle => ({
    id: vehicle.id, brand: vehicle.brand, model: vehicle.model,
    variant: vehicle.variant, segment: vehicle.segment ?? '',
    bodyType: vehicle.bodyType ?? '', drivetrain: vehicle.drivetrain ?? '',
    heroImage: vehicle.heroImage || vehicle.image,
  }))
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

/** Convert a database document using the same image fallback as JSON loading. */
export async function vehicleFromFiles(files: VehicleFiles): Promise<VehicleData> {
  return {
    ...files.core,
    id: String(files.core.id), brand: String(files.core.brand), model: String(files.core.model),
    battery: files.battery, charging: files.charging, comfort: files.comfort,
    dimensions: files.dimensions, efficiency: files.efficiency, pricing: files.pricing,
    image: await normalizeVehicleImage(typeof files.core.image === 'string' ? files.core.image : undefined),
  } as VehicleData
}
export async function loadAllVehicles(): Promise<VehicleData[]> {
  if (usesSupabase()) return groupTechnicalVariants(await Promise.all((await readCatalog()).map(record => vehicleFromFiles(record.files))))
  const registry = await loadRawVehicleRegistry()
  const vehicles = await Promise.all(registry.map(entry => loadRawVehicle(entry.id)))
  return groupTechnicalVariants(vehicles.filter((vehicle): vehicle is VehicleData => vehicle !== null))
}
