import { loadVehicle, loadVehicleRegistry, type VehicleData } from '@/lib/loadVehicle'
import { getTranslations } from '@/lib/getTranslations'
import { getVehiclePriceSummaries, normalizeVehicleForComparison } from '@/lib/normalizeVehicle'
import { LANGUAGE_LOCALES, type Language } from '@/config/i18n'
import type { ComparisonVehicle } from '@/types/comparison'
import type {
  CargoNeed,
  QuizAnswers,
  RecommendationBreakdownItem,
  RecommendationKeySpecs,
  RecommendationResult,
} from '@/types/recommendation'

interface Candidate {
  raw: VehicleData
  vehicle: ComparisonVehicle
}

interface ScorePart {
  score: number
  maxScore: number
  reason: string
}

type RecommendationEngineTranslations =
  ReturnType<typeof getTranslations>['recommendationEngine']

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined
}

function positiveNumber(value: unknown): number | undefined {
  const number = numberOrUndefined(value)
  return number != null && number > 0 ? number : undefined
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function weightedScore(value: number, maxScore: number) {
  return clamp(value) * maxScore
}

function interpolate(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template
  )
}

function getConsumerPrice(raw: VehicleData): number | undefined {
  const summaries = getVehiclePriceSummaries(raw.pricing)
  return positiveNumber(
    summaries.find((summary) =>
      summary.kind === 'new' &&
      summary.status !== 'not_sold_new'
    )?.priceFrom
  ) ?? positiveNumber(raw.pricing?.basePriceEur)
}

function getUsedPrice(raw: VehicleData): number | undefined {
  const summaries = getVehiclePriceSummaries(raw.pricing)
  return positiveNumber(
    summaries.find((summary) => summary.kind === 'used')?.priceFrom
  ) ?? positiveNumber(
    summaries.find((summary) => summary.kind === 'importedUsed')?.priceFrom
  )
}

function getPreferredPriceSummary(raw: VehicleData, answers: QuizAnswers) {
  const summaries = getVehiclePriceSummaries(raw.pricing)
    .filter((summary) =>
      positiveNumber(summary.priceFrom) != null &&
      summary.status !== 'not_sold_new'
    )
  const newSummaries = summaries.filter((summary) => summary.kind === 'new')
  const usedSummaries = summaries.filter((summary) =>
    summary.kind === 'used' || summary.kind === 'importedUsed'
  )
  const eligible =
    answers.purchaseType === 'new'
      ? newSummaries
      : answers.purchaseType === 'used'
        ? usedSummaries
        : summaries

  return eligible.sort(
    (a, b) =>
      (a.priceFrom ?? Number.MAX_SAFE_INTEGER) -
      (b.priceFrom ?? Number.MAX_SAFE_INTEGER)
  )[0]
}

function getPreferredPrice(raw: VehicleData, answers: QuizAnswers): number | undefined {
  return positiveNumber(getPreferredPriceSummary(raw, answers)?.priceFrom) ??
    (answers.purchaseType !== 'used'
      ? getConsumerPrice(raw)
      : getUsedPrice(raw))
}

function getRealRange(raw: VehicleData, vehicle: ComparisonVehicle) {
  return positiveNumber(raw.efficiency?.estimatedRealRangeKm) ??
    positiveNumber(vehicle.efficiency?.realWorldRangeKm) ??
    positiveNumber(vehicle.efficiency?.wltpRangeKm)
}

function getMotorwayRange(raw: VehicleData) {
  return positiveNumber(raw.efficiency?.motorwayRangeKm)
}

function getConsumption(raw: VehicleData, vehicle: ComparisonVehicle) {
  return positiveNumber(raw.efficiency?.realWorldConsumptionWhKm) ??
    (positiveNumber(vehicle.efficiency?.wltpConsumptionKwh100km) != null
      ? Number(vehicle.efficiency?.wltpConsumptionKwh100km) * 10
      : undefined)
}

function getTrunk(raw: VehicleData, vehicle: ComparisonVehicle) {
  return positiveNumber(raw.dimensions?.cargoLitersSeatsUp) ??
    positiveNumber(vehicle.dimensions?.trunkCapacityL)
}

