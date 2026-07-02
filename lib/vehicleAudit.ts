import fs from 'fs/promises'
import path from 'path'
import {
  validateVehicleFiles,
  type VehicleDataIssue,
} from '@/lib/vehicleDataValidation'
import type { VehicleFiles } from '@/lib/internalVehicleFiles'

const VEHICLES_DIR = path.join(process.cwd(), 'public', 'data', 'vehicles')
const REGISTRY_PATH = path.join(process.cwd(), 'data', 'registry', 'vehicles.json')

const REQUIRED_MODULES = [
  'battery.json',
  'charging.json',
  'comfort.json',
  'core.json',
  'dimensions.json',
  'efficiency.json',
  'pricing.json',
] as const

type RequiredModule = (typeof REQUIRED_MODULES)[number]
type JsonRecord = Record<string, unknown>

interface RegistryEntry {
  id?: string
  brand?: string
  model?: string
  variant?: string
}

export interface VehicleAuditRow {
  id: string
  registryId?: string
  brand: string
  model: string
  variant: string
  status: 'ok' | 'needs_fix'
  publicStatus: 'ready' | 'incomplete'
  verificationStatus: 'verified' | 'needs_review'
  completeness: number
  issueCount: number
  issues: string[]
  structuralIssues: VehicleDataIssue[]
  structuralErrorCount: number
  structuralWarningCount: number
  publicIssues: string[]
  verificationIssues: string[]
  missingModules: string[]
  invalidModules: string[]
  hasRequiredCore: boolean
  hasCompleteModules: boolean
  hasRegistryEntry: boolean
  hasPricing: boolean
  hasStructuredPricing: boolean
  hasNewPricing: boolean
  hasUsedPricing: boolean
  hasImportedUsedPricing: boolean
  hasPricingUpdatedAt: boolean
  hasPricingSource: boolean
  hasPricingSourceUrl: boolean
  hasPricingYearContext: boolean
  hasLowConfidencePricing: boolean
  pricingSchema: 'offers' | 'structured_pt' | 'legacy' | 'missing'
  pricingTags: string[]
  hasImage: boolean
  hasRange: boolean
  hasCharging: boolean
  hasBattery: boolean
  hasDimensions: boolean
  hasCompleteLocalization: boolean
  missingLocalization: string[]
}

export interface VehicleAuditResult {
  rows: VehicleAuditRow[]
  stats: {
    totalFolders: number
    registryEntries: number
    ok: number
    needsFix: number
    publicReady: number
    publicIncomplete: number
    verified: number
    needsReview: number
    loadableCore: number
    completeModules: number
    invalidJsonVehicles: number
    missingRequiredCore: number
    idMismatch: number
    missingAnyModule: number
    missingImage: number
    missingPricing: number
    legacyPricing: number
    offersPricing: number
    missingStructuredNewPricing: number
    missingPricingUpdatedAt: number
    missingPricingSource: number
    missingPricingSourceUrl: number
    missingPricingYearContext: number
    lowConfidencePricing: number
    structuralErrorVehicles: number
    structuralWarningVehicles: number
    structuralErrors: number
    structuralWarnings: number
    missingLocalization: number
    notInRegistry: number
    brandCountFromCore: number
    brandCountFromRegistry: number
  }
  brandsFromCore: { brand: string; count: number }[]
  brandsFromRegistry: { brand: string; count: number }[]
  issueBuckets: { issue: string; count: number }[]
  registryWithoutFolder: string[]
}

async function readJson(filePath: string): Promise<{
  data?: unknown
  error?: string
}> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return { data: JSON.parse(content) }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown JSON error',
    }
  }
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as JsonRecord
}

function getNestedNumber(
  data: JsonRecord | null | undefined,
  pathParts: string[]
): number | undefined {
  let current: unknown = data

  for (const part of pathParts) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }

    current = (current as JsonRecord)[part]
  }

  return typeof current === 'number' && Number.isFinite(current)
    ? current
    : undefined
}

