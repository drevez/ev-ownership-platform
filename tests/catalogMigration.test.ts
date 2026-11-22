import { describe, it, expect } from 'vitest'
import { prepareCatalog } from '../scripts/catalog-data.mjs'
import { canonicalFiles, canonicalPricing } from '../lib/catalog/normalize.mjs'
import { validateVehicleFiles } from '../lib/vehicleDataValidation'
import { getVehiclePriceSummaries } from '../lib/normalizeVehicle'
import type { VehicleFiles } from '../lib/internalVehicleFiles'
import type { VehiclePricing } from '../lib/loadVehicle'

describe('catalog migration', () => {
  it('imports every module and produces valid, idempotent canonical files', async () => {
    const records = await prepareCatalog()
    expect(records.length).toBeGreaterThan(0)
    for (const record of records) {
      const issues = validateVehicleFiles(record.id, record.files as VehicleFiles).filter(i=>i.severity==='error')
      expect(issues, record.id).toEqual([])
      expect(canonicalFiles(record.files), record.id).toEqual(record.files)
      for (const name of ['core','battery','charging','comfort','dimensions','efficiency']) {
        expect(record.files[name], `${record.id}/${name}`).toEqual(record.original[name])
      }
    }
  })
  it('preserves positive price amounts and their purchase contexts across the entire catalog', async () => {
    for (const record of await prepareCatalog()) {
      const economicValues = (pricing: VehiclePricing) => getVehiclePriceSummaries(pricing)
        .filter(p => (p.priceFrom ?? 0) > 0 || (p.priceTo ?? 0) > 0)
        .map(p => ({ kind:p.kind, priceFrom:p.priceFrom && p.priceFrom > 0 ? p.priceFrom : undefined,
          priceTo:p.priceTo && p.priceTo > 0 ? p.priceTo : undefined, status:p.status,
          modelYear:p.modelYear, yearFrom:p.yearFrom, yearTo:p.yearTo, updatedAt:p.updatedAt }))
      expect(economicValues(record.files.pricing),record.id).toEqual(economicValues(record.original.pricing))
    }
  })
  it('never invents review dates or turns unknown zero prices into offers', () => {
    expect(canonicalPricing({ pt:{ usedPrice:{ min:0,max:0 } } })).toEqual({market:'pt',currency:'EUR',offers:[]})
  })
})
