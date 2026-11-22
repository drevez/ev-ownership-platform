import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { prepareCatalog } from '../scripts/catalog-data.mjs'
import { modelSlug } from '../lib/catalog/normalize.mjs'
import { toModelSlug } from '../lib/models'

const seedPath = 'supabase/seeds/20261122_model_families.sql'

async function database() {
  const db = new PGlite()
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;')
  for (const migration of (await fs.readdir('supabase/migrations')).filter(name => name.endsWith('.sql')).sort()) {
    await db.exec(await fs.readFile(`supabase/migrations/${migration}`, 'utf8'))
  }
  return db
}

describe('model family seed', () => {
  it('keeps Plus models distinct and preserves every existing public model URL', async () => {
    expect(modelSlug('XPeng', 'P7+')).toBe('xpeng-p7-plus')
    expect(toModelSlug('XPeng', 'P7+')).toBe('xpeng-p7-plus')
    expect(toModelSlug('Toyota', 'C-HR+')).toBe('toyota-c-hr-plus')
    const research = JSON.parse(await fs.readFile('data/internal/model-expansion-research-2026-11-22.json', 'utf8'))
    for (const model of research.currentCatalog) {
      expect(toModelSlug(model.brand, model.model)).toBe(model.slug)
    }
  })

  it('creates families idempotently without publishing variants or changing existing catalog data', async () => {
    const db = await database()
    try {
      const existing = (await prepareCatalog()).find(record => record.id === 'xpeng-p7-long-range-rwd')
      if (!existing) throw new Error('Missing existing P7 fixture')
      await db.query('select public.catalog_save($1,$2,$3::jsonb,$4,null,$5,null)', [
        existing.id, existing.modelSlug, JSON.stringify(existing.files), 'test', 'import',
      ])
      const before = await db.query('select public.catalog_read() as catalog')
      const seed = await fs.readFile(seedPath, 'utf8')
      await db.exec(seed)
      await db.exec(seed)
      expect(await db.query('select public.catalog_read() as catalog')).toEqual(before)
      const counts = await db.query<{ models: number; variants: number }>(
        'select (select count(*)::int from public.vehicle_models) as models, (select count(*)::int from public.vehicle_variants) as variants'
      )
      expect(counts.rows[0]).toEqual({ models: 131, variants: 1 })
    } finally {
      await db.close()
    }
  }, 30000)

  it('rejects an identity collision before inserting any of the batch', async () => {
    const db = await database()
    try {
      await db.query('insert into public.vehicle_models(slug,brand,name) values($1,$2,$3)', [
        'renault-kangoo-e-tech-electric', 'Renault', 'Edited model identity',
      ])
      await expect(db.exec(await fs.readFile(seedPath, 'utf8'))).rejects.toThrow('Model identity collision')
      await db.exec('rollback')
      expect((await db.query('select slug,brand,name from public.vehicle_models')).rows).toEqual([
        { slug: 'renault-kangoo-e-tech-electric', brand: 'Renault', name: 'Edited model identity' },
      ])
    } finally {
      await db.close()
    }
  }, 30000)
})
