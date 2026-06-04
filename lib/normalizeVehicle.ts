import type { ComparisonVehicle } from '@/types/comparison'
import type {
  VehicleBattery,
  VehicleCharging,
  VehicleData,
  VehicleDimensions,
  VehiclePricing,
  VehiclePricingOffer,
  VehiclePricingTargetOffer,
} from '@/lib/loadVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'

type LocalizedVehicle = {
  localized?: {
    [locale: string]: {
      displayName?: string
    } | undefined
  }
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
  }

  return undefined
}

export type VehiclePriceKind = 'new' | 'used' | 'importedUsed'

export interface VehiclePriceSummary {
  kind: VehiclePriceKind
  label?: string
  status?: string
  marketScope?: string
  market: string
  currency: string
  priceFrom?: number
  priceTo?: number
  modelYear?: number
  yearFrom?: number
  yearTo?: number
  updatedAt?: string
  sourceType?: string
  sourceLabel?: string
  sourceUrl?: string
  confidence?: string
  originMarkets?: string[]
  estimatedPortugalCostsIncluded?: boolean
  displayPriority?: number
  isLegacy: boolean
}

function getTargetOfferKind(offer: VehiclePricingTargetOffer): VehiclePriceKind {
  if (offer.marketScope === 'imported_to_pt') return 'importedUsed'
  if (offer.condition === 'used') return 'used'
  return 'new'
}

function mapTargetOffer(
  offer: VehiclePricingTargetOffer,
  market: string,
  currency: string,
  fallbackUpdatedAt?: string
): VehiclePriceSummary | null {
  const priceFrom = firstNumber(offer.priceFrom, offer.price?.min)
  const priceTo = firstNumber(offer.priceTo, offer.price?.max)

  if (priceFrom == null && priceTo == null && offer.status !== 'not_enough_data') {
    return null
  }

  return {
    kind: getTargetOfferKind(offer),
    label: offer.label,
    status: offer.status,
    marketScope: offer.marketScope,
    market,
    currency,
    priceFrom,
    priceTo,
    modelYear: offer.modelYear,
    yearFrom: offer.yearFrom,
    yearTo: offer.yearTo,
    updatedAt: offer.priceDate ?? offer.updatedAt ?? fallbackUpdatedAt,
    sourceType: offer.sourceType,
    sourceLabel: offer.sourceLabel,
    sourceUrl: offer.sourceUrl ?? undefined,
    confidence: offer.confidence,
    originMarkets: offer.originMarkets,
    estimatedPortugalCostsIncluded:
      offer.estimatedPortugalCostsIncluded === null
        ? undefined
        : offer.estimatedPortugalCostsIncluded,
    displayPriority: offer.displayPriority,
    isLegacy: false,
  }
}

function mapOffer(
  kind: VehiclePriceKind,
  offer: (VehiclePricingOffer & {
    originMarkets?: string[]
    estimatedPortugalCostsIncluded?: boolean
  }) | undefined,
  market: string,
  currency: string,
  fallbackUpdatedAt?: string
): VehiclePriceSummary | null {
  if (!offer?.available && offer?.priceFrom == null && offer?.priceTo == null) {
    return null
  }

  return {
    kind,
    label: undefined,
    status: offer.available === false ? 'unknown' : 'available',
    marketScope:
      kind === 'importedUsed'
        ? 'imported_to_pt'
        : kind === 'used'
          ? 'used_pt'
          : 'official_pt',
    market,
    currency,
    priceFrom: offer.priceFrom,
    priceTo: offer.priceTo,
    modelYear: offer.modelYear,
    yearFrom: offer.yearFrom,
    yearTo: offer.yearTo,
    updatedAt: offer.updatedAt ?? fallbackUpdatedAt,
    sourceType: offer.sourceType,
    sourceLabel: offer.sourceLabel,
    sourceUrl: offer.sourceUrl ?? undefined,
    confidence: offer.confidence,
    originMarkets: offer.originMarkets,
    estimatedPortugalCostsIncluded: offer.estimatedPortugalCostsIncluded,
    displayPriority: undefined,
    isLegacy: false,
  }
}

