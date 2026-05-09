import fs from 'fs/promises'
import path from 'path'

export interface VehicleData {
  core?: Record<string, any>
  battery?: Record<string, any>
  charging?: Record<string, any>
  efficiency?: Record<string, any>
  dimensions?: Record<string, any>
  pricing?: Record<string, any>
  comfort?: Record<string, any>
  [key: string]: any
}

export async function loadVehicle(vehicleId: string): Promise<VehicleData | null> {
  try {
    const vehiclePath = path.join(process.cwd(), 'public', 'data', 'vehicles', vehicleId)
    
    const modules = [
      'core.json',
      'battery.json',
      'charging.json',
      'efficiency.json',
      'dimensions.json',
      'pricing.json',
      'comfort.json'
    ]

    const results = await Promise.all(
      modules.map(async (module) => {
        try {
          const filePath = path.join(vehiclePath, module)
          const content = await fs.readFile(filePath, 'utf-8')
          const data = JSON.parse(content)
          
          // Only include if not empty object
          if (Object.keys(data).length > 0) {
            return {
              key: module.replace('.json', ''),
              data
            }
          }
          return null
        } catch (err) {
          // File doesn't exist or is invalid JSON
          return null
        }
      })
    )

    // Merge all results into single object
    const vehicle: VehicleData = {}
    
    results.forEach((result) => {
      if (result) {
        if (result.key === 'core') {
          // Spread core data at root level
          Object.assign(vehicle, result.data)
        } else {
          // Group other modules by key
          vehicle[result.key] = result.data
        }
      }
    })

    // Verify we have at least core data
    if (!vehicle.id) {
      return null
    }

    return vehicle
  } catch (err) {
    console.error(`Failed to load vehicle ${vehicleId}:`, err)
    return null
  }
}

export async function loadVehicleRegistry() {
  try {
    const registryPath = path.join(process.cwd(), 'data', 'registry', 'vehicles.json')
    const content = await fs.readFile(registryPath, 'utf-8')
    return JSON.parse(content)
  } catch (err) {
    console.error('Failed to load vehicle registry:', err)
    return []
  }
}

export async function getVehicleParams() {
  const registry = await loadVehicleRegistry()
  return registry.map((vehicle: any) => ({
    id: vehicle.id
  }))
}
