import registry from '@/data/registry/vehicles.json'
import { loadVehicle } from '@/lib/loadVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import {
  getVehicleBatteryCapacityKwh,
  getVehicleChargeTime10To80Min,
  getVehicleDcChargeKw,
  getVehicleDisplayName,
  getVehicleImage,
  getVehiclePriceFromEur,
  getVehiclePriceSummaries,
  getVehicleTrunkCapacityL,
} from '@/lib/normalizeVehicle'
import type {
  ComparisonVehicle,
  VehicleDataForComparison,
} from '@/types/comparison'
import type {
  ModelExplorerItem,
  ModelExplorerVariant,
  ModelPageData,
  ModelVariantSummary,
} from '@/types/model'
import type { VehicleData } from '@/lib/loadVehicle'

interface EfficiencyData {
  wltpRangeKm?: number
  estimatedRealRangeKm?: number
  motorwayRangeKm?: number
  realWorldConsumptionWhKm?: number
}

function minNumber(values: Array<number | undefined>): number | undefined {
  const valid = values.filter((value): value is number => value != null)
  return valid.length > 0 ? Math.min(...valid) : undefined
}

function maxNumber(values: Array<number | undefined>): number | undefined {
  const valid = values.filter((value): value is number => value != null)
  return valid.length > 0 ? Math.max(...valid) : undefined
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort()
}

function getMissingFields(vehicle: VehicleData, image: string): string[] {
  const missing: string[] = []
  const efficiency = vehicle.efficiency as EfficiencyData | undefined

  if (getVehiclePriceFromEur(vehicle.pricing) == null) missing.push('price')
  if (
    efficiency?.estimatedRealRangeKm == null &&
    efficiency?.wltpRangeKm == null
  ) {
    missing.push('range')
  }
  if (getVehicleDcChargeKw(vehicle.charging) == null) missing.push('charging')
  if (getVehicleBatteryCapacityKwh(vehicle.battery) == null) missing.push('battery')
  if (!vehicle.image || image === VEHICLE_PLACEHOLDER_IMAGE) missing.push('image')

  return missing
}

