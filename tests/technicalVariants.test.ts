import { describe, expect, it } from 'vitest'
import update from '@/data/catalog-updates/2026-11-23-expansion-batch-01.json'
import { groupTechnicalVariants } from '@/lib/technicalVariants'
import type { VehicleData } from '@/lib/loadVehicle'

function vehicles(): VehicleData[] {
  return update.records.map(({ files }) => ({ ...files.core, battery: files.battery, charging: files.charging, comfort: files.comfort, dimensions: files.dimensions, efficiency: files.efficiency, pricing: files.pricing }) as VehicleData)
}

describe('public technical versions', () => {
  it('shows eleven configurations instead of sixteen trim records, without changing source data', () => {
    const source = vehicles()
    const before = structuredClone(source)
    const result = groupTechnicalVariants(source)
    expect(result).toHaveLength(11)
    expect(source).toEqual(before)
    const ut = result.filter(v => v.model === 'UT')
    expect(ut).toHaveLength(1)
    expect(ut[0].variant).toBe('60 kWh')
    expect(ut[0].comfort?.panoramicRoof).toBeUndefined()
    expect(ut[0].equipmentTrims?.map(t => t.pricing?.offers?.[0]?.priceFrom)).toEqual([29003.3, 31003.3])
    expect(ut[0].equipmentTrims?.[1].comfort?.panoramicRoof).toBe(true)
  })

  it('preserves genuine battery, motor and drivetrain differences', () => {
    const result = groupTechnicalVariants(vehicles())
    for (const model of ['E2', 'Deepal S05', 'Deepal S07']) expect(result.filter(v => v.model === model)).toHaveLength(2)
    const e5 = result.find(v => v.model === 'E5')!
    expect(e5.efficiency?.wltpRangeKm).toBe(430)
    expect(e5.equipmentTrims?.map(t => t.wltpRangeKm)).toEqual([430, 410])
  })

  it('keeps records separate when the documented hardware changes or a member is missing', () => {
    for (const change of ['power', 'charging', 'battery', 'advertisedCapacity']) {
      const source = vehicles().filter(v => v.model === 'UT')
      if (change === 'power') source[1].motorPowerKW = 200
      if (change === 'charging') source[1].charging = { ...source[1].charging, dcMaxChargeKW: 150 }
      if (change === 'battery') source[1].battery = { ...source[1].battery, batteryUsableKWh: 70 }
      if (change === 'advertisedCapacity') source[1].variant = 'Luxury 75 kWh'
      expect(groupTechnicalVariants(source)).toHaveLength(2)
    }
    expect(groupTechnicalVariants(vehicles().filter(v => v.id === 'aion-ut-luxury'))[0].variant).toBe('Luxury 60 kWh')
  })
})
