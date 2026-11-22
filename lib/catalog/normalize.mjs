/** Canonical catalog format, shared by the app and migration tools. No invented dates/sources. */
export const MODULE_NAMES = ['core', 'battery', 'charging', 'comfort', 'dimensions', 'efficiency', 'pricing']
export const SPEC_NAMES = ['battery', 'charging', 'comfort', 'dimensions', 'efficiency']
export function modelSlug(brand, model) {
  return [brand, model].map(value => value.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).join('-')
}
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
export function canonicalPricing(pricing = {}) {
  const pt = pricing.pt ?? {}
  const result = {
    market: pricing.market ?? pt.market ?? 'pt',
    currency: pricing.currency ?? pt.currency ?? 'EUR',
    ...(pricing.lastReviewedAt ?? pt.updatedAt ? { lastReviewedAt: pricing.lastReviewedAt ?? pt.updatedAt } : {}),
    offers: [],
  }
  const offer = (raw, condition, marketScope, index) => {
    const { price, updatedAt, available, ...rest } = raw
    const priceFrom = positive(raw.priceFrom ?? price?.min)
    const priceTo = positive(raw.priceTo ?? price?.max)
    return {
      ...rest, condition: raw.condition ?? condition,
      marketScope: raw.marketScope ?? marketScope,
      status: raw.status ?? (available === false ? 'unknown' : priceFrom || priceTo ? 'available' : 'not_enough_data'),
      priceFrom, priceTo,
      sourceType: raw.sourceType ?? 'unknown', confidence: raw.confidence ?? 'unknown',
      ...(raw.priceDate ?? updatedAt ?? result.lastReviewedAt ? { priceDate: raw.priceDate ?? updatedAt ?? result.lastReviewedAt } : {}),
      displayPriority: raw.displayPriority ?? index + 1,
    }
  }
  if (Array.isArray(pricing.offers)) {
    result.offers = pricing.offers.map((raw, i) => offer(raw, 'new', 'official_pt', i))
  } else {
    for (const [key, condition, scope] of [['new', 'new', 'official_pt'], ['used', 'used', 'used_pt'], ['importedUsed', 'used', 'imported_to_pt']]) {
      const raw = pt[key]
      if (raw && (raw.available || raw.priceFrom != null || raw.priceTo != null)) {
        result.offers.push(offer(raw, condition, scope, result.offers.length))
      }
    }
    if (!result.offers.length) {
      for (const [min, max, condition, scope] of [
        [pt.consumerPrice?.min ?? pricing.basePriceEur ?? pricing.recommendedPriceEur, pt.consumerPrice?.max ?? pricing.highestPriceEur, 'new', 'official_pt'],
        [pt.usedPrice?.min, pt.usedPrice?.max, 'used', 'used_pt'],
      ]) {
        if (positive(min) || positive(max)) result.offers.push(offer({ priceFrom: min, priceTo: max }, condition, scope, result.offers.length))
      }
    }
  }
  return result
}
export function canonicalFiles(files) {
  for (const name of MODULE_NAMES) {
    if (!files[name] || typeof files[name] !== 'object' || Array.isArray(files[name])) throw new Error(`Missing/invalid module: ${name}`)
  }
  const result = structuredClone(files)
  result.pricing = canonicalPricing(files.pricing)
  return result
}
export function registryEntry(files) {
  const core = files.core
  return {
    id: core.id, brand: core.brand, model: core.model,
    variant: core.variant ?? '', segment: core.segment ?? '', bodyType: core.bodyType ?? '',
    drivetrain: core.drivetrain ?? '', heroImage: core.image ?? core.heroImage ?? '',
  }
}