export function getVehiclePriceSummaries(
  pricing?: VehiclePricing,
  market: string = 'pt'
): VehiclePriceSummary[] {
  const targetOffers = Array.isArray(pricing?.offers)
    ? pricing.offers
        .map((offer) =>
          mapTargetOffer(
            offer,
            pricing?.market?.toUpperCase() ?? market.toUpperCase(),
            pricing?.currency ?? 'EUR',
            pricing?.lastReviewedAt
          )
        )
        .filter((summary): summary is VehiclePriceSummary => summary !== null)
        .sort((a, b) => {
          const priorityA = a.displayPriority ?? Number.MAX_SAFE_INTEGER
          const priorityB = b.displayPriority ?? Number.MAX_SAFE_INTEGER
          if (priorityA !== priorityB) return priorityA - priorityB
          return (a.priceFrom ?? Number.MAX_SAFE_INTEGER) -
            (b.priceFrom ?? Number.MAX_SAFE_INTEGER)
        })
    : []

  if (targetOffers.length > 0) return targetOffers

  const marketPricing = pricing?.[market] as VehiclePricing['pt'] | undefined
  const currency = marketPricing?.currency ?? 'EUR'
  const marketCode = marketPricing?.market ?? market.toUpperCase()
  const summaries = [
    mapOffer('new', marketPricing?.new, marketCode, currency, marketPricing?.updatedAt),
    mapOffer('used', marketPricing?.used, marketCode, currency, marketPricing?.updatedAt),
    mapOffer(
      'importedUsed',
      marketPricing?.importedUsed,
      marketCode,
      currency,
      marketPricing?.updatedAt
    ),
  ].filter((summary): summary is VehiclePriceSummary => summary !== null)

  if (summaries.length > 0) return summaries

  const legacyNewPrice = firstNumber(
    marketPricing?.consumerPrice?.min,
    pricing?.basePriceEur,
    pricing?.recommendedPriceEur
  )
  const legacyNewMax = firstNumber(marketPricing?.consumerPrice?.max, pricing?.highestPriceEur)
  const legacyUsedPrice = firstNumber(marketPricing?.usedPrice?.min)
  const legacyUsedMax = firstNumber(marketPricing?.usedPrice?.max)

  const legacySummaries: VehiclePriceSummary[] = []

  if (legacyNewPrice != null) {
    legacySummaries.push({
      kind: 'new',
      label: undefined,
      status: 'available',
      marketScope: 'official_pt',
      market: marketCode,
      currency,
      priceFrom: legacyNewPrice,
      priceTo: legacyNewMax,
      updatedAt: marketPricing?.updatedAt,
      displayPriority: undefined,
      isLegacy: true,
    })
  }

  if (legacyUsedPrice != null) {
    legacySummaries.push({
      kind: 'used',
      label: undefined,
      status: 'available',
      marketScope: 'used_pt',
      market: marketCode,
      currency,
      priceFrom: legacyUsedPrice,
      priceTo: legacyUsedMax,
      updatedAt: marketPricing?.updatedAt,
      displayPriority: undefined,
      isLegacy: true,
    })
  }

  return legacySummaries
}

export function getPrimaryVehiclePriceSummary(
  pricing?: VehiclePricing,
  market: string = 'pt'
): VehiclePriceSummary | undefined {
  const summaries = getVehiclePriceSummaries(pricing, market)
  const byPriority = summaries.find((summary) => summary.displayPriority === 1)
  if (byPriority) return byPriority

  return (
    summaries.find((summary) => summary.kind === 'new' && summary.status !== 'not_sold_new') ??
    summaries.find((summary) => summary.kind === 'used') ??
    summaries.find((summary) => summary.kind === 'importedUsed') ??
    summaries[0]
  )
}

