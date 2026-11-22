import fs from 'node:fs/promises'
import path from 'node:path'
import { canonicalFiles } from '../lib/catalog/normalize.mjs'
import assert from 'node:assert/strict'
import { prepareCatalog } from './catalog-data.mjs'
import { catalogRpc } from './catalog-client.mjs'
try {
  const expected = await prepareCatalog()
  const updatesDir = path.join(process.cwd(), 'data/catalog-updates')
  const updateFiles = await fs.readdir(updatesDir).catch(error => {
    if (error.code === 'ENOENT') return []
    throw error
  })
  for (const filename of updateFiles.filter(name => name.endsWith('.json')).sort()) {
    const update = JSON.parse(await fs.readFile(path.join(updatesDir, filename), 'utf8'))
    for (const record of update.records) {
      assert.ok(!expected.some(row => row.id === record.id), `Duplicate local catalog ID: ${record.id}`)
      expected.push({ id: record.id, files: canonicalFiles(record.files) })
    }
  }
  const actual = await catalogRpc('catalog_read', {p_id:null})
  for (const record of expected) {
    const found=actual.find(row=>row.id===record.id)
    assert.ok(found,`Missing vehicle: ${record.id}`)
    assert.deepEqual(found.files, record.files,`Catalog mismatch: ${record.id}`)
  }
  assert.equal(actual.length,expected.length)
  console.log(`Verified all ${actual.length} remote versions against canonical local data.`)
} catch(error) { console.error(error.message); process.exitCode=1 }
