import assert from 'node:assert/strict'
import { prepareCatalog } from './catalog-data.mjs'
import { catalogRpc } from './catalog-client.mjs'
try {
  const expected = await prepareCatalog()
  const actual = await catalogRpc('catalog_read', {p_id:null})
  for (const record of expected) {
    const found=actual.find(row=>row.id===record.id)
    assert.ok(found,`Missing vehicle: ${record.id}`)
    assert.deepEqual(found.files, record.files,`Catalog mismatch: ${record.id}`)
  }
  assert.equal(actual.length,expected.length)
  console.log(`Verified all ${actual.length} remote versions against canonical local data.`)
} catch(error) { console.error(error.message); process.exitCode=1 }
