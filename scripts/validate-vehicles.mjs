import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const vehiclesDir = path.join(root, 'public', 'data', 'vehicles')
const registryPath = path.join(root, 'data', 'registry', 'vehicles.json')
const requiredModules = [
  'battery.json',
  'charging.json',
  'comfort.json',
  'core.json',
  'dimensions.json',
  'efficiency.json',
  'pricing.json',
]

const knownKeys = {
  'battery.json': new Set([
    'batteryChemistry',
    'batteryGrossKWh',
    'batteryUsableKWh',
    'voltageArchitecture',
  ]),
  'charging.json': new Set([
    'dcMaxChargeKW',
    'acMaxChargeKW',
    'charge10to80Min',
    'chargePer10MinKm',
    'plugAndChargeSupport',
    'teslaSuperchargerAccess',
    'chargingCurveId',
  ]),
  'comfort.json': new Set([
    'heatPumpAvailable',
    'vehicleToLoad',
    'vehicleToGrid',
    'panoramicRoof',
    'softwareExperienceLevel',
    'maintenanceLevel',
    'insuranceLevel',
  ]),
  'core.json': new Set([
    'id',
    'brand',
    'model',
    'variant',
    'modelYear',
    'segment',
    'bodyType',
    'drivetrain',
    'doors',
    'seats',
    'image',
    'heroImage',
    'localized',
  ]),
  'dimensions.json': new Set([
    'cargoLitersSeatsUp',
    'cargoLitersSeatsDown',
    'frunkLiters',
    'rearLegroomMM',
    'wheelbaseMM',
    'lengthMM',
    'widthMM',
    'heightMM',
  ]),
  'efficiency.json': new Set([
    'wltpRangeKm',
    'estimatedRealRangeKm',
    'motorwayRangeKm',
    'realWorldConsumptionWhKm',
    'realMotorwayConsumptionWhKm',
  ]),
  'pricing.json': new Set(['pt', 'market', 'currency', 'lastReviewedAt', 'offers']),
}

const warnings = []
const errors = []

function addWarning(id, message) {
  warnings.push(`${id}: ${message}`)
}

function addError(id, message) {
  errors.push(`${id}: ${message}`)
}

function readJson(filePath, id) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    addError(id, `invalid JSON in ${path.relative(root, filePath)} (${error.message})`)
    return null
  }
}

function isNumberOrNull(value) {
  return typeof value === 'number' || value === null || value === undefined
}

function validateKnownKeys(id, moduleName, data) {
  const allowed = knownKeys[moduleName]
  if (!allowed || !data || Array.isArray(data)) return

  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) {
      addWarning(id, `${moduleName} has unknown key "${key}"`)
    }
  }
}