function getWeight(answers: QuizAnswers, priority: QuizAnswers['priorities'][number]) {
  return answers.priorities.includes(priority) ? 1.25 : 1
}

function scoreBudget(
  raw: VehicleData,
  answers: QuizAnswers,
  maxScore: number,
  t: RecommendationEngineTranslations,
  locale: string
): ScorePart {
  const price = getPreferredPrice(raw, answers)

  if (price == null) {
    const incompatiblePurchase =
      (answers.purchaseType === 'new' && getConsumerPrice(raw) == null) ||
      (answers.purchaseType === 'used' && getUsedPrice(raw) == null)

    return {
      score: maxScore * (incompatiblePurchase ? 0.08 : 0.35),
      maxScore,
      reason: incompatiblePurchase
        ? answers.purchaseType === 'new'
          ? t.reasons.newPriceUnavailable
          : t.reasons.usedPriceUnavailable
        : t.reasons.priceUnavailable,
    }
  }

  const budget = Math.max(answers.budget, 1)
  const ratio = price / budget

  if (ratio <= 0.9) {
    return {
      score: maxScore,
      maxScore,
      reason: interpolate(t.reasons.comfortablyWithinBudget, {
        price: formatCurrency(price, locale),
      }),
    }
  }

  if (ratio <= 1) {
    return {
      score: maxScore * 0.9,
      maxScore,
      reason: interpolate(t.reasons.withinBudget, {
        price: formatCurrency(price, locale),
      }),
    }
  }

  if (ratio <= 1.12) {
    return {
      score: maxScore * (1 - (ratio - 1) / 0.18),
      maxScore,
      reason: interpolate(t.reasons.slightlyAboveBudget, {
        price: formatCurrency(price, locale),
      }),
    }
  }

  return {
    score: maxScore * 0.15,
    maxScore,
    reason: interpolate(t.reasons.farAboveBudget, {
      price: formatCurrency(price, locale),
    }),
  }
}

function targetRange(answers: QuizAnswers) {
  const commuteNeed =
    answers.chargingAccess === 'public'
      ? answers.dailyCommuteKm * 7
      : answers.dailyCommuteKm * 5

  const tripNeed =
    answers.roadTrips === 'often'
      ? 420
      : answers.roadTrips === 'sometimes'
        ? 320
        : 220

  return Math.max(commuteNeed, tripNeed, 180)
}

function scoreRange(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  maxScore: number,
  t: RecommendationEngineTranslations
): ScorePart {
  const range = getRealRange(raw, vehicle)
  const motorwayRange = getMotorwayRange(raw)
  const target = targetRange(answers)
  const usableRange = answers.roadTrips === 'often'
    ? motorwayRange ?? range
    : range

  if (usableRange == null) {
    return {
      score: maxScore * 0.4,
      maxScore,
      reason: t.reasons.rangeUnavailable,
    }
  }

  const ratio = usableRange / target

  return {
    score: weightedScore(ratio, maxScore),
    maxScore,
    reason:
      ratio >= 1
        ? interpolate(t.reasons.rangeAdequate, {
            range: Math.round(usableRange),
          })
        : interpolate(t.reasons.rangeNeedsPlanning, {
            range: Math.round(usableRange),
          }),
  }
}

function scoreCharging(
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  maxScore: number,
  t: RecommendationEngineTranslations
): ScorePart {
  const dc = positiveNumber(vehicle.charging?.dcChargeSpeedKw) ??
    positiveNumber(vehicle.charging?.maxPowerKw)
  const chargeTime = positiveNumber(vehicle.charging?.chargeTime10To80Min)

  if (dc == null && chargeTime == null) {
    return {
      score: maxScore * 0.4,
      maxScore,
      reason: t.reasons.chargingUnavailable,
    }
  }

  const dcScore = dc != null ? clamp(dc / 190) : 0.45
  const timeScore = chargeTime != null ? clamp((45 - chargeTime) / 25) : 0.55
  const publicChargingPressure =
    answers.chargingAccess === 'public' || answers.roadTrips === 'often'
      ? 1
      : 0.75

  const combined = (dcScore * 0.65 + timeScore * 0.35) * publicChargingPressure

  return {
    score: weightedScore(combined, maxScore),
    maxScore,
    reason:
      dc != null
        ? interpolate(t.reasons.dcCharging, { power: Math.round(dc) })
        : t.reasons.chargingTimeOnly,
  }
}

