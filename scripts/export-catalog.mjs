import fs from 'node:fs/promises'
import path from 'node:path'
import { catalogRpc } from './catalog-client.mjs'
import { MODULE_NAMES, registryEntry } from '../lib/catalog/normalize.mjs'

try {
  const target = process.argv[2]
  if (!target) throw new Error('Provide a NEW destination directory (never export over the live catalog).')
  await fs.mkdir(target, { recursive: false })
  const records = await catalogRpc('catalog_read', { p_id: null })
  if (!records.length) throw new Error('Remote catalog is empty; export refused.')
  for (const { id, files } of records) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error('Unsafe remote vehicle ID')
    const dir = path.join(target, 'public/data/vehicles', id)
    await fs.mkdir(dir, { recursive: true })
    for (const name of MODULE_NAMES) await fs.writeFile(path.join(dir, `${name}.json`), `${JSON.stringify(files[name], null, 2)}\n`)
  }
  await fs.mkdir(path.join(target, 'data/registry'), { recursive: true })
  await fs.writeFile(path.join(target, 'data/registry/vehicles.json'), `${JSON.stringify(records.map(r=>registryEntry(r.files)), null, 2)}\n`)
  await fs.writeFile(path.join(target, 'catalog-snapshot.json'), `${JSON.stringify(records, null, 2)}\n`)
  console.log(`Exported ${records.length} versions to ${target}`)
} catch (error) { console.error(error.message); process.exitCode = 1 }
