import { loadAllVehicles } from '@/lib/loadVehicle'

export async function loadVehiclesForRecommendation() {
  return (await loadAllVehicles()).filter(vehicle => vehicle.charging && vehicle.efficiency && vehicle.pricing)
}
