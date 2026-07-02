import type { JsonObject } from '@/lib/loadVehicle'
import type { VehicleFiles, VehicleModuleName } from '@/lib/internalVehicleFiles'

export type VehicleDataIssueSeverity = 'error' | 'warning'

export interface VehicleDataIssue {
  severity: VehicleDataIssueSeverity
  code: string
  module: VehicleModuleName
  path: string
  message: string
}

const MODULE_KEYS: Record<VehicleModuleName, Set<string>> = {
  core: new Set([
    'id', 'brand', 'model', 'variant', 'modelYear', 'segment', 'bodyType',
    'drivetrain', 'doors', 'seats', 'image', 'heroImage', 'localized',
  ]),
  battery: new Set([
    'batteryChemistry', 'batteryGrossKWh', 'batteryUsableKWh', 'voltageArchitecture',
  ]),
  charging: new Set([
    'dcMaxChargeKW', 'acMaxChargeKW', 'charge10to80Min', 'chargePer10MinKm',
    'plugAndChargeSupport', 'teslaSuperchargerAccess', 'chargingCurveId',
  ]),
  comfort: new Set([
    'heatPumpAvailable', 'vehicleToLoad', 'vehicleToGrid', 'panoramicRoof',
    'softwareExperienceLevel', 'maintenanceLevel', 'insuranceLevel',
  ]),
  dimensions: new Set([
    'cargoLitersSeatsUp', 'cargoLitersSeatsDown', 'frunkLiters', 'rearLegroomMM',
    'wheelbaseMM', 'lengthMM', 'widthMM', 'heightMM',
  ]),
  efficiency: new Set([
    'wltpRangeKm', 'estimatedRealRangeKm', 'motorwayRangeKm',
    'realWorldConsumptionWhKm', 'realMotorwayConsumptionWhKm',
  ]),
  pricing: new Set(['pt', 'market', 'currency', 'lastReviewedAt', 'offers']),
}

const OFFER_ENUMS = {
  condition: new Set(['new', 'used']),
  status: new Set([
    'available', 'not_sold_new', 'not_enough_data', 'not_sold_in_pt', 'unknown',
  ]),
  marketScope: new Set([
    'official_pt', 'new_import', 'used_pt', 'imported_to_pt', 'unknown',
  ]),
  sourceType: new Set([
    'official_brand', 'dealer', 'classifieds', 'market_estimate', 'manual', 'unknown',
  ]),
  confidence: new Set(['high', 'medium', 'low', 'unknown']),
}

function issue(
  severity: VehicleDataIssueSeverity,
  code: string,
  module: VehicleModuleName,
  path: string,
  message: string
): VehicleDataIssue {
  return { severity, code, module, path, message }
}

function isRecord(value: unknown): value is JsonObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function validateKnownKeys(
  module: VehicleModuleName,
  data: JsonObject
): VehicleDataIssue[] {
  return Object.keys(data)
    .filter((key) => !MODULE_KEYS[module].has(key))
    .map((key) =>
      issue(
        'error',
        'unknown_module_field',
        module,
        `${module}.${key}`,
        `"${key}" does not belong in ${module}.json.`
      )
    )
}

function validateNumber(
  issues: VehicleDataIssue[],
  module: VehicleModuleName,
  data: JsonObject,
  key: string,
  min: number,
  max: number,
  options: { integer?: boolean; nullable?: boolean } = {}
) {
  const value = data[key]
  if (value === undefined) return
  if (value === null && options.nullable) return
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < min ||
    value > max ||
    (options.integer && !Number.isInteger(value))
  ) {
    issues.push(issue(
      'error',
      'invalid_number',
      module,
      `${module}.${key}`,
      `"${key}" must be ${options.integer ? 'an integer' : 'a number'} between ${min} and ${max}${options.nullable ? ', or null' : ''}.`
    ))
  }
}

function validateBoolean(
  issues: VehicleDataIssue[],
  module: VehicleModuleName,
  data: JsonObject,
  key: string
) {
  if (data[key] !== undefined && typeof data[key] !== 'boolean') {
    issues.push(issue(
      'error',
      'invalid_boolean',
      module,
      `${module}.${key}`,
      `"${key}" must be true or false.`
    ))
  }
}

