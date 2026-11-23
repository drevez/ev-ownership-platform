import type { VehicleData } from '@/lib/loadVehicle'

// Explicit editorial grouping. Never infer shared hardware from a similar name alone.
export const TECHNICAL_GROUPS = [
  { id: 'aion-ut-premium', variant: '60 kWh', members: ['aion-ut-premium', 'aion-ut-luxury'] },
  { id: 'aion-v-premium', variant: '75.3 kWh', members: ['aion-v-premium', 'aion-v-luxury'] },
  { id: 'geely-e2-max', variant: '47.14 kWh', members: ['geely-e2-max', 'geely-e2-ultra'] },
  { id: 'geely-e5-pro', variant: '60.22 kWh', members: ['geely-e5-pro', 'geely-e5-max'] },
  { id: 'changan-deepal-s05-rwd-pro', variant: 'RWD 68.8 kWh', members: ['changan-deepal-s05-rwd-pro', 'changan-deepal-s05-rwd-max'] },
] as const

const PUBLIC_LABELS: Record<string, string> = {
  'geely-e2-pro': '35.35 kWh',
  'changan-deepal-s05-awd-max': 'AWD 68.8 kWh',
  'dongfeng-box-plus': '42.3 kWh',
  'dongfeng-vigo-one-edition': '51.87 kWh',
}

export function getTechnicalGroup(id: string) {
  return TECHNICAL_GROUPS.find(group => group.members.some(member => member === id))
}

function hardwareKey(vehicle: VehicleData) {
  return JSON.stringify([
    vehicle.brand, vehicle.model, vehicle.bodyType, vehicle.drivetrain, vehicle.motorPowerKW,
    vehicle.variant?.match(/(\d+(?:[.,]\d+)?)\s*kWh/i)?.[1].replace(',', '.'),
    vehicle.battery?.batteryChemistry, vehicle.battery?.batteryGrossKWh,
    vehicle.battery?.batteryUsableKWh, vehicle.battery?.voltageArchitecture,
    vehicle.charging?.acMaxChargeKW, vehicle.charging?.acSinglePhaseKW,
    vehicle.charging?.acThreePhaseKW, vehicle.charging?.dcMaxChargeKW,
    vehicle.charging?.charge10to80Min,
  ])
}

/** Public projection only: source records, pricing and revisions stay editable separately. */
export function groupTechnicalVariants(vehicles: VehicleData[]): VehicleData[] {
  const byId = new Map(vehicles.map(vehicle => [vehicle.id, vehicle]))
  const hidden = new Set<string>()
  const replacements = new Map<string, VehicleData>()

  for (const group of TECHNICAL_GROUPS) {
    const base = byId.get(group.id)
    const members = group.members.map(id => byId.get(id))
    // A changed motor/battery/charging specification must never be silently hidden.
    if (!base || members.some(member => !member || hardwareKey(member) !== hardwareKey(base))) continue
    const trims = members.filter((member): member is VehicleData => Boolean(member))
    replacements.set(group.id, {
      ...base,
      variant: group.variant,
      equipmentTrims: trims.map(trim => ({
        id: trim.id,
        label: trim.variant ?? trim.id,
        wltpRangeKm: trim.efficiency?.wltpRangeKm,
        pricing: trim.pricing,
        comfort: trim.comfort,
      })),
    })
    group.members.forEach(id => { if (id !== group.id) hidden.add(id) })
  }

  return vehicles.filter(vehicle => !hidden.has(vehicle.id)).map(vehicle =>
    replacements.get(vehicle.id) ?? (PUBLIC_LABELS[vehicle.id]
      ? { ...vehicle, variant: PUBLIC_LABELS[vehicle.id] }
      : vehicle)
  )
}
