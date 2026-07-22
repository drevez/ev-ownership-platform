import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

import type { VehicleFiles } from '@/lib/internalVehicleFiles'
import { validateVehicleFiles } from '@/lib/vehicleDataValidation'

function validFiles(): VehicleFiles {
  return {
    core: {
      id: 'example-ev',
      brand: 'Example',
      model: 'EV',
      modelYear: 2026,
      doors: 5,
      seats: 5,
    },
    battery: {
      batteryGrossKWh: 80,
      batteryUsableKWh: 75,
      voltageArchitecture: 400,
    },
    charging: {
      dcMaxChargeKW: 150,
      acMaxChargeKW: 11,
      charge10to80Min: 30,
      plugAndChargeSupport: true,
      teslaSuperchargerAccess: false,
    },
    comfort: {
      heatPumpAvailable: true,
      softwareExperienceLevel: 8,
    },
    dimensions: {
      cargoLitersSeatsUp: 450,
      frunkLiters: 0,
      lengthMM: 4700,
    },
    efficiency: {
      wltpRangeKm: 500,
      estimatedRealRangeKm: 420,
      realWorldConsumptionWhKm: 175,
    },
    pricing: {
      market: 'pt',
      currency: 'EUR',
      lastReviewedAt: '2026-06',
      offers: [{
        condition: 'new',
        status: 'available',
        marketScope: 'official_pt',
        priceFrom: 40000,
        priceTo: 45000,
        priceDate: '2026-06',
        modelYear: 2026,
        sourceType: 'official_brand',
        confidence: 'high',
        displayPriority: 1,
      }],
    },
  }
}

describe('vehicle data validation', () => {
  it('has no blocking structural errors in the current dataset', () => {
    const vehiclesDir = path.join(process.cwd(), 'public', 'data', 'vehicles')
    const ids = fs.readdirSync(vehiclesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
    const errors = ids.flatMap((id) => {
      const files = Object.fromEntries(
        ['core', 'battery', 'charging', 'comfort', 'dimensions', 'efficiency', 'pricing']
          .map((module) => [
            module,
            JSON.parse(
              fs.readFileSync(path.join(vehiclesDir, id, `${module}.json`), 'utf8')
            ),
          ])
      ) as VehicleFiles

      return validateVehicleFiles(id, files)
        .filter((issue) => issue.severity === 'error')
        .map((issue) => `${id}: ${issue.path} ${issue.message}`)
    })

    expect(errors).toEqual([])
  })

  it('accepts the target vehicle structure without errors', () => {
    const issues = validateVehicleFiles('example-ev', validFiles())
    expect(issues.filter((issue) => issue.severity === 'error')).toEqual([])
  })

  it('detects fields placed in the wrong module', () => {
    const files = validFiles()
    files.charging.batteryGrossKWh = 80

    expect(validateVehicleFiles('example-ev', files)).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'unknown_module_field',
        path: 'charging.batteryGrossKWh',
      })
    )
  })

  it('rejects impossible battery and reversed pricing ranges', () => {
    const files = validFiles()
    files.battery.batteryUsableKWh = 90
    const offers = files.pricing.offers as Record<string, unknown>[]
    offers[0].priceFrom = 50000
    offers[0].priceTo = 40000

    const codes = validateVehicleFiles('example-ev', files)
      .filter((issue) => issue.severity === 'error')
      .map((issue) => issue.code)

    expect(codes).toContain('usable_exceeds_gross')
    expect(codes).toContain('reversed_price_range')
  })

  it('rejects comfort levels outside the 1-10 scale', () => {
    const files = validFiles()
    files.comfort.softwareExperienceLevel = 11

    expect(validateVehicleFiles('example-ev', files)).toContainEqual(
      expect.objectContaining({
        severity: 'error',
        code: 'invalid_number',
        path: 'comfort.softwareExperienceLevel',
      })
    )
  })

  it('treats legacy pricing as a migration warning', () => {
    const files = validFiles()
    files.pricing = {
      pt: {
        currency: 'EUR',
        consumerPrice: { min: 35000, max: 40000 },
      },
    }

    const issues = validateVehicleFiles('example-ev', files)
    expect(issues).toContainEqual(
      expect.objectContaining({ severity: 'warning', code: 'legacy_pricing' })
    )
    expect(issues.some((issue) => issue.severity === 'error')).toBe(false)
  })

  it('requires import market and cost context', () => {
    const files = validFiles()
    files.pricing.offers = [{
      condition: 'used',
      status: 'available',
      marketScope: 'imported_to_pt',
      priceFrom: 30000,
      priceDate: '2026-06',
      sourceType: 'classifieds',
      confidence: 'medium',
      displayPriority: 1,
    }]

    const codes = validateVehicleFiles('example-ev', files).map((issue) => issue.code)
    expect(codes).toContain('missing_origin_market')
    expect(codes).toContain('missing_import_cost_context')
  })
})