function cargoTarget(cargoNeed: CargoNeed) {
  if (cargoNeed === 'large') return 520
  if (cargoNeed === 'medium') return 390
  return 250
}

function scoreSpace(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  maxScore: number,
  t: RecommendationEngineTranslations
): ScorePart {
  const seats = positiveNumber(vehicle.seats) ?? positiveNumber(raw.seats)
  const trunk = getTrunk(raw, vehicle)
  const body = vehicle.bodyType.toLowerCase()
  const seatScore = seats != null
    ? clamp(seats / Math.max(answers.familySize, 1))
    : 0.55
  const trunkScore = trunk != null
    ? clamp(trunk / cargoTarget(answers.cargoNeed))
    : 0.55
  const bodyBonus =
    answers.cargoNeed === 'large' && (body.includes('suv') || body.includes('wagon'))
      ? 0.1
      : 0

  return {
    score: weightedScore(seatScore * 0.55 + trunkScore * 0.45 + bodyBonus, maxScore),
    maxScore,
    reason:
      trunk != null
        ? interpolate(t.reasons.seatsAndTrunk, {
            seats: seats ?? 'N/D',
            trunk: Math.round(trunk),
          })
        : interpolate(t.reasons.seatsOnly, {
            seats: seats ?? 'N/D',
          }),
  }
}

function scoreEfficiency(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  maxScore: number,
  t: RecommendationEngineTranslations
): ScorePart {
  const consumption = getConsumption(raw, vehicle)

  if (consumption == null) {
    return {
      score: maxScore * 0.45,
      maxScore,
      reason: t.reasons.consumptionUnavailable,
    }
  }

  const cityFriendly = answers.dailyCommuteKm <= 45 ? 1.05 : 1
  const score = clamp(((230 - consumption) / 80) * cityFriendly)

  return {
    score: weightedScore(score, maxScore),
    maxScore,
    reason: interpolate(t.reasons.consumption, {
      consumption: Math.round(consumption),
    }),
  }
}

function scoreComfort(
  raw: VehicleData,
  maxScore: number,
  t: RecommendationEngineTranslations
): ScorePart {
  let points = 0
  const comfort = raw.comfort

  if (!comfort) {
    return {
      score: maxScore * 0.45,
      maxScore,
      reason: t.reasons.comfortIncomplete,
    }
  }

  if (comfort.heatPumpAvailable) points += 0.25
  if (comfort.panoramicRoof) points += 0.15
  if (comfort.vehicleToLoad) points += 0.15
  if ((comfort.softwareExperienceLevel ?? 0) >= 8) points += 0.25
  if ((comfort.maintenanceLevel ?? 3) <= 2) points += 0.1
  if ((comfort.insuranceLevel ?? 3) <= 2) points += 0.1

  return {
    score: weightedScore(points, maxScore),
    maxScore,
    reason:
      points >= 0.65
        ? t.reasons.goodComfort
        : t.reasons.acceptableComfort,
  }
}

function scorePreferences(
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  maxScore: number,
  t: RecommendationEngineTranslations
): ScorePart {
  let score = 0.55
  const body = `${vehicle.bodyType} ${vehicle.segment}`.toLowerCase()

  if (answers.bodyPreference === 'any') {
    score += 0.15
  } else if (body.includes(answers.bodyPreference)) {
    score += 0.3
  }

  if (answers.ownershipStyle === 'premium') {
    if ((vehicle.pricing?.basePriceEur ?? 0) >= 45000) score += 0.1
    if ((vehicle.battery?.capacityKwh ?? 0) >= 75) score += 0.1
  }

  if (answers.ownershipStyle === 'lowest_cost') {
    if ((vehicle.pricing?.basePriceEur ?? Number.MAX_SAFE_INTEGER) <= answers.budget) {
      score += 0.15
    }
    if ((vehicle.efficiency?.wltpConsumptionKwh100km ?? 99) <= 17) {
      score += 0.1
    }
  }

  return {
    score: weightedScore(score, maxScore),
    maxScore,
    reason:
      answers.bodyPreference === 'any'
        ? t.reasons.flexibleBody
        : interpolate(t.reasons.bodyPreference, {
            body: answers.bodyPreference,
          }),
  }
}

