import { describe, expect, it } from 'vitest'
import update from '@/data/catalog-updates/2026-11-22-firefly.json'
import { canonicalFiles, modelSlug } from '@/lib/catalog/normalize.mjs'
import { validateVehicleFiles } from '@/lib/vehicleDataValidation'
import { getVehicleDisplayName, getVehiclePriceSummaries } from '@/lib/normalizeVehicle'
import type { VehicleFiles } from '@/lib/internalVehicleFiles'

describe('Firefly publication', () => {
  it('publishes one simply named car without assuming every unit has three-phase AC', () => {
    expect(update.records).toHaveLength(1)
    const record = update.records[0]
    const files = canonicalFiles(record.files) as VehicleFiles
    expect(validateVehicleFiles(record.id, files).filter(i => i.severity === 'error')).toEqual([])
    expect(modelSlug(files.core.brand, files.core.model)).toBe('firefly-firefly')
    expect(getVehicleDisplayName(record.files.core)).toBe('Firefly')
    expect(files.core.variant).toBe('')
    expect(files.core.motorPowerKW).toBe(120)
    expect(files.core).not.toHaveProperty('modelYear')
    expect(files.charging).toMatchObject({ acSinglePhaseKW: 7, acThreePhaseKW: 11, dcMaxChargeKW: 100, charge10to80Min: 29 })
    expect(files.charging).not.toHaveProperty('acMaxChargeKW')
    expect(files.comfort).toMatchObject({ heatPumpAvailable: false, vehicleToLoad: true })
    expect(files.battery.batteryUsableKWh).toBe(41.2)
    expect(files.efficiency).not.toHaveProperty('estimatedRealRangeKm')
    expect(getVehiclePriceSummaries(files.pricing)[0]).toMatchObject({ priceFrom: 30900, confidence: 'medium' })
    expect(record.files.pricing.offers[0].includesVat).toBe(true)
  })

  it('rejects invalid motor and phase-specific AC power', () => {
    const record = update.records[0]
    const files = canonicalFiles(record.files) as VehicleFiles
    files.core.motorPowerKW = -120
    files.charging.acSinglePhaseKW = 0
    files.charging.acThreePhaseKW = '11'
    expect(validateVehicleFiles(record.id, files).filter(i => i.severity === 'error').map(i => i.path)).toEqual(expect.arrayContaining(['core.motorPowerKW', 'charging.acSinglePhaseKW', 'charging.acThreePhaseKW']))
  })
})