function validateDate(
  issues: VehicleDataIssue[],
  module: VehicleModuleName,
  path: string,
  value: unknown
) {
  if (value === undefined || value === null) return
  if (typeof value !== 'string' || !/^\d{4}(?:-(?:0[1-9]|1[0-2]))?$/.test(value)) {
    issues.push(issue(
      'error',
      'invalid_date',
      module,
      path,
      'Use YYYY or YYYY-MM.'
    ))
  }
}

function validateCore(core: JsonObject, folderId: string) {
  const issues: VehicleDataIssue[] = []
  for (const key of ['id', 'brand', 'model']) {
    if (typeof core[key] !== 'string' || !core[key].trim()) {
      issues.push(issue('error', 'required_field', 'core', `core.${key}`, `"${key}" is required.`))
    }
  }
  if (typeof core.id === 'string' && core.id !== folderId) {
    issues.push(issue(
      'error',
      'id_mismatch',
      'core',
      'core.id',
      `core.id "${core.id}" must match folder "${folderId}".`
    ))
  }
  if (typeof core.id === 'string' && !/^[a-z0-9][a-z0-9-]*$/.test(core.id)) {
    issues.push(issue(
      'error',
      'invalid_id',
      'core',
      'core.id',
      'Use lowercase letters, numbers, and hyphens only.'
    ))
  }
  validateNumber(issues, 'core', core, 'modelYear', 1990, 2100, { integer: true })
  validateNumber(issues, 'core', core, 'doors', 2, 6, { integer: true })
  validateNumber(issues, 'core', core, 'seats', 1, 9, { integer: true })
  return issues
}

function validatePricing(pricing: JsonObject) {
  const issues: VehicleDataIssue[] = []
  validateDate(issues, 'pricing', 'pricing.lastReviewedAt', pricing.lastReviewedAt)
  if (pricing.market !== undefined && typeof pricing.market !== 'string') {
    issues.push(issue('error', 'invalid_string', 'pricing', 'pricing.market', 'Market must be a string.'))
  }
  if (pricing.currency !== undefined && typeof pricing.currency !== 'string') {
    issues.push(issue('error', 'invalid_string', 'pricing', 'pricing.currency', 'Currency must be a string.'))
  }

  if (!Array.isArray(pricing.offers)) {
    issues.push(issue(
      'warning',
      'legacy_pricing',
      'pricing',
      'pricing.offers',
      'Migrate this file to pricing.offers[].'
    ))
    return issues
  }

  const priorities = new Set<number>()
  pricing.offers.forEach((value, index) => {
    const prefix = `pricing.offers[${index}]`
    if (!isRecord(value)) {
      issues.push(issue('error', 'invalid_offer', 'pricing', prefix, 'Offer must be an object.'))
      return
    }

    for (const [key, allowed] of Object.entries(OFFER_ENUMS)) {
      const field = value[key]
      if (typeof field !== 'string' || !allowed.has(field)) {
        issues.push(issue(
          'error',
          'invalid_offer_enum',
          'pricing',
          `${prefix}.${key}`,
          `"${key}" has an unsupported value.`
        ))
      }
    }

    for (const key of ['priceFrom', 'priceTo']) {
      const amount = value[key]
      if (amount !== undefined && amount !== null &&
          (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0)) {
        issues.push(issue(
          'error',
          'invalid_price',
          'pricing',
          `${prefix}.${key}`,
          'Prices must be positive numbers or null; never use 0 for unknown.'
        ))
      }
    }

    const priceFrom = typeof value.priceFrom === 'number' ? value.priceFrom : undefined
    const priceTo = typeof value.priceTo === 'number' ? value.priceTo : undefined
    if (priceFrom != null && priceTo != null && priceTo < priceFrom) {
      issues.push(issue(
        'error',
        'reversed_price_range',
        'pricing',
        prefix,
        'priceTo cannot be lower than priceFrom.'
      ))
    }

    for (const key of ['modelYear', 'yearFrom', 'yearTo']) {
      const year = value[key]
      if (year !== undefined && year !== null &&
          (typeof year !== 'number' || !Number.isInteger(year) || year < 1990 || year > 2100)) {
        issues.push(issue(
          'error',
          'invalid_year',
          'pricing',
          `${prefix}.${key}`,
          'Year must be an integer between 1990 and 2100.'
        ))
      }
    }

    if (
      typeof value.yearFrom === 'number' &&
      typeof value.yearTo === 'number' &&
      value.yearTo < value.yearFrom
    ) {
      issues.push(issue(
        'error',
        'reversed_year_range',
        'pricing',
        prefix,
        'yearTo cannot be earlier than yearFrom.'
      ))
    }

    validateDate(issues, 'pricing', `${prefix}.priceDate`, value.priceDate)

    if (value.displayPriority !== undefined) {
      if (
        typeof value.displayPriority !== 'number' ||
        !Number.isInteger(value.displayPriority) ||
        value.displayPriority < 1
      ) {
        issues.push(issue(
          'error',
          'invalid_priority',
          'pricing',
          `${prefix}.displayPriority`,
          'Display priority must be a positive integer.'
        ))
      } else if (priorities.has(value.displayPriority)) {
        issues.push(issue(
          'warning',
          'duplicate_priority',
          'pricing',
          `${prefix}.displayPriority`,
          'Display priorities should be unique.'
        ))
      } else {
        priorities.add(value.displayPriority)
      }
    }

    if (value.marketScope === 'imported_to_pt') {
      if (!Array.isArray(value.originMarkets) || value.originMarkets.length === 0) {
        issues.push(issue(
          'warning',
          'missing_origin_market',
          'pricing',
          `${prefix}.originMarkets`,
          'Imported offers should identify their origin market.'
        ))
      }
      if (typeof value.estimatedPortugalCostsIncluded !== 'boolean') {
        issues.push(issue(
          'warning',
          'missing_import_cost_context',
          'pricing',
          `${prefix}.estimatedPortugalCostsIncluded`,
          'State whether Portuguese import costs are included.'
        ))
      }
    }
  })

  return issues
}