function getNestedBoolean(
  data: JsonRecord | null | undefined,
  pathParts: string[]
): boolean | undefined {
  let current: unknown = data

  for (const part of pathParts) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }

    current = (current as JsonRecord)[part]
  }

  return typeof current === 'boolean' ? current : undefined
}

function getNestedString(
  data: JsonRecord | null | undefined,
  pathParts: string[]
): string | undefined {
  let current: unknown = data

  for (const part of pathParts) {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined
    }

    current = (current as JsonRecord)[part]
  }

  return getString(current)
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function getPricingOffers(pricing: JsonRecord | null | undefined): JsonRecord[] {
  const offers = pricing?.offers
  if (!Array.isArray(offers)) return []
  return offers.filter((offer): offer is JsonRecord =>
    Boolean(offer && typeof offer === 'object' && !Array.isArray(offer))
  )
}

function getOfferPriceFrom(offer: JsonRecord): number | undefined {
  const directPrice = getNestedNumber(offer, ['priceFrom'])
  if (directPrice != null) return directPrice
  return getNestedNumber(offer, ['price', 'min'])
}

function hasOffer(
  offers: JsonRecord[],
  predicate: (offer: JsonRecord) => boolean
): boolean {
  return offers.some((offer) => getOfferPriceFrom(offer) != null && predicate(offer))
}

function hasOfferString(
  offers: JsonRecord[],
  key: string
): boolean {
  return offers.some((offer) => getString(offer[key]) != null)
}

function hasLowConfidenceOffer(offers: JsonRecord[]): boolean {
  return offers.some((offer) => {
    const confidence = getString(offer.confidence)
    return confidence === 'low' || confidence === 'unknown'
  })
}

function getMissingLocalization(core: JsonRecord | undefined): string[] {
  const localized = asRecord(core?.localized)
  const missing: string[] = []

  for (const locale of ['pt', 'en', 'es']) {
    const entry = asRecord(localized?.[locale])
    const aliases = entry?.searchAliases
    const hasAliases = Array.isArray(aliases) && aliases.some((alias) => getString(alias) != null)

    if (!getString(entry?.displayName)) missing.push(`${locale}.displayName`)
    if (!hasAliases) missing.push(`${locale}.searchAliases`)
  }

  return missing
}

function addCount(map: Map<string, number>, key?: string) {
  if (!key) return
  map.set(key, (map.get(key) ?? 0) + 1)
}

function mapToSortedList(map: Map<string, number>) {
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0], 'pt'))
    .map(([brand, count]) => ({ brand, count }))
}

function issueKey(issue: string): string {
  if (issue.startsWith('core.id mismatch')) return 'core.id mismatch'
  return issue
}

