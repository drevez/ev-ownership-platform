import fs from 'fs/promises'
import path from 'path'

import type { JsonObject } from '@/lib/loadVehicle'

export const VEHICLE_MODULE_NAMES = [
  'core',
  'battery',
  'charging',
  'comfort',
  'dimensions',
  'efficiency',
  'pricing',
] as const

export type VehicleModuleName = (typeof VEHICLE_MODULE_NAMES)[number]
export type VehicleFiles = Record<VehicleModuleName, JsonObject>

export interface EditableRegistryEntry {
  id: string
  brand: string
  model: string
  variant: string
  segment: string
  bodyType: string
  drivetrain: string
  heroImage?: string
  image?: string
}

const VEHICLES_DIR = path.join(process.cwd(), 'public', 'data', 'vehicles')
const REGISTRY_PATH = path.join(process.cwd(), 'data', 'registry', 'vehicles.json')

function assertSafeVehicleId(id: string) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    throw new Error('Vehicle id must use lowercase letters, numbers, and hyphens only.')
  }
}

function modulePath(vehicleId: string, moduleName: VehicleModuleName) {
  assertSafeVehicleId(vehicleId)
  return path.join(VEHICLES_DIR, vehicleId, `${moduleName}.json`)
}

async function readJson<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content) as T
}

function stableJson(data: unknown) {
  return `${JSON.stringify(data, null, 2)}\n`
}

export async function vehicleFolderExists(vehicleId: string) {
  try {
    await fs.access(path.join(VEHICLES_DIR, vehicleId))
    return true
  } catch {
    return false
  }
}

export async function readVehicleFiles(vehicleId: string): Promise<VehicleFiles | null> {
  assertSafeVehicleId(vehicleId)

  if (!(await vehicleFolderExists(vehicleId))) return null

  const entries = await Promise.all(
    VEHICLE_MODULE_NAMES.map(async (moduleName) => {
      const data = await readJson<JsonObject>(modulePath(vehicleId, moduleName))
      return [moduleName, data] as const
    })
  )

  return Object.fromEntries(entries) as VehicleFiles
}

export async function writeVehicleFiles(vehicleId: string, files: VehicleFiles) {
  assertSafeVehicleId(vehicleId)
  await fs.mkdir(path.join(VEHICLES_DIR, vehicleId), { recursive: true })

  await Promise.all(
    VEHICLE_MODULE_NAMES.map((moduleName) =>
      fs.writeFile(modulePath(vehicleId, moduleName), stableJson(files[moduleName]), 'utf8')
    )
  )
}

export async function readRegistry(): Promise<EditableRegistryEntry[]> {
  try {
    const registry = await readJson<EditableRegistryEntry[]>(REGISTRY_PATH)
    return Array.isArray(registry) ? registry : []
  } catch {
    return []
  }
}

export async function findRegistryEntry(vehicleId: string) {
  const registry = await readRegistry()
  return registry.find((entry) => entry.id === vehicleId)
}

export async function upsertRegistryEntry(entry: EditableRegistryEntry) {
  const registry = await readRegistry()
  const next = [
    ...registry.filter((item) => item.id !== entry.id),
    entry,
  ].sort((a, b) => {
    const brand = a.brand.localeCompare(b.brand, 'pt')
    if (brand !== 0) return brand
    const model = a.model.localeCompare(b.model, 'pt')
    if (model !== 0) return model
    return a.variant.localeCompare(b.variant, 'pt')
  })

  await fs.writeFile(REGISTRY_PATH, stableJson(next), 'utf8')
}

export function buildRegistryEntryFromCore(core: JsonObject): EditableRegistryEntry {
  const id = String(core.id ?? '')
  const image = typeof core.image === 'string' ? core.image : undefined

  return {
    id,
    brand: String(core.brand ?? ''),
    model: String(core.model ?? ''),
    variant: String(core.variant ?? ''),
    segment: String(core.segment ?? ''),
    bodyType: String(core.bodyType ?? ''),
    drivetrain: String(core.drivetrain ?? ''),
    heroImage: image,
  }
}
