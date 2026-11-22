import { afterEach, describe, expect, it, vi } from 'vitest'
import { catalogConfig, catalogRpc } from '../scripts/catalog-client.mjs'
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals()})
describe('catalog transport',()=>{
  it('requires an explicit valid source and never falls back on bad configuration',()=>{
    expect(catalogConfig({})).toBe('json')
    expect(catalogConfig({VEHICLE_DATA_SOURCE:'supabase'})).toBe('supabase')
    expect(()=>catalogConfig({VEHICLE_DATA_SOURCE:'supabse'})).toThrow()
  })
  it('uses the publishable key for reads and secret only for writes',async()=>{
    vi.stubEnv('SUPABASE_URL','https://example.supabase.co')
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY','sb_publishable_test')
    vi.stubEnv('SUPABASE_SECRET_KEY','sb_secret_test')
    const fetch=vi.fn().mockResolvedValue({ok:true,json:async()=>[]})
    vi.stubGlobal('fetch',fetch)
    await catalogRpc('catalog_read',{p_id:null})
    expect(fetch.mock.calls[0][1].headers.apikey).toBe('sb_publishable_test')
    expect(fetch.mock.calls[0][1].cache).toBe('no-store')
    await catalogRpc('catalog_save',{}, {write:true})
    expect(fetch.mock.calls[1][1].headers.apikey).toBe('sb_secret_test')
  })
  it('refuses writes without the private key before making any network request',async()=>{
    vi.stubEnv('SUPABASE_URL','https://example.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY','')
    const fetch=vi.fn();vi.stubGlobal('fetch',fetch)
    await expect(catalogRpc('catalog_save',{}, {write:true})).rejects.toThrow('write configuration')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('propagates revision conflicts without exposing server response details',async()=>{
    vi.stubEnv('SUPABASE_URL','https://example.supabase.co')
    vi.stubEnv('SUPABASE_SECRET_KEY','sb_secret_test')
    vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:409,json:async()=>({code:'PT409',message:'private server detail'})}))
    await expect(catalogRpc('catalog_save',{}, {write:true})).rejects.toMatchObject({code:'PT409',message:'Vehicle changed; reload before saving.'})
  })
})
