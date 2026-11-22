import fs from 'node:fs/promises'
import path from 'node:path'
import { MODULE_NAMES, canonicalFiles, modelSlug } from '../lib/catalog/normalize.mjs'
export async function prepareCatalog(root = process.cwd()) {
  const dir = path.join(root, 'public/data/vehicles')
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return Promise.all(entries.filter(entry => entry.isDirectory()).sort((a,b) => a.name.localeCompare(b.name)).map(async entry => {
    const files = Object.fromEntries(await Promise.all(MODULE_NAMES.map(async name =>
      [name, JSON.parse(await fs.readFile(path.join(dir, entry.name, `${name}.json`), 'utf8'))]
    )))
    if (files.core.id !== entry.name) throw new Error(`ID mismatch: ${entry.name}`)
    return { id: entry.name, modelSlug: modelSlug(files.core.brand, files.core.model), original: files, files: canonicalFiles(files) }
  }))
}
