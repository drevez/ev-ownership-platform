import { getTranslations } from '@/lib/getTranslations'
import { normalizeVehicleForComparison } from '@/lib/normalizeVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import {
  VehicleDataForComparison,
  ComparisonVehicle,
  ComparisonBadge,
  ComparisonMetric,
  ComparisonSummary,
} from '@/types/comparison'
import type { VehicleData } from '@/lib/loadVehicle'

/**
 * Format a number to a readable string with units
 */
export function formatMetricValue(
  value: unknown,
  unit?: string,
  locale: string = 'pt'
): string {
  const t = getTranslations(locale)

  if (value === null || value === undefined) {
    return t.common.notAvailable
  }

  if (typeof value === 'number') {
    if (unit === 'EUR' || unit === '€') {
      return `€${Math.round(value).toLocaleString()}`
    }

    if (unit === '%') {
      return `${value.toFixed(1)}%`
    }

    if (unit === 'ms') {
      return `${value.toFixed(1)} ${t.comparison.values.seconds}`
    }

    if (unit === 'kWh') {
      return `${value.toFixed(1)} kWh`
    }

    if (unit === 'kW') {
      return `${value.toFixed(0)} kW`
    }

    if (unit === 'km') {
      return `${Math.round(value)} km`
    }

    if (unit === 'km/h') {
      return `${Math.round(value)} km/h`
    }

    if (unit === 'Nm') {
      return `${Math.round(value)} Nm`
    }

    if (unit === 'bhp') {
      return `${Math.round(value)} bhp`
    }

    if (unit === 'L') {
      return `${Math.round(value)} L`
    }

    if (unit === 'kWh/100km') {
      return `${value.toFixed(1)} kWh/100km`
    }

    return value.toFixed(1)
  }

  return String(value)
}

/**
 * Calculate yearly charging cost in EUR
 */
export function calculateYearlyChargingCost(
  wltpConsumptionKwh100km?: number,
  averageKmPerYear: number = 15000
): number | null {
  if (!wltpConsumptionKwh100km) return null

  const kwhPerYear = (wltpConsumptionKwh100km / 100) * averageKmPerYear
  const costPerKwh = 0.25

  return Math.round(kwhPerYear * costPerKwh)
}

/**
 * Determine winner for a metric
 */
export function determineWinner(
  values: number[],
  metric: 'price' | 'range' | 'efficiency' | 'charging' | 'acceleration'
): number {
  if (values.length === 0) return -1

  if (metric === 'price') {
    const validValues = values.filter((v) => v > 0)
    return validValues.length > 0
      ? values.indexOf(Math.min(...validValues))
      : -1
  }

  return values.indexOf(Math.max(...values))
}

/**
 * Calculate badges for a vehicle in comparison
 */
export function calculateBadges(
  vehicle: VehicleDataForComparison,
  allVehicles: VehicleDataForComparison[],
  locale: string = 'pt'
): ComparisonBadge[] {
  const t = getTranslations(locale)
  const badges: ComparisonBadge[] = []

  // Best Range Badge
  const ranges = allVehicles
    .map((v) => v.efficiency?.wltpRangeKm || 0)
    .filter((r) => r > 0)

  if (
    ranges.length > 0 &&
    vehicle.efficiency?.wltpRangeKm === Math.max(...ranges)
  ) {
    badges.push({
      label: t.comparison.labels.bestRange,
      category: 'range',
      description: t.comparison.labels.longestRange,
    })
  }

  // Best Value Badge
  const prices = allVehicles
    .map((v) => v.pricing?.basePriceEur || 999999)
    .filter((p) => p > 0)

  if (
    prices.length > 0 &&
    vehicle.pricing?.basePriceEur === Math.min(...prices)
  ) {
    badges.push({
      label: t.comparison.labels.bestValue,
      category: 'value',
      description: t.comparison.labels.affordableComparison,
    })
  }

  // Fastest Charging Badge
  const chargeTimes = allVehicles
    .map((v) => v.charging?.chargeTime10To80Min || 999)
    .filter((t) => t < 999)

  if (
    chargeTimes.length > 0 &&
    vehicle.charging?.chargeTime10To80Min === Math.min(...chargeTimes)
  ) {
    badges.push({
      label: t.comparison.labels.fastestCharging,
      category: 'charging',
      description: t.comparison.labels.chargeTime,
    })
  }

  // Most Efficient Badge
  const consumptions = allVehicles
    .map((v) => v.efficiency?.wltpConsumptionKwh100km || 999)
    .filter((c) => c < 999)

  if (
    consumptions.length > 0 &&
    vehicle.efficiency?.wltpConsumptionKwh100km ===
      Math.min(...consumptions)
  ) {
    badges.push({
      label: t.comparison.labels.mostEfficient,
      category: 'efficiency',
      description: t.comparison.labels.efficiencyDescription,
    })
  }

  // Fastest Badge
  const accelerations = allVehicles
    .map((v) => v.performance?.acceleration0To100Ms || 999)
    .filter((a) => a < 999)

  if (
    accelerations.length > 0 &&
    vehicle.performance?.acceleration0To100Ms ===
      Math.min(...accelerations)
  ) {
    badges.push({
      label: t.comparison.labels.fastest,
      category: 'performance',
      description: t.comparison.labels.acceleration,
    })
  }

  return badges
}

