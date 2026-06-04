import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const vehiclesDir = path.join(root, 'public', 'data', 'vehicles')
const registryPath = path.join(root, 'data', 'registry', 'vehicles.json')

console.log('Generating vehicle registry...')

try {
  if (!fs.existsSync(vehiclesDir)) {
    console.error(`Error: Vehicles directory does not exist at ${vehiclesDir}`)
    process.exit(1)
  }

  const folders = fs
    .readdirSync(vehiclesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  const entries = []

  for (const id of folders) {
    const corePath = path.join(vehiclesDir, id, 'core.json')

    if (!fs.existsSync(corePath)) {
      console.warn(`Warning: Missing core.json in folder ${id}, skipping.`)
      continue
    }

    try {
      const coreContent = fs.readFileSync(corePath, 'utf8')
      const core = JSON.parse(coreContent)

      if (core.id !== id) {
        console.warn(`Warning: Folder name "${id}" does not match core.json id "${core.id}".`)
      }

      entries.push({
        id: core.id || id,
        brand: core.brand || 'Unknown',
        model: core.model || 'Unknown',
        variant: core.variant || '',
        segment: core.segment || '',
        bodyType: core.bodyType || '',
        drivetrain: core.drivetrain || '',
        heroImage: core.heroImage || core.image || '/images/vehicle-placeholder.svg',
      })
    } catch (err) {
      console.error(`Error parsing core.json in folder ${id}:`, err.message)
    }
  }

  // Sort entries by Brand, then Model, then Variant
  entries.sort((a, b) => {
    const brandCompare = a.brand.localeCompare(b.brand)
    if (brandCompare !== 0) return brandCompare

    const modelCompare = a.model.localeCompare(b.model)
    if (modelCompare !== 0) return modelCompare

    return a.variant.localeCompare(b.variant)
  })

  // Ensure output directory exists
  const registryDir = path.dirname(registryPath)
  if (!fs.existsSync(registryDir)) {
    fs.mkdirSync(registryDir, { recursive: true })
  }

  fs.writeFileSync(registryPath, JSON.stringify(entries, null, 2), 'utf8')
  console.log(`Success! Registered ${entries.length} vehicles in ${registryPath}`)
} catch (err) {
  console.error('Failed to generate registry:', err.message)
  process.exit(1)
}