function validateImagePath(id, image) {
  if (typeof image !== 'string' || image.length === 0) {
    addWarning(id, 'core.json has no image; app will use placeholder')
    return
  }

  if (!image.startsWith('/')) return

  const cleanImage = image.split(/[?#]/)[0]
  const imagePath = path.join(root, 'public', cleanImage)

  if (!fs.existsSync(imagePath)) {
    addWarning(id, `image ${image} is missing; app will use placeholder`)
  }
}

function validateCore(id, core) {
  if (!core) return

  for (const key of ['id', 'brand', 'model']) {
    if (typeof core[key] !== 'string' || core[key].trim() === '') {
      addError(id, `core.json missing required string "${key}"`)
    }
  }

  if (core.id && core.id !== id) {
    addError(id, `folder id does not match core.json id "${core.id}"`)
  }

  validateImagePath(id, core.image)
}

function validateDimensions(id, dimensions) {
  if (!dimensions) return

  for (const key of [
    'cargoLitersSeatsUp',
    'cargoLitersSeatsDown',
    'frunkLiters',
    'rearLegroomMM',
    'wheelbaseMM',
    'lengthMM',
    'widthMM',
    'heightMM',
  ]) {
    if (!isNumberOrNull(dimensions[key])) {
      addWarning(id, `dimensions.json "${key}" should be a number, null, or omitted`)
    }
  }
}

function validatePricing(id, pricing) {
  if (Array.isArray(pricing?.offers)) {
    if (pricing.market && typeof pricing.market !== 'string') {
      addWarning(id, 'pricing.market should be a string')
    }

    if (pricing.currency && typeof pricing.currency !== 'string') {
      addWarning(id, 'pricing.currency should be a string')
    }

    if (pricing.lastReviewedAt && typeof pricing.lastReviewedAt !== 'string') {
      addWarning(id, 'pricing.lastReviewedAt should be a string')
    }

    pricing.offers.forEach((offer, index) => {
      const prefix = `pricing.offers[${index}]`

      if (!offer || typeof offer !== 'object' || Array.isArray(offer)) {
        addWarning(id, `${prefix} should be an object`)
        return
      }

      for (const key of ['condition', 'status', 'marketScope', 'sourceType', 'confidence']) {
        if (typeof offer[key] !== 'string' || offer[key].trim() === '') {
          addWarning(id, `${prefix}.${key} should be a non-empty string`)
        }
      }

      for (const key of ['priceFrom', 'priceTo', 'modelYear', 'yearFrom', 'yearTo', 'displayPriority']) {
        if (!isNumberOrNull(offer[key])) {
          addWarning(id, `${prefix}.${key} should be a number, null, or omitted`)
        }
      }

      if (offer.price && typeof offer.price === 'object' && !Array.isArray(offer.price)) {
        for (const key of ['min', 'max']) {
          if (!isNumberOrNull(offer.price[key])) {
            addWarning(id, `${prefix}.price.${key} should be a number, null, or omitted`)
          }
        }
      }

      if (offer.priceDate && typeof offer.priceDate !== 'string') {
        addWarning(id, `${prefix}.priceDate should be a string`)
      }
    })

    return
  }

  const pt = pricing?.pt
  if (!pt) {
    addWarning(id, 'pricing.json missing pt market block')
    return
  }

  if (pt.currency && typeof pt.currency !== 'string') {
    addWarning(id, 'pricing.pt.currency should be a string')
  }

  for (const priceKey of ['consumerPrice', 'businessPriceExVat', 'usedPrice']) {
    const priceRange = pt[priceKey]
    if (!priceRange) continue

    for (const key of ['min', 'max']) {
      if (!isNumberOrNull(priceRange[key])) {
        addWarning(id, `pricing.pt.${priceKey}.${key} should be a number, null, or omitted`)
      }
    }
  }
}

function loadRegistryIds() {
  if (!fs.existsSync(registryPath)) return new Set()

  const registry = readJson(registryPath, 'registry')
  if (!Array.isArray(registry)) {
    addError('registry', 'vehicles.json should be an array')
    return new Set()
  }

  return new Set(
    registry
      .map((entry) => entry?.id)
      .filter((id) => typeof id === 'string')
  )
}

const registryIds = loadRegistryIds()
const folderIds = fs
  .readdirSync(vehiclesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

for (const id of folderIds) {
  const vehiclePath = path.join(vehiclesDir, id)
  const modules = {}

  for (const moduleName of requiredModules) {
    const filePath = path.join(vehiclePath, moduleName)

    if (!fs.existsSync(filePath)) {
      addWarning(id, `missing ${moduleName}`)
      continue
    }

    const data = readJson(filePath, id)
    modules[moduleName] = data
    validateKnownKeys(id, moduleName, data)
  }

  validateCore(id, modules['core.json'])
  validateDimensions(id, modules['dimensions.json'])
  validatePricing(id, modules['pricing.json'])

  if (registryIds.size > 0 && !registryIds.has(id)) {
    addWarning(id, 'vehicle folder is not present in data/registry/vehicles.json')
  }
}

for (const id of registryIds) {
  if (!folderIds.includes(id)) {
    addWarning(id, 'registry entry has no matching vehicle folder')
  }
}

console.log(`Checked ${folderIds.length} vehicle folders.`)

if (errors.length > 0) {
  console.log(`\nErrors (${errors.length}):`)
  for (const error of errors) console.log(`- ${error}`)
}

if (warnings.length > 0) {
  console.log(`\nWarnings (${warnings.length}):`)
  for (const warning of warnings) console.log(`- ${warning}`)
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('No vehicle data issues found.')
} else {
  console.log('\nValidation is advisory for now; it reports issues but does not block builds.')
}