export function validateVehicleFiles(
  folderId: string,
  files: VehicleFiles
): VehicleDataIssue[] {
  const issues = (Object.keys(files) as VehicleModuleName[])
    .flatMap((module) => validateKnownKeys(module, files[module]))

  issues.push(...validateCore(files.core, folderId))

  validateNumber(issues, 'battery', files.battery, 'batteryGrossKWh', 5, 250)
  validateNumber(issues, 'battery', files.battery, 'batteryUsableKWh', 5, 250)
  validateNumber(issues, 'battery', files.battery, 'voltageArchitecture', 100, 1200)
  if (
    typeof files.battery.batteryGrossKWh === 'number' &&
    typeof files.battery.batteryUsableKWh === 'number' &&
    files.battery.batteryUsableKWh > files.battery.batteryGrossKWh
  ) {
    issues.push(issue(
      'error',
      'usable_exceeds_gross',
      'battery',
      'battery.batteryUsableKWh',
      'Usable battery cannot exceed gross battery capacity.'
    ))
  }

  validateNumber(issues, 'charging', files.charging, 'dcMaxChargeKW', 10, 1000)
  validateNumber(issues, 'charging', files.charging, 'acMaxChargeKW', 1, 100)
  validateNumber(issues, 'charging', files.charging, 'charge10to80Min', 5, 180)
  validateNumber(issues, 'charging', files.charging, 'chargePer10MinKm', 1, 1000)
  for (const key of ['plugAndChargeSupport', 'teslaSuperchargerAccess']) {
    validateBoolean(issues, 'charging', files.charging, key)
  }

  for (const key of [
    'heatPumpAvailable', 'vehicleToLoad', 'vehicleToGrid', 'panoramicRoof',
  ]) {
    validateBoolean(issues, 'comfort', files.comfort, key)
  }
  for (const key of ['softwareExperienceLevel', 'maintenanceLevel', 'insuranceLevel']) {
    validateNumber(issues, 'comfort', files.comfort, key, 1, 10, { integer: true })
  }

  for (const key of [
    'cargoLitersSeatsUp', 'cargoLitersSeatsDown', 'frunkLiters', 'rearLegroomMM',
    'wheelbaseMM', 'lengthMM', 'widthMM', 'heightMM',
  ]) {
    validateNumber(issues, 'dimensions', files.dimensions, key, 0, 10000, { nullable: true })
  }

  validateNumber(issues, 'efficiency', files.efficiency, 'wltpRangeKm', 50, 1500)
  validateNumber(issues, 'efficiency', files.efficiency, 'estimatedRealRangeKm', 50, 1500)
  validateNumber(issues, 'efficiency', files.efficiency, 'motorwayRangeKm', 30, 1500)
  validateNumber(issues, 'efficiency', files.efficiency, 'realWorldConsumptionWhKm', 50, 600)
  validateNumber(issues, 'efficiency', files.efficiency, 'realMotorwayConsumptionWhKm', 50, 700)

  issues.push(...validatePricing(files.pricing))
  return issues
}
