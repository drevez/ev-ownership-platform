import { describe, expect, it } from 'vitest'
import { getModelDisplayName } from '@/lib/vehicleNames'
import { getVehicleDisplayName } from '@/lib/normalizeVehicle'
import { mapRegistryToComparisonVehicle } from '@/lib/comparison'

describe('vehicle display names', () => {
  it('shows Firefly once across model, localized version and comparison names', () => {
    const vehicle = { id: 'firefly-select', brand: 'Firefly', model: 'Firefly', variant: 'Select 41.2 kWh' }
    expect(getModelDisplayName(vehicle.brand, vehicle.model)).toBe('Firefly')
    expect(getVehicleDisplayName(vehicle)).toBe('Firefly Select 41.2 kWh')
    expect(getVehicleDisplayName({ ...vehicle, localized: { pt: { displayName: 'Firefly Firefly Select 41.2 kWh' } } })).toBe('Firefly Select 41.2 kWh')
    expect(mapRegistryToComparisonVehicle({ ...vehicle, segment: 'B', bodyType: 'Hatchback', drivetrain: 'RWD', heroImage: '' }).displayName).toBe('Firefly Select 41.2 kWh')
  })

  it('preserves distinct model names and intentional localized names', () => {
    expect(getModelDisplayName('Changan', 'Deepal S07')).toBe('Changan Deepal S07')
    expect(getModelDisplayName('Firefly', ' firefly ')).toBe('Firefly')
    expect(getVehicleDisplayName({ brand: 'Firefly', model: 'Firefly', variant: 'Select', localized: { en: { displayName: 'Firefly Select Special Edition' } } }, 'en')).toBe('Firefly Select Special Edition')
  })
})