/**
 * Build comparison metrics
 */
export function buildComparisonMetrics(
  vehicles: VehicleDataForComparison[],
  locale: string = 'pt'
): ComparisonMetric[] {
  const t = getTranslations(locale)
  const metrics: ComparisonMetric[] = []

  // Price
  const prices = vehicles.map((v) => v.pricing?.basePriceEur || 0)

  if (prices.some((p) => p > 0)) {
    const minPrice = Math.min(...prices.filter((p) => p > 0))
    const priceLabel = (
      price: NonNullable<VehicleDataForComparison['pricing']>['primaryPrice']
    ) => {
      if (price?.status === 'not_sold_new') {
        return t.modelsExplorer.price.kind.referenceNew
      }
      if (price?.kind === 'importedUsed') {
        return t.modelsExplorer.price.kind.importedUsed
      }
      if (price?.kind === 'used') return t.modelsExplorer.price.kind.used
      return t.modelsExplorer.price.kind.new
    }

    metrics.push({
      label: t.comparison.labels.startingPrice,
      category: 'primary',
      unit: '€',
      values: vehicles.map((v) => ({
        vehicleId: v.id,
        value: v.pricing?.basePriceEur || 0,
        displayValue: v.pricing?.basePriceEur
          ? `${priceLabel(v.pricing.primaryPrice)} ${Math.round(v.pricing.basePriceEur).toLocaleString(locale)} €`
          : t.common.notAvailable,
        isWinner: v.pricing?.basePriceEur === minPrice,
        percentageOfMax: 100,
      })),
    })
  }

  // WLTP Range
  const ranges = vehicles.map((v) => v.efficiency?.wltpRangeKm || 0)

  if (ranges.some((r) => r > 0)) {
    const maxRange = Math.max(...ranges)

    metrics.push({
      label: t.comparison.labels.wltpRange,
      category: 'primary',
      unit: 'km',
      values: vehicles.map((v) => ({
        vehicleId: v.id,
        value: v.efficiency?.wltpRangeKm || 0,
        displayValue: v.efficiency?.wltpRangeKm
          ? `${Math.round(v.efficiency.wltpRangeKm)} km`
          : t.common.notAvailable,
        isWinner: v.efficiency?.wltpRangeKm === maxRange,
        percentageOfMax: v.efficiency?.wltpRangeKm
          ? (v.efficiency.wltpRangeKm / maxRange) * 100
          : 0,
      })),
    })
  }

  // Battery
  const batteries = vehicles.map((v) => v.battery?.capacityKwh || 0)

  if (batteries.some((b) => b > 0)) {
    const maxBattery = Math.max(...batteries)

    metrics.push({
      label: t.comparison.labels.batteryCapacity,
      category: 'primary',
      unit: 'kWh',
      values: vehicles.map((v) => ({
        vehicleId: v.id,
        value: v.battery?.capacityKwh || 0,
        displayValue: v.battery?.capacityKwh
          ? `${v.battery.capacityKwh.toFixed(1)} kWh`
          : t.common.notAvailable,
        isWinner: v.battery?.capacityKwh === maxBattery,
        percentageOfMax: v.battery?.capacityKwh
          ? (v.battery.capacityKwh / maxBattery) * 100
          : 0,
      })),
    })
  }

  return metrics
}

/**
 * Generate comparison summary
 */
