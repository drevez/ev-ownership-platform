import fs from 'node:fs/promises'
import { validateVehicleFiles } from '../lib/vehicleDataValidation.ts'
import { canonicalFiles, modelSlug } from '../lib/catalog/normalize.mjs'
import { catalogRpc } from './catalog-client.mjs'

try {
  const filename = process.argv[2]
  if (!filename || filename.startsWith('--')) throw new Error('Provide a catalog update JSON file; add --apply for remote writes.')
  const update = JSON.parse(await fs.readFile(filename, 'utf8'))
  if (!Array.isArray(update.records) || !update.records.length) throw new Error('Update must contain records.')
  const ids = new Set()
  const records = update.records.map(record => {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(record.id) || ids.has(record.id)) throw new Error('Invalid or duplicate vehicle ID.')
    ids.add(record.id)
    const files = canonicalFiles(record.files)
    const errors = validateVehicleFiles(record.id, files).filter(issue => issue.severity === 'error')
    if (errors.length) throw new Error(`${record.id}: ${errors.map(issue => issue.message).join('; ')}`)
    return { id: record.id, files }
  })
  if (!process.argv.includes('--apply')) {
    console.log(`Validated ${records.length} additions. No remote writes. Use --apply to import.`)
  } else {
    // Inspect the entire batch first. Never overwrite an existing, edited version.
    const current = await catalogRpc('catalog_read', { p_id: null })
    const stable = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a],[b]) => a.localeCompare(b))) : item)
    for (const record of records) {
      const previous = current.find(row => row.id === record.id)
      if (previous && stable(previous.files) !== stable(record.files)) throw new Error(`${record.id} already exists with different data; update refused.`)
    }
    for (const { id, files } of records) await catalogRpc('catalog_save', {
      p_id: id, p_model_slug: modelSlug(files.core.brand, files.core.model), p_files: files,
      p_actor: `catalog-update:${update.reviewedAt}`, p_mode: 'import',
    }, { write: true })
    console.log(`Applied ${records.length} additions; identical entries are safely skipped.`)
  }
} catch (error) { console.error(error.message); process.exitCode = 1 }
