import {describe,it,expect} from 'vitest'
import update from '@/data/catalog-updates/2026-11-22-leapmotor-b05.json'
import {canonicalFiles} from '@/lib/catalog/normalize.mjs'
import {validateVehicleFiles} from '@/lib/vehicleDataValidation'
import {getVehiclePriceSummaries} from '@/lib/normalizeVehicle'
import type {VehicleFiles} from '@/lib/internalVehicleFiles'

describe('B05 catalog additions',()=>{
 it('validates the two sourced Portuguese versions and preserves price conditions',()=>{
  expect(new Set(update.records.map(r=>r.id)).size).toBe(2)
  for(const record of update.records){
   const files=canonicalFiles(record.files) as VehicleFiles
   expect(validateVehicleFiles(record.id,files).filter(issue=>issue.severity==='error'),record.id).toEqual([])
   const summaries=getVehiclePriceSummaries(files.pricing)
   expect(summaries[0].notes).toBe(record.files.pricing.offers[0].notes)
   expect(summaries[0].sourceUrl).toBe(record.files.pricing.offers[0].sourceUrl)
   expect(files.charging).not.toHaveProperty('charge10to80Min')
   expect(files.battery).not.toHaveProperty('batteryUsableKWh')
   expect(files.efficiency).not.toHaveProperty('estimatedRealRangeKm')
  }
  expect(update.records[0].files.pricing.offers[0]).toMatchObject({priceFrom:25000,sourceType:'official_brand',confidence:'high'})
  expect(update.records[1].files.pricing.offers[0]).toMatchObject({priceFrom:30787,sourceType:'market_estimate',confidence:'low',status:'unknown'})
 })
})
