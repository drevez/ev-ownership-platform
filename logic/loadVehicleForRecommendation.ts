import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import vehicles from '@/data/registry/vehicles.json'

async function loadJson(path: string) {
  try {
    const contents = await readFile(path, 'utf8')
    return JSON.parse(contents)
  } catch {
    return null
  }
}

export async function loadVehiclesForRecommendation() {
  const enrichedVehicles = await Promise.all(
    vehicles.map(async (vehicle: any) => {
      const base = join(
        process.cwd(),
        'public',
        'data',
        'vehicles',
        vehicle.id
      )

      const [
        charging,
        efficiency,
        pricing,
        comfort
      ] = await Promise.all([
        loadJson(join(base, 'charging.json')),
        loadJson(join(base, 'efficiency.json')),
        loadJson(join(base, 'pricing.json')),
        loadJson(join(base, 'comfort.json'))
      ])

      // Skip incomplete vehicles
      if (
        !charging ||
        !efficiency ||
        !pricing
      ) {
        return null
      }

      return {
        ...vehicle,
        charging,
        efficiency,
        pricing,
        comfort
      }
    })
  )

  return enrichedVehicles.filter(Boolean)
}