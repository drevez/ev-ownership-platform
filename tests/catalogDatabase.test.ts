import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs/promises'
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { prepareCatalog } from '../scripts/catalog-data.mjs'

const db = new PGlite()
let seed: Awaited<ReturnType<typeof prepareCatalog>>
async function save(record: Awaited<ReturnType<typeof prepareCatalog>>[number], mode='import', revision: number|null=null) {
  return db.query<{ revision:number }>('select public.catalog_save($1,$2,$3::jsonb,$4,$5,$6,$7::jsonb) as revision',
    [record.id,record.modelSlug,JSON.stringify(record.files),'test',revision,mode,JSON.stringify(record.original)])
}
beforeAll(async () => {
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;')
  for (const migration of (await fs.readdir('supabase/migrations')).filter(name=>name.endsWith('.sql')).sort()) {
    await db.exec(await fs.readFile(`supabase/migrations/${migration}`,'utf8'))
  }
  seed = await prepareCatalog()
  for (const record of seed) await save(record)
},30000)
afterAll(async()=>{ await db.close() })

describe('PostgreSQL catalog', () => {
  it('round-trips all 82 versions and 131 offers without loss of canonical data', async()=>{
    const result = await db.query<{catalog: Array<{id:string;files:unknown}> }>('select public.catalog_read() as catalog')
    const records = result.rows[0].catalog
    expect(records).toHaveLength(seed.length)
    for (const original of seed) expect(records.find(r=>r.id===original.id)?.files,original.id).toEqual(original.files)
    expect((await db.query<{count:number}>('select count(*)::int as count from public.vehicle_offers')).rows[0].count).toBe(seed.reduce((count,record)=>count+record.files.pricing.offers.length,0))
  })
  it('is repeatable and refuses to overwrite edited records on reimport', async()=>{
    await save(seed[0]); await save(seed[0])
    expect((await db.query<{count:number}>('select count(*)::int as count from public.vehicle_revisions')).rows[0].count).toBe(seed.length)
    const changed=structuredClone(seed[0]); changed.files.core.variant='changed'
    await expect(save(changed)).rejects.toThrow('refusing overwrite')
  })
  it('rejects stale editors and records successful revisions', async()=>{
    const record=structuredClone(seed[1]); record.files.core.variant='edited'
    await save(record,'update',1)
    await expect(save(seed[1],'update',1)).rejects.toMatchObject({code:'PT409',message:'Vehicle changed; reload before saving'})
    const result=await db.query<{revision:number}>('select revision from public.vehicle_variants where id=$1',[record.id])
    expect(result.rows[0].revision).toBe(2)
  })
  it('rolls back the entire save when an offer is invalid',async()=>{
    const record=structuredClone(seed[2]); record.files.core.variant='must roll back'
    record.files.pricing.offers[0].priceFrom=-1
    await expect(save(record,'update',1)).rejects.toThrow()
    const result=await db.query<{catalog:Array<{files:unknown;revision:number}>}>('select public.catalog_read($1) as catalog',[record.id])
    expect(result.rows[0].catalog[0]).toMatchObject({files:seed[2].files,revision:1})
  })
  it('allows public reads but denies public writes, history and import archives',async()=>{
    await db.exec('set role anon')
    try {
      expect((await db.query<{catalog:unknown[]}>('select public.catalog_read() as catalog')).rows[0].catalog).toHaveLength(seed.length)
      await expect(db.query('select * from public.vehicle_revisions')).rejects.toThrow('permission denied')
      await expect(db.query('select * from public.vehicle_import_sources')).rejects.toThrow('permission denied')
      await expect(save(seed[3],'update',1)).rejects.toThrow('permission denied')
      await expect(db.query('delete from public.vehicle_offers')).rejects.toThrow('permission denied')
    } finally {await db.exec('reset role')}
  })
})