export function generateComparisonSummary(
  vehicles: ComparisonVehicle[],
  locale: string = 'pt'
): ComparisonSummary {
  const t = getTranslations(locale)
  const leader = (
    getValue: (vehicle: ComparisonVehicle) => number | undefined,
    direction: 'lowest' | 'highest'
  ) => {
    const values = vehicles
      .map((vehicle) => ({ vehicle, value: getValue(vehicle) }))
      .filter((item): item is { vehicle: ComparisonVehicle; value: number } =>
        item.value != null && item.value > 0
      )

    if (values.length === 0) return t.common.notAvailable
    const target = direction === 'lowest'
      ? Math.min(...values.map((item) => item.value))
      : Math.max(...values.map((item) => item.value))
    const winners = values.filter((item) => item.value === target)

    return winners.length > 1
      ? t.comparison.recommendation.tie
      : winners[0].vehicle.displayName
  }

  const bestValue = leader((vehicle) => vehicle.pricing?.basePriceEur, 'lowest')
  const bestRange = leader((vehicle) => vehicle.efficiency?.wltpRangeKm, 'highest')
  const fastestCharging = leader(
    (vehicle) => vehicle.charging?.chargeTime10To80Min,
    'lowest'
  )
  const mostEfficient = leader(
    (vehicle) => vehicle.efficiency?.wltpConsumptionKwh100km,
    'lowest'
  )

  let recommendation = t.comparison.recommendation.default

  if (vehicles.length === 2) {
    recommendation = bestValue === bestRange &&
      bestValue !== t.common.notAvailable &&
      bestValue !== t.comparison.recommendation.tie
      ? t.comparison.recommendation.sameLeader.replace('{vehicle}', bestValue)
      : t.comparison.recommendation.twoVehicles
          .replace('{bestValue}', bestValue)
          .replace('{bestRange}', bestRange)
  }

  if (vehicles.length === 3) {
    const counts = [bestValue, bestRange, fastestCharging, mostEfficient]
      .filter((name) =>
        name !== t.common.notAvailable &&
        name !== t.comparison.recommendation.tie
      )
      .reduce<Record<string, number>>((result, name) => {
        result[name] = (result[name] ?? 0) + 1
        return result
      }, {})
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]

    recommendation = dominant?.[1] >= 2
      ? t.comparison.recommendation.multiMetricLeader
          .replace('{vehicle}', dominant[0])
          .replace('{count}', String(dominant[1]))
      : t.comparison.recommendation.tradeOff
  }

  return {
    bestValue,
    bestRange,
    fastestCharging,
    mostEfficient,
    recommendation,
  }
}

export function mapRegistryToComparisonVehicle(entry: {
  id: string
  brand: string
  model: string
  variant: string
  segment: string
  bodyType: string
  drivetrain: string
  heroImage: string
}): ComparisonVehicle {
  return {
    id: entry.id,
    brand: entry.brand,
    model: entry.model,
    variant: entry.variant,
    displayName:
      `${entry.brand} ${entry.model} ${entry.variant}`.trim(),
    image: entry.heroImage || VEHICLE_PLACEHOLDER_IMAGE,
    segment: entry.segment,
    bodyType: entry.bodyType,
    drivetrain: entry.drivetrain,
  }
}

export function mapApiToComparisonVehicle(
  data: Record<string, unknown> & { id: string }
): ComparisonVehicle {
  if (
    typeof data.brand === 'string' &&
    typeof data.model === 'string'
  ) {
    return normalizeVehicleForComparison(data as unknown as VehicleData)
  }

  const image =
    (typeof data.image === 'string' && data.image) ||
    (typeof data.heroImage === 'string' && data.heroImage) ||
    VEHICLE_PLACEHOLDER_IMAGE

  return {
    id: data.id,
    brand: String(data.brand ?? ''),
    model: String(data.model ?? ''),
    variant: String(data.variant ?? ''),
    displayName:
      (typeof data.displayName === 'string' && data.displayName) ||
      `${data.brand ?? ''} ${data.model ?? ''} ${data.variant ?? ''}`.trim(),
    image,
    segment: String(data.segment ?? ''),
    bodyType: String(data.bodyType ?? ''),
    drivetrain: String(data.drivetrain ?? ''),
    doors: typeof data.doors === 'number' ? data.doors : undefined,
    seats: typeof data.seats === 'number' ? data.seats : undefined,
    battery: data.battery as ComparisonVehicle['battery'],
    charging: data.charging as ComparisonVehicle['charging'],
    efficiency: data.efficiency as ComparisonVehicle['efficiency'],
    dimensions: data.dimensions as ComparisonVehicle['dimensions'],
    pricing: data.pricing as ComparisonVehicle['pricing'],
    comfort: data.comfort as ComparisonVehicle['comfort'],
    performance: data.performance as ComparisonVehicle['performance'],
  }
}