function formatCurrency(value: number, locale: string) {
  return `${Math.round(value).toLocaleString(locale)} €`
}

function buildTags(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  t: RecommendationEngineTranslations
): string[] {
  const tags: string[] = []

  if ((vehicle.pricing?.basePriceEur ?? Number.MAX_SAFE_INTEGER) <= answers.budget) {
    tags.push(t.tags.withinBudget)
  }
  if ((vehicle.battery?.capacityKwh ?? 0) >= 75) tags.push(t.tags.bigBattery)
  if ((vehicle.charging?.dcChargeSpeedKw ?? 0) >= 170) tags.push(t.tags.fastCharging)
  if ((getRealRange(raw, vehicle) ?? 0) >= 430) tags.push(t.tags.goodRange)
  if ((getConsumption(raw, vehicle) ?? 999) <= 165) tags.push(t.tags.efficient)
  if ((vehicle.seats ?? 0) >= Math.max(answers.familySize, 5)) tags.push(t.tags.family)

  return tags.slice(0, 4)
}

function buildKeySpecs(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers
): RecommendationKeySpecs {
  const price = getPreferredPriceSummary(raw, answers)

  return {
    priceFromEur: getPreferredPrice(raw, answers),
    priceKind: price?.kind,
    priceModelYear: price?.modelYear,
    priceYearFrom: price?.yearFrom,
    priceYearTo: price?.yearTo,
    usableBatteryKwh: vehicle.battery?.capacityKwh,
    realRangeKm: getRealRange(raw, vehicle),
    motorwayRangeKm: getMotorwayRange(raw),
    dcChargeKw: vehicle.charging?.dcChargeSpeedKw,
    charge10to80Min: vehicle.charging?.chargeTime10To80Min,
    consumptionWhKm: getConsumption(raw, vehicle),
    trunkLiters: getTrunk(raw, vehicle),
    seats: vehicle.seats,
  }
}

function estimateMonthlyCost(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers
) {
  const monthlyKm = Math.max(answers.dailyCommuteKm * 22, 900)
  const consumption = getConsumption(raw, vehicle) ?? 180
  const pricePerKwh =
    answers.chargingAccess === 'home'
      ? 0.24
      : answers.chargingAccess === 'work'
        ? 0.28
        : answers.chargingAccess === 'public'
          ? 0.45
          : 0.33

  return Math.round(((monthlyKm * consumption) / 1000 / 0.88) * pricePerKwh)
}

function dataCompletenessFor(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers
) {
  const signals = [
    getPreferredPrice(raw, answers),
    getRealRange(raw, vehicle),
    getMotorwayRange(raw),
    vehicle.charging?.dcChargeSpeedKw ?? vehicle.charging?.maxPowerKw,
    vehicle.charging?.chargeTime10To80Min,
    getConsumption(raw, vehicle),
    getTrunk(raw, vehicle),
    vehicle.seats ?? raw.seats,
  ]
  const available = signals.filter((value) => positiveNumber(value) != null).length

  return Math.round((available / signals.length) * 100)
}

function confidenceFor(
  dataCompleteness: number
): RecommendationResult['confidence'] {
  if (dataCompleteness >= 80) return 'high'
  if (dataCompleteness >= 55) return 'medium'
  return 'low'
}

function buildReasons(parts: RecommendationBreakdownItem[]) {
  return parts
    .filter((part) => part.score / part.maxScore >= 0.68)
    .sort((a, b) => b.score / b.maxScore - a.score / a.maxScore)
    .map((part) => part.reason)
    .slice(0, 4)
}

function buildDrawbacks(parts: RecommendationBreakdownItem[]) {
  return parts
    .filter((part) => part.score / part.maxScore < 0.46)
    .sort((a, b) => a.score / a.maxScore - b.score / b.maxScore)
    .map((part) => part.reason)
    .slice(0, 3)
}