export function getVehicleDisplayName(
  vehicle: Pick<VehicleData, 'brand' | 'model' | 'variant'> & LocalizedVehicle,
  locale: string = 'pt'
): string {
  return (
    vehicle.localized?.[locale]?.displayName ||
    [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(' ') ||
    'Vehicle'
  )
}

export function getVehicleImage(
  vehicle: Pick<VehicleData, 'image' | 'heroImage'>
): string {
  return vehicle.image || vehicle.heroImage || VEHICLE_PLACEHOLDER_IMAGE
}

export function getVehiclePriceFromEur(
  pricing?: VehiclePricing
): number | undefined {
  return getPrimaryVehiclePriceSummary(pricing)?.priceFrom
}

export function getVehicleHighestPriceEur(
  pricing?: VehiclePricing
): number | undefined {
  return getPrimaryVehiclePriceSummary(pricing)?.priceTo
}

export function getVehicleBatteryCapacityKwh(
  battery?: VehicleBattery & {
    capacityKwh?: number
    usableKwh?: number
  }
): number | undefined {
  return firstNumber(battery?.batteryUsableKWh, battery?.usableKwh, battery?.capacityKwh)
}

export function getVehicleDcChargeKw(
  charging?: VehicleCharging & {
    dcChargeSpeedKw?: number
    maxPowerKw?: number
  }
): number | undefined {
  return firstNumber(charging?.dcMaxChargeKW, charging?.dcChargeSpeedKw, charging?.maxPowerKw)
}

export function getVehicleAcChargeKw(
  charging?: VehicleCharging & {
    acChargeSpeedKw?: number
  }
): number | undefined {
  return firstNumber(charging?.acMaxChargeKW, charging?.acChargeSpeedKw)
}

export function getVehicleChargeTime10To80Min(
  charging?: VehicleCharging & {
    chargeTime10To80Min?: number
  }
): number | undefined {
  return firstNumber(charging?.charge10to80Min, charging?.chargeTime10To80Min)
}

export function getVehicleTrunkCapacityL(
  dimensions?: VehicleDimensions
): number | undefined {
  return firstNumber(dimensions?.cargoLitersSeatsUp, dimensions?.trunkCapacityL)
}

export function getVehicleLengthMm(
  dimensions?: VehicleDimensions
): number | undefined {
  return firstNumber(dimensions?.lengthMM, dimensions?.lengthMm)
}

export function getVehicleWidthMm(
  dimensions?: VehicleDimensions
): number | undefined {
  return firstNumber(dimensions?.widthMM, dimensions?.widthMm)
}

export function getVehicleHeightMm(
  dimensions?: VehicleDimensions
): number | undefined {
  return firstNumber(dimensions?.heightMM, dimensions?.heightMm)
}

export function getVehicleWheelbaseMm(
  dimensions?: VehicleDimensions
): number | undefined {
  return firstNumber(dimensions?.wheelbaseMM, dimensions?.wheelbaseMm)
}

export function normalizeVehicleForComparison(
  vehicle: VehicleData,
  locale: string = 'pt'
): ComparisonVehicle {
  const batteryCapacityKwh = getVehicleBatteryCapacityKwh(vehicle.battery)
  const dcChargeKw = getVehicleDcChargeKw(vehicle.charging)
  const acChargeKw = getVehicleAcChargeKw(vehicle.charging)
  const chargeTime10To80Min = getVehicleChargeTime10To80Min(vehicle.charging)
  const basePriceEur = getVehiclePriceFromEur(vehicle.pricing)
  const highestPriceEur = getVehicleHighestPriceEur(vehicle.pricing)

  return {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    variant: vehicle.variant ?? '',
    displayName: getVehicleDisplayName(vehicle, locale),
    image: getVehicleImage(vehicle),
    segment: vehicle.segment ?? '',
    bodyType: vehicle.bodyType ?? '',
    drivetrain: vehicle.drivetrain ?? '',
    doors: vehicle.doors,
    seats: vehicle.seats,
    modelYear: vehicle.modelYear,
    battery: {
      ...vehicle.battery,
      capacityKwh: batteryCapacityKwh,
      usableKwh: batteryCapacityKwh,
      type: vehicle.battery?.batteryChemistry,
    },
    charging: {
      ...vehicle.charging,
      maxPowerKw: dcChargeKw,
      dcChargeSpeedKw: dcChargeKw,
      acChargeSpeedKw: acChargeKw,
      chargeTime10To80Min,
    },
    efficiency: {
      ...vehicle.efficiency,
      realWorldRangeKm:
        vehicle.efficiency?.estimatedRealRangeKm ??
        vehicle.efficiency?.realWorldRangeKm,
      realWorldConsumption:
        vehicle.efficiency?.realWorldConsumptionWhKm ??
        vehicle.efficiency?.realWorldConsumption,
      wltpConsumptionKwh100km:
        vehicle.efficiency?.wltpConsumptionKwh100km ??
        (vehicle.efficiency?.realWorldConsumptionWhKm != null
          ? vehicle.efficiency.realWorldConsumptionWhKm / 10
          : undefined),
    },
    dimensions: {
      ...vehicle.dimensions,
      lengthMm: getVehicleLengthMm(vehicle.dimensions),
      widthMm: getVehicleWidthMm(vehicle.dimensions),
      heightMm: getVehicleHeightMm(vehicle.dimensions),
      wheelbaseMm: getVehicleWheelbaseMm(vehicle.dimensions),
      trunkCapacityL: getVehicleTrunkCapacityL(vehicle.dimensions),
    },
    pricing: {
      ...vehicle.pricing,
      basePriceEur,
      recommendedPriceEur: basePriceEur,
      highestPriceEur,
    },
    comfort: vehicle.comfort,
  }
}
