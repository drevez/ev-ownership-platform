/** Supabase Data API. Server/scripts only: never import in client components. */
/** @param {Record<string, string | undefined>} [env] */
export function catalogConfig(env = process.env) {
  const source = env.VEHICLE_DATA_SOURCE ?? 'json'
  if (!['json', 'supabase'].includes(source)) throw new Error('VEHICLE_DATA_SOURCE must be json or supabase')
  return source
}
export async function catalogRpc(name, body, { write = false } = {}) {
  const url = process.env.SUPABASE_URL
  const key = write ? process.env.SUPABASE_SECRET_KEY : process.env.SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error(`Missing Supabase ${write ? 'write' : 'read'} configuration`)
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(20000),
    headers: { apikey: key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    const error = new Error(payload.code === 'PT409' ? 'Vehicle changed; reload before saving.' : `Catalog request failed (${response.status}; ${payload.code ?? 'unknown'})`)
    error.code = payload.code
    throw error
  }
  return response.json()
}