async function localImageExists(image?: string): Promise<boolean> {
  if (!image) return false
  if (!image.startsWith('/')) return true

  const cleanImage = image.split(/[?#]/)[0]

  try {
    await fs.access(path.join(process.cwd(), 'public', cleanImage))
    return true
  } catch {
    return false
  }
}

function calculateCompleteness(parts: {
  hasRequiredCore: boolean
  hasCompleteModules: boolean
  hasPricing: boolean
  hasRange: boolean
  hasCharging: boolean
  hasBattery: boolean
  hasDimensions: boolean
  hasImage: boolean
}) {
  let score = 0
  if (parts.hasRequiredCore) score += 30
  if (parts.hasCompleteModules) score += 10
  if (parts.hasPricing) score += 15
  if (parts.hasRange) score += 15
  if (parts.hasCharging) score += 10
  if (parts.hasBattery) score += 10
  if (parts.hasDimensions) score += 5
  if (parts.hasImage) score += 5
  return score
}

export async function auditVehicles(): Promise<VehicleAuditResult> {
  const [folderEntries, registryRead] = await Promise.all([
    fs.readdir(VEHICLES_DIR, { withFileTypes: true }),
    readJson(REGISTRY_PATH),
  ])

  const folders = folderEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  const registry = Array.isArray(registryRead.data)
    ? (registryRead.data as RegistryEntry[])
    : []

  const registryById = new Map(
    registry
      .filter((entry) => typeof entry.id === 'string')
      .map((entry) => [entry.id as string, entry])
  )

  const coreBrands = new Map<string, number>()
  const registryBrands = new Map<string, number>()
  const issueCounts = new Map<string, number>()
  const rows: VehicleAuditRow[] = []

  for (const entry of registry) {
    addCount(registryBrands, entry.brand)
  }

  for (const id of folders) {
    const vehiclePath = path.join(VEHICLES_DIR, id)
    const issues: string[] = []
    const missingModules: string[] = []
    const invalidModules: string[] = []
    const modules: Partial<Record<RequiredModule, JsonRecord>> = {}

    await Promise.all(
      REQUIRED_MODULES.map(async (moduleName) => {
        const filePath = path.join(vehiclePath, moduleName)

        try {
          await fs.access(filePath)
        } catch {
          missingModules.push(moduleName)
          issues.push(`missing ${moduleName}`)
          return
        }

        const read = await readJson(filePath)
        const record = asRecord(read.data)

        if (!record) {
          invalidModules.push(moduleName)
          issues.push(`invalid ${moduleName}`)
          return
        }

        modules[moduleName] = record
      })
    )

    const core = modules['core.json']
    const pricing = modules['pricing.json']
    const efficiency = modules['efficiency.json']
    const charging = modules['charging.json']
    const battery = modules['battery.json']
    const dimensions = modules['dimensions.json']
    const registryEntry = registryById.get(id)

    const coreId = getString(core?.id)
    const brand = getString(core?.brand) ?? registryEntry?.brand ?? 'Unknown'
    const model = getString(core?.model) ?? registryEntry?.model ?? 'Unknown'
    const variant = getString(core?.variant) ?? registryEntry?.variant ?? ''

    addCount(coreBrands, getString(core?.brand))

    const hasRequiredCore = Boolean(coreId && getString(core?.brand) && getString(core?.model))
    const hasCompleteModules = missingModules.length === 0 && invalidModules.length === 0
    const hasRegistryEntry = Boolean(registryEntry)
    const hasLegacyNewPricing = getNestedNumber(pricing, ['pt', 'consumerPrice', 'min']) != null
    const hasLegacyUsedPricing = getNestedNumber(pricing, ['pt', 'usedPrice', 'min']) != null
    const pricingOffers = getPricingOffers(pricing)
    const hasOffersPricing = pricingOffers.length > 0
    const hasNewPricing =
      getNestedNumber(pricing, ['pt', 'new', 'priceFrom']) != null ||
      hasOffer(pricingOffers, (offer) => getString(offer.condition) === 'new')
    const hasUsedPricing =
      getNestedNumber(pricing, ['pt', 'used', 'priceFrom']) != null ||
      hasOffer(pricingOffers, (offer) =>
        getString(offer.condition) === 'used' &&
        getString(offer.marketScope) !== 'imported_to_pt'
      )
    const hasImportedUsedPricing =
      getNestedNumber(pricing, ['pt', 'importedUsed', 'priceFrom']) != null ||
      hasOffer(pricingOffers, (offer) => getString(offer.marketScope) === 'imported_to_pt')
    const hasStructuredPricing =
      hasOffersPricing || hasNewPricing || hasUsedPricing || hasImportedUsedPricing
    const hasPricing = hasStructuredPricing || hasLegacyNewPricing || hasLegacyUsedPricing
    const pricingSchema: VehicleAuditRow['pricingSchema'] =
      hasOffersPricing
        ? 'offers'
        : hasStructuredPricing
          ? 'structured_pt'
          : hasLegacyNewPricing || hasLegacyUsedPricing
            ? 'legacy'
            : 'missing'
    const hasPricingUpdatedAt =
      getNestedString(pricing, ['lastReviewedAt']) != null ||
      pricingOffers.some((offer) =>
        getString(offer.priceDate) != null || getString(offer.updatedAt) != null
      ) ||
      getNestedString(pricing, ['pt', 'updatedAt']) != null ||
      getNestedString(pricing, ['pt', 'new', 'updatedAt']) != null ||
      getNestedString(pricing, ['pt', 'used', 'updatedAt']) != null ||
      getNestedString(pricing, ['pt', 'importedUsed', 'updatedAt']) != null
    const hasPricingSource =
      pricingOffers.some((offer) => getString(offer.sourceType) != null) ||
      getNestedString(pricing, ['pt', 'new', 'sourceType']) != null ||
      getNestedString(pricing, ['pt', 'used', 'sourceType']) != null ||
      getNestedString(pricing, ['pt', 'importedUsed', 'sourceType']) != null
    const hasPricingSourceUrl =
      hasOfferString(pricingOffers, 'sourceUrl') ||
      getNestedString(pricing, ['pt', 'new', 'sourceUrl']) != null ||
      getNestedString(pricing, ['pt', 'used', 'sourceUrl']) != null ||
      getNestedString(pricing, ['pt', 'importedUsed', 'sourceUrl']) != null
    const hasPricingYearContext =
      pricingOffers.some((offer) =>
        getNestedNumber(offer, ['modelYear']) != null ||
        getNestedNumber(offer, ['yearFrom']) != null ||
        getString(offer.priceDate) != null
      ) ||
      getNestedNumber(pricing, ['pt', 'new', 'modelYear']) != null ||
      getNestedNumber(pricing, ['pt', 'used', 'yearFrom']) != null ||
      getNestedNumber(pricing, ['pt', 'importedUsed', 'yearFrom']) != null
    const hasLowConfidencePricing =
      hasLowConfidenceOffer(pricingOffers) ||
      getNestedString(pricing, ['pt', 'confidence']) === 'low' ||
      getNestedString(pricing, ['pt', 'confidence']) === 'unknown' ||
      getNestedString(pricing, ['pt', 'new', 'confidence']) === 'low' ||
      getNestedString(pricing, ['pt', 'used', 'confidence']) === 'low' ||
      getNestedString(pricing, ['pt', 'importedUsed', 'confidence']) === 'low'
    const hasRange =
      getNestedNumber(efficiency, ['wltpRangeKm']) != null ||
      getNestedNumber(efficiency, ['estimatedRealRangeKm']) != null
    const hasCharging = getNestedNumber(charging, ['dcMaxChargeKW']) != null
    const hasBattery = getNestedNumber(battery, ['batteryUsableKWh']) != null
    const hasDimensions =
      getNestedNumber(dimensions, ['lengthMM']) != null ||
      getNestedNumber(dimensions, ['cargoLitersSeatsUp']) != null
    const hasImage = await localImageExists(getString(core?.image))
    const missingLocalization = getMissingLocalization(core)
    const hasCompleteLocalization = missingLocalization.length === 0
    const structuralIssues = hasCompleteModules
      ? validateVehicleFiles(id, {
          core: core ?? {},
          battery: battery ?? {},
          charging: charging ?? {},
          comfort: modules['comfort.json'] ?? {},
          dimensions: dimensions ?? {},
          efficiency: efficiency ?? {},
          pricing: pricing ?? {},
        } satisfies VehicleFiles)
      : []
    const structuralErrorCount = structuralIssues.filter(
      (issue) => issue.severity === 'error'
    ).length
    const structuralWarningCount = structuralIssues.length - structuralErrorCount

    if (!hasRequiredCore) {
      issues.push('missing required core id/brand/model')
    } else if (coreId !== id) {
      issues.push(`core.id mismatch (${coreId})`)
    }

    if (!hasRegistryEntry) issues.push('not in registry')
    const pricingTags: string[] = []

    if (hasLegacyNewPricing || hasLegacyUsedPricing) pricingTags.push('legacy pricing format')
    if (!hasStructuredPricing) pricingTags.push('add pricing.offers[]')
    if (!hasNewPricing) pricingTags.push('add new price if sold new')
    if (!hasUsedPricing) pricingTags.push('add used PT market price if relevant')
    if (!hasImportedUsedPricing) pricingTags.push('add imported used price if relevant')
    if (!hasPricingUpdatedAt) pricingTags.push('add pricing updatedAt')
    if (!hasPricingSource) pricingTags.push('add pricing sourceType/sourceLabel')
    if (!hasPricingSourceUrl) pricingTags.push('add sourceUrl when available')
    if (!hasPricingYearContext) pricingTags.push('add modelYear/yearFrom/yearTo for price')
    if (hasLowConfidencePricing) pricingTags.push('review low-confidence pricing')
    if (
      hasImportedUsedPricing &&
      !hasOffersPricing &&
      getNestedBoolean(pricing, ['pt', 'importedUsed', 'estimatedPortugalCostsIncluded']) == null
    ) {
      pricingTags.push('state if imported used PT costs are included')
    }

    if (!hasPricing) issues.push('missing pricing')
    if (!hasStructuredPricing) issues.push('pricing uses old or missing structured offers')
    if (!hasPricingUpdatedAt) issues.push('missing pricing updatedAt')
    if (!hasPricingSource) issues.push('missing pricing source')
    if (!hasPricingSourceUrl) issues.push('missing pricing sourceUrl')
    if (!hasPricingYearContext) issues.push('missing pricing year context')
    if (hasLowConfidencePricing) issues.push('low-confidence pricing')
    if (!hasImage) issues.push('missing local image')
    if (!hasCompleteLocalization) issues.push('missing localization')
    if (structuralErrorCount > 0) issues.push(`${structuralErrorCount} structural data errors`)

    const publicIssues: string[] = []
    if (!hasRequiredCore) publicIssues.push('core id/brand/model')
    if (!hasCompleteModules) publicIssues.push('all module files')
    if (!hasRegistryEntry) publicIssues.push('registry entry')
    if (!hasPricing) publicIssues.push('public price')
    if (!hasRange) publicIssues.push('range')
    if (!hasCharging) publicIssues.push('DC charging')
    if (!hasBattery) publicIssues.push('battery')
    if (!hasImage) publicIssues.push('real image')

    const verificationIssues: string[] = []
    if (!hasStructuredPricing) verificationIssues.push('target pricing schema')
    if (pricingSchema !== 'offers') verificationIssues.push('pricing.offers[] migration')
    if (!hasPricingUpdatedAt) verificationIssues.push('pricing date')
    if (!hasPricingSource) verificationIssues.push('pricing source')
    if (!hasPricingSourceUrl) verificationIssues.push('source URL')
    if (!hasPricingYearContext) verificationIssues.push('price year context')
    if (hasLowConfidencePricing) verificationIssues.push('low-confidence pricing')
    if (!hasCompleteLocalization) verificationIssues.push('localized names/search aliases')

    const publicStatus = publicIssues.length === 0 ? 'ready' : 'incomplete'
    const verificationStatus =
      publicStatus === 'ready' && verificationIssues.length === 0
        ? 'verified'
        : 'needs_review'

    for (const issue of new Set(issues.map(issueKey))) {
      addCount(issueCounts, issue)
    }

    const status = verificationStatus === 'verified' ? 'ok' : 'needs_fix'

    rows.push({
      id,
      registryId: registryEntry?.id,
      brand,
      model,
      variant,
      status,
      publicStatus,
      verificationStatus,
      completeness: calculateCompleteness({
        hasRequiredCore,
        hasCompleteModules,
        hasPricing,
        hasRange,
        hasCharging,
        hasBattery,
        hasDimensions,
        hasImage,
      }),
      issueCount: issues.length,
      issues,
      structuralIssues,
      structuralErrorCount,
      structuralWarningCount,
      publicIssues,
      verificationIssues,
      missingModules: missingModules.sort(),
      invalidModules: invalidModules.sort(),
      hasRequiredCore,
      hasCompleteModules,
      hasRegistryEntry,
      hasPricing,
      hasStructuredPricing,
      hasNewPricing,
      hasUsedPricing,
      hasImportedUsedPricing,
      hasPricingUpdatedAt,
      hasPricingSource,
      hasPricingSourceUrl,
      hasPricingYearContext,
      hasLowConfidencePricing,
      pricingSchema,
      pricingTags,
      hasImage,
      hasRange,
      hasCharging,
      hasBattery,
      hasDimensions,
      hasCompleteLocalization,
      missingLocalization,
    })
  }

  const folderIds = new Set(folders)
  const registryWithoutFolder = Array.from(registryById.keys())
    .filter((id) => !folderIds.has(id))
    .sort()

  return {
    rows,
    stats: {
      totalFolders: folders.length,
      registryEntries: registryById.size,
      ok: rows.filter((row) => row.status === 'ok').length,
      needsFix: rows.filter((row) => row.status === 'needs_fix').length,
      publicReady: rows.filter((row) => row.publicStatus === 'ready').length,
      publicIncomplete: rows.filter((row) => row.publicStatus === 'incomplete').length,
      verified: rows.filter((row) => row.verificationStatus === 'verified').length,
      needsReview: rows.filter((row) => row.verificationStatus === 'needs_review').length,
      loadableCore: rows.filter((row) => row.hasRequiredCore).length,
      completeModules: rows.filter((row) => row.hasCompleteModules).length,
      invalidJsonVehicles: rows.filter((row) => row.invalidModules.length > 0).length,
      missingRequiredCore: rows.filter((row) => !row.hasRequiredCore).length,
      idMismatch: rows.filter((row) =>
        row.issues.some((issue) => issue.startsWith('core.id mismatch'))
      ).length,
      missingAnyModule: rows.filter((row) => row.missingModules.length > 0).length,
      missingImage: rows.filter((row) => !row.hasImage).length,
      missingPricing: rows.filter((row) => !row.hasPricing).length,
      legacyPricing: rows.filter((row) => !row.hasStructuredPricing && row.hasPricing).length,
      offersPricing: rows.filter((row) => row.pricingSchema === 'offers').length,
      missingStructuredNewPricing: rows.filter((row) => !row.hasNewPricing).length,
      missingPricingUpdatedAt: rows.filter((row) => !row.hasPricingUpdatedAt).length,
      missingPricingSource: rows.filter((row) => !row.hasPricingSource).length,
      missingPricingSourceUrl: rows.filter((row) => !row.hasPricingSourceUrl).length,
      missingPricingYearContext: rows.filter((row) => !row.hasPricingYearContext).length,
      lowConfidencePricing: rows.filter((row) => row.hasLowConfidencePricing).length,
      structuralErrorVehicles: rows.filter((row) => row.structuralErrorCount > 0).length,
      structuralWarningVehicles: rows.filter((row) => row.structuralWarningCount > 0).length,
      structuralErrors: rows.reduce((sum, row) => sum + row.structuralErrorCount, 0),
      structuralWarnings: rows.reduce((sum, row) => sum + row.structuralWarningCount, 0),
      missingLocalization: rows.filter((row) => !row.hasCompleteLocalization).length,
      notInRegistry: rows.filter((row) => !row.hasRegistryEntry).length,
      brandCountFromCore: coreBrands.size,
      brandCountFromRegistry: registryBrands.size,
    },
    brandsFromCore: mapToSortedList(coreBrands),
    brandsFromRegistry: mapToSortedList(registryBrands),
    issueBuckets: Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt'))
      .map(([issue, count]) => ({ issue, count })),
    registryWithoutFolder,
  }
}