function dataCompleteness(missingFields: string[]) {
  const total = 5
  return Math.max(0, Math.round(((total - missingFields.length) / total) * 100))
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function toModelSlug(brand: string, model: string): string {
  return `${slugify(brand)}-${slugify(model)}`
}

export interface ModelListItem {
  slug: string
  brand: string
  model: string
  displayName: string
  variantCount: number
  heroImage?: string
  segment: string
  bodyType: string
}

export function getAllModelSummaries(): ModelListItem[] {
  const bySlug = new Map<string, ModelListItem>()

  for (const entry of registry) {
    const slug = toModelSlug(entry.brand, entry.model)
    const existing = bySlug.get(slug)

    if (existing) {
      existing.variantCount += 1
    } else {
      bySlug.set(slug, {
        slug,
        brand: entry.brand,
        model: entry.model,
        displayName: `${entry.brand} ${entry.model}`,
        variantCount: 1,
        heroImage: entry.heroImage || VEHICLE_PLACEHOLDER_IMAGE,
        segment: entry.segment,
        bodyType: entry.bodyType,
      })
    }
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    a.displayName.localeCompare(b.displayName, 'pt')
  )
}

export function getAllModelSlugs(): { slug: string }[] {
  const slugs = new Set<string>()

  for (const entry of registry) {
    slugs.add(toModelSlug(entry.brand, entry.model))
  }

  return Array.from(slugs)
    .sort()
    .map((slug) => ({ slug }))
}

function mapVariant(vehicle: VehicleData, registryHeroImage?: string): ModelVariantSummary {
  const efficiency = vehicle.efficiency as EfficiencyData | undefined
  const priceSummaries = getVehiclePriceSummaries(vehicle.pricing)
  const primaryPrice = priceSummaries[0]

  return {
    id: String(vehicle.id),
    variant: String(vehicle.variant ?? ''),
    displayName: getVehicleDisplayName(vehicle),
    drivetrain: String(vehicle.drivetrain ?? ''),
    segment: String(vehicle.segment ?? ''),
    bodyType: String(vehicle.bodyType ?? ''),
    image: getVehicleImage({
      image: vehicle.image,
      heroImage: vehicle.heroImage || registryHeroImage,
    }),
    wltpRangeKm: efficiency?.wltpRangeKm,
    dcChargeKw: getVehicleDcChargeKw(vehicle.charging),
    priceFromEur: primaryPrice?.priceFrom ?? getVehiclePriceFromEur(vehicle.pricing),
    primaryPrice,
    priceSummaries,
  }
}

export async function loadModel(slug: string): Promise<ModelPageData | null> {
  const entries = registry.filter(
    (entry) => toModelSlug(entry.brand, entry.model) === slug
  )

  if (entries.length === 0) return null

  const loaded = await Promise.all(
    entries.map(async (entry) => {
      const vehicle = await loadVehicle(entry.id)
      if (!vehicle) return null
      return mapVariant(vehicle, entry.heroImage)
    })
  )

  const variants = loaded
    .filter((v): v is ModelVariantSummary => v !== null)
    .sort((a, b) => {
      const priceA = a.priceFromEur ?? Number.MAX_SAFE_INTEGER
      const priceB = b.priceFromEur ?? Number.MAX_SAFE_INTEGER
      if (priceA !== priceB) return priceA - priceB
      return a.variant.localeCompare(b.variant)
    })

  if (variants.length === 0) return null

  const first = entries[0]
  const heroVariant = variants[0]

  return {
    slug,
    brand: first.brand,
    model: first.model,
    displayName: `${first.brand} ${first.model}`,
    segment: heroVariant.segment,
    bodyType: heroVariant.bodyType,
    heroImage: heroVariant.image,
    variants,
  }
}

function mapExplorerVariant(
  vehicle: VehicleData,
  registryHeroImage?: string
): ModelExplorerVariant {
  const efficiency = vehicle.efficiency as EfficiencyData | undefined
  const image = getVehicleImage({
    image: vehicle.image,
    heroImage: vehicle.heroImage || registryHeroImage,
  })
  const missingFields = getMissingFields(vehicle, image)
  const priceSummaries = getVehiclePriceSummaries(vehicle.pricing)
  const primaryPrice = priceSummaries[0]

  return {
    id: String(vehicle.id),
    displayName: getVehicleDisplayName(vehicle),
    variant: String(vehicle.variant ?? ''),
    brand: String(vehicle.brand),
    model: String(vehicle.model),
    segment: String(vehicle.segment ?? ''),
    bodyType: String(vehicle.bodyType ?? ''),
    drivetrain: String(vehicle.drivetrain ?? ''),
    image,
    priceFromEur: primaryPrice?.priceFrom ?? getVehiclePriceFromEur(vehicle.pricing),
    primaryPrice,
    priceSummaries,
    realRangeKm: efficiency?.estimatedRealRangeKm,
    wltpRangeKm: efficiency?.wltpRangeKm,
    motorwayRangeKm: efficiency?.motorwayRangeKm,
    dcChargeKw: getVehicleDcChargeKw(vehicle.charging),
    chargeTime10To80Min: getVehicleChargeTime10To80Min(vehicle.charging),
    usableBatteryKwh: getVehicleBatteryCapacityKwh(vehicle.battery),
    consumptionWhKm: efficiency?.realWorldConsumptionWhKm,
    seats: vehicle.seats,
    trunkLiters: getVehicleTrunkCapacityL(vehicle.dimensions),
    modelYear: vehicle.modelYear,
    missingFields,
    dataCompleteness: dataCompleteness(missingFields),
  }
}

export async function getModelExplorerData(): Promise<ModelExplorerItem[]> {
  const bySlug = new Map<
    string,
    {
      slug: string
      brand: string
      model: string
      registryHeroImage?: string
      variants: ModelExplorerVariant[]
    }
  >()

  await Promise.all(
    registry.map(async (entry) => {
      const vehicle = await loadVehicle(entry.id)
      if (!vehicle) return

      const slug = toModelSlug(entry.brand, entry.model)
      const existing = bySlug.get(slug)
      const variant = mapExplorerVariant(vehicle, entry.heroImage)

      if (existing) {
        existing.variants.push(variant)
      } else {
        bySlug.set(slug, {
          slug,
          brand: entry.brand,
          model: entry.model,
          registryHeroImage: entry.heroImage,
          variants: [variant],
        })
      }
    })
  )

  return Array.from(bySlug.values())
    .map((group): ModelExplorerItem => {
      const variants = group.variants.sort((a, b) => {
        const priceA = a.priceFromEur ?? Number.MAX_SAFE_INTEGER
        const priceB = b.priceFromEur ?? Number.MAX_SAFE_INTEGER
        if (priceA !== priceB) return priceA - priceB
        return a.displayName.localeCompare(b.displayName)
      })
      const missingFields = unique(variants.flatMap((variant) => variant.missingFields))
      const completeness =
        variants.length > 0
          ? Math.round(
              variants.reduce((sum, variant) => sum + variant.dataCompleteness, 0) /
                variants.length
            )
          : 0

      return {
        slug: group.slug,
        brand: group.brand,
        model: group.model,
        displayName: `${group.brand} ${group.model}`,
        heroImage: variants[0]?.image || group.registryHeroImage || VEHICLE_PLACEHOLDER_IMAGE,
        segment: variants[0]?.segment ?? '',
        bodyTypes: unique(variants.map((variant) => variant.bodyType)),
        drivetrains: unique(variants.map((variant) => variant.drivetrain)),
        variantCount: variants.length,
        priceFromEur: minNumber(variants.map((variant) => variant.priceFromEur)),
        primaryPrice: variants
          .flatMap((variant) => variant.priceSummaries)
          .sort((a, b) => {
            const kindRank = { new: 0, used: 1, importedUsed: 2 }
            const kindDiff = kindRank[a.kind] - kindRank[b.kind]
            if (kindDiff !== 0) return kindDiff
            return (a.priceFrom ?? Number.MAX_SAFE_INTEGER) -
              (b.priceFrom ?? Number.MAX_SAFE_INTEGER)
          })[0],
        priceSummaries: variants.flatMap((variant) => variant.priceSummaries),
        maxRealRangeKm: maxNumber(variants.map((variant) => variant.realRangeKm)),
        maxWltpRangeKm: maxNumber(variants.map((variant) => variant.wltpRangeKm)),
        maxMotorwayRangeKm: maxNumber(variants.map((variant) => variant.motorwayRangeKm)),
        maxDcChargeKw: maxNumber(variants.map((variant) => variant.dcChargeKw)),
        minChargeTime10To80Min: minNumber(variants.map((variant) => variant.chargeTime10To80Min)),
        maxUsableBatteryKwh: maxNumber(variants.map((variant) => variant.usableBatteryKwh)),
        bestConsumptionWhKm: minNumber(variants.map((variant) => variant.consumptionWhKm)),
        maxSeats: maxNumber(variants.map((variant) => variant.seats)),
        maxTrunkLiters: maxNumber(variants.map((variant) => variant.trunkLiters)),
        newestModelYear: maxNumber(variants.map((variant) => variant.modelYear)),
        missingFields,
        dataCompleteness: completeness,
        variants,
      }
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt'))
}

export async function getModelSlugForVehicleId(
  vehicleId: string
): Promise<string | null> {
  const entry = registry.find((v) => v.id === vehicleId)
  if (!entry) return null
  return toModelSlug(entry.brand, entry.model)
}

function modelPriceSummaryForKind(
  model: ModelExplorerItem,
  kind: 'new' | 'used' | 'importedUsed'
) {
  return model.priceSummaries
    .filter((summary) => summary.kind === kind && summary.priceFrom != null)
    .sort((a, b) => (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER))[0]
}

export function mapModelExplorerItemToComparisonVehicle(
  model: ModelExplorerItem
): ComparisonVehicle {
  const priceSummaries = [
    modelPriceSummaryForKind(model, 'new'),
    modelPriceSummaryForKind(model, 'used'),
    modelPriceSummaryForKind(model, 'importedUsed'),
  ].filter((summary): summary is NonNullable<typeof summary> => summary != null)
  const primaryPrice = priceSummaries
    .filter((summary) => summary.priceFrom != null)
    .sort((a, b) => (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER))[0] ??
    priceSummaries[0] ??
    model.primaryPrice
  const basePriceEur = priceSummaries
    .map((summary) => summary.priceFrom)
    .filter((price): price is number => price != null)
    .sort((a, b) => a - b)[0]

  return {
    id: `model:${model.slug}`,
    brand: model.brand,
    model: model.model,
    variant: '',
    displayName: model.displayName,
    image: model.heroImage || VEHICLE_PLACEHOLDER_IMAGE,
    segment: model.segment,
    bodyType: model.bodyTypes[0] ?? '',
    drivetrain: model.drivetrains.join(' / '),
    seats: model.maxSeats,
    modelYear: model.newestModelYear,
    detailPath: `/models/${model.slug}`,
    variantCount: model.variantCount,
    battery: {
      capacityKwh: model.maxUsableBatteryKwh,
      usableKwh: model.maxUsableBatteryKwh,
    },
    charging: {
      dcChargeSpeedKw: model.maxDcChargeKw,
      maxPowerKw: model.maxDcChargeKw,
      chargeTime10To80Min: model.minChargeTime10To80Min,
    },
    efficiency: {
      wltpRangeKm: model.maxWltpRangeKm,
      realWorldRangeKm: model.maxRealRangeKm,
      realWorldConsumption: model.bestConsumptionWhKm,
    },
    dimensions: {
      trunkCapacityL: model.maxTrunkLiters,
    },
    pricing: {
      basePriceEur,
      recommendedPriceEur: basePriceEur,
      highestPriceEur: basePriceEur,
      primaryPrice: primaryPrice
        ? {
            kind: primaryPrice.kind,
            status: primaryPrice.status,
            marketScope: primaryPrice.marketScope,
            priceFrom: primaryPrice.priceFrom,
            priceTo: primaryPrice.priceTo,
            modelYear: primaryPrice.modelYear,
            yearFrom: primaryPrice.yearFrom,
            yearTo: primaryPrice.yearTo,
            isLegacy: primaryPrice.isLegacy,
          }
        : undefined,
      priceSummaries: priceSummaries.map((summary) => ({
        kind: summary.kind,
        status: summary.status,
        marketScope: summary.marketScope,
        priceFrom: summary.priceFrom,
        priceTo: summary.priceTo,
        modelYear: summary.modelYear,
        yearFrom: summary.yearFrom,
        yearTo: summary.yearTo,
        isLegacy: summary.isLegacy,
      })),
    } satisfies VehicleDataForComparison['pricing'],
  }
}
