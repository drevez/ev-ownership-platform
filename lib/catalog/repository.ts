import { cache } from 'react'
import { catalogConfig, catalogRpc } from '@/scripts/catalog-client.mjs'
import { canonicalFiles, modelSlug, registryEntry } from './normalize.mjs'
import type { VehicleFiles, EditableRegistryEntry } from '@/lib/internalVehicleFiles'

export interface CatalogRecord { id: string; revision: number; files: VehicleFiles }
export function usesSupabase() { return catalogConfig() === 'supabase' }
// React memoization is request-scoped; no catalog data is shared indefinitely across requests.
export const readCatalog = cache(async (id?: string): Promise<CatalogRecord[]> => {
  return catalogRpc('catalog_read', { p_id: id ?? null })
})
export async function readCatalogRecord(id: string) {
  return (await readCatalog(id))[0] ?? null
}
export async function readCatalogRegistry(): Promise<EditableRegistryEntry[]> {
  return (await readCatalog()).map(({ files }) => registryEntry(files)) as EditableRegistryEntry[]
}
export async function saveCatalogRecord(id: string, files: VehicleFiles, options: {
  mode: 'create' | 'update'; revision?: number; actor: string
}): Promise<number> {
  const normalized = canonicalFiles(files)
  return catalogRpc('catalog_save', {
    p_id: id, p_model_slug: modelSlug(String(files.core.brand), String(files.core.model)),
    p_files: normalized, p_actor: options.actor,
    p_mode: options.mode, p_expected_revision: options.revision ?? null,
  }, { write: true })
}
