import { prepareCatalog } from './catalog-data.mjs'
import { catalogRpc } from './catalog-client.mjs'

try {
  const records = await prepareCatalog()
  if (!process.argv.includes('--apply')) {
    console.log(`Dry run: ${records.length} versions, ${new Set(records.map(r=>r.modelSlug)).size} models, ${records.reduce((n,r)=>n+r.files.pricing.offers.length,0)} offers. No remote writes. Use --apply to import.`)
  } else {
    for (const record of records) {
      await catalogRpc('catalog_save', {
        p_id: record.id, p_model_slug: record.modelSlug, p_files: record.files,
        p_actor: 'json-import', p_mode: 'import', p_original: record.original,
      }, { write: true })
    }
    console.log(`Imported ${records.length} versions. Existing different versions are never overwritten.`)
  }
} catch (error) { console.error(error.message); process.exitCode = 1 }