async function loadCandidates(language: Language): Promise<Candidate[]> {
  const registry = await loadVehicleRegistry()
  const loaded = await Promise.all(
    registry.map(async (entry) => {
      const raw = await loadVehicle(entry.id)
      if (!raw) return null
      return {
        raw,
        vehicle: normalizeVehicleForComparison(raw, language),
      }
    })
  )

  return loaded.filter((candidate): candidate is Candidate => candidate !== null)
}

function buildBreakdown(
  raw: VehicleData,
  vehicle: ComparisonVehicle,
  answers: QuizAnswers,
  t: RecommendationEngineTranslations,
  locale: string
): RecommendationBreakdownItem[] {
  const budget = scoreBudget(raw, answers, 22 * getWeight(answers, 'budget'), t, locale)
  const range = scoreRange(raw, vehicle, answers, 20 * getWeight(answers, 'range'), t)
  const charging = scoreCharging(vehicle, answers, 16 * getWeight(answers, 'charging'), t)
  const space = scoreSpace(raw, vehicle, answers, 14 * getWeight(answers, 'space'), t)
  const efficiency = scoreEfficiency(raw, vehicle, answers, 10 * getWeight(answers, 'efficiency'), t)
  const comfort = scoreComfort(raw, 9 * getWeight(answers, 'comfort'), t)
  const preference = scorePreferences(vehicle, answers, 9, t)

  return [
    {
      category: 'budget',
      label: t.labels.budget,
      ...budget,
    },
    {
      category: 'range',
      label: t.labels.range,
      ...range,
    },
    {
      category: 'charging',
      label: t.labels.charging,
      ...charging,
    },
    {
      category: 'space',
      label: t.labels.space,
      ...space,
    },
    {
      category: 'efficiency',
      label: t.labels.efficiency,
      ...efficiency,
    },
    {
      category: 'comfort',
      label: t.labels.comfort,
      ...comfort,
    },
    {
      category: 'preference',
      label: t.labels.preference,
      ...preference,
    },
  ]
}

export async function recommendEVs(
  answers: QuizAnswers,
  limit: number = 6,
  language: Language = 'pt'
): Promise<RecommendationResult[]> {
  const candidates = await loadCandidates(language)
  return scoreCandidates(candidates, answers, limit, language)
}

export function scoreRecommendationCandidates(
  vehicles: VehicleData[],
  answers: QuizAnswers,
  limit: number = 6,
  language: Language = 'pt'
): RecommendationResult[] {
  const candidates = vehicles.map((raw) => ({
    raw,
    vehicle: normalizeVehicleForComparison(raw, language),
  }))

  return scoreCandidates(candidates, answers, limit, language)
}

function scoreCandidates(
  candidates: Candidate[],
  answers: QuizAnswers,
  limit: number,
  language: Language
): RecommendationResult[] {
  const translations = getTranslations(language)
  const t = translations.recommendationEngine
  const numberLocale = LANGUAGE_LOCALES[language]

  const scored = candidates.map(({ raw, vehicle }) => {
    const breakdown = buildBreakdown(raw, vehicle, answers, t, numberLocale)
    const score = breakdown.reduce((sum, part) => sum + part.score, 0)
    const maxScore = breakdown.reduce((sum, part) => sum + part.maxScore, 0)
    const matchPercentage = Math.round((score / maxScore) * 100)
    const price = getPreferredPrice(raw, answers)
    const dataCompleteness = dataCompletenessFor(raw, vehicle, answers)

    return {
      vehicle,
      score: Number(score.toFixed(2)),
      matchPercentage,
      confidence: confidenceFor(dataCompleteness),
      dataCompleteness,
      reasons: buildReasons(breakdown),
      drawbacks: buildDrawbacks(breakdown),
      tags: buildTags(raw, vehicle, answers, t),
      estimatedMonthlyCost: estimateMonthlyCost(raw, vehicle, answers),
      priceDeltaEur: price != null ? Math.round(price - answers.budget) : undefined,
      breakdown,
      keySpecs: buildKeySpecs(raw, vehicle, answers),
    }
  })

  return scored
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage
      }

      if (a.confidence !== b.confidence) {
        const rank = { high: 3, medium: 2, low: 1 }
        return rank[b.confidence] - rank[a.confidence]
      }

      return (b.keySpecs.realRangeKm ?? 0) - (a.keySpecs.realRangeKm ?? 0)
    })
    .slice(0, limit)
}
