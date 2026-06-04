import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import vehicles from '@/data/registry/vehicles.json'

interface VehicleRegistryEntry {
  id: string
  brand?: string
  model?: string
  variant?: string
  [key: string]: unknown
}

interface EnrichedVehicle extends VehicleRegistryEntry {
  charging: Record<string, unknown>
  efficiency: Record<string, unknown>
  pricing: Record<string, unknown>
  comfort: Record<string, unknown> | null
}

async function loadJson<T>(
  path: string
): Promise<T | null> {
  try {
    const contents = await readFile(path, 'utf8')

    return JSON.parse(contents) as T
  } catch {
    return null
  }
}

export async function loadVehiclesForRecommendation(): Promise<
  EnrichedVehicle[]
> {
  const enrichedVehicles = await Promise.all(
    (vehicles as VehicleRegistryEntry[]).map(
      async (vehicle): Promise<EnrichedVehicle | null> => {
        const base = join(
          process.cwd(),
          'public',
          'data',
          'vehicles',
          vehicle.id
        )

        const [charging, efficiency, pricing, comfort] =
          await Promise.all([
            loadJson<Record<string, unknown>>(
              join(base, 'charging.json')
            ),
            loadJson<Record<string, unknown>>(
              join(base, 'efficiency.json')
            ),
            loadJson<Record<string, unknown>>(
              join(base, 'pricing.json')
            ),
            loadJson<Record<string, unknown>>(
              join(base, 'comfort.json')
            ),
          ])

        // Skip incomplete vehicles
        if (!charging || !efficiency || !pricing) {
          return null
        }

        return {
          ...vehicle,
          charging,
          efficiency,
          pricing,
          comfort,
        }
      }
    )
  )

  return enrichedVehicles.filter(
    (vehicle): vehicle is EnrichedVehicle =>
      vehicle !== null
  )
}