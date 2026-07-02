'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import type { VehicleFiles } from '@/lib/internalVehicleFiles'
import type { JsonObject } from '@/lib/loadVehicle'
import { validateVehicleFiles } from '@/lib/vehicleDataValidation'
import {
  Checkbox,
  EditorSection,
  Field,
  TextArea,
  ValidationPanel,
} from '@/components/internal/VehicleEditorControls'
import {
  PricingOffersEditor,
  type OfferForm,
} from '@/components/internal/PricingOffersEditor'

type Mode = 'create' | 'edit'

interface VehicleDataEditorProps {
  mode: Mode
  vehicleId?: string
  initialFiles?: VehicleFiles
  copySourceId?: string
}

const emptyFiles: VehicleFiles = {
  core: {},
  battery: {},
  charging: {},
  comfort: {},
  dimensions: {},
  efficiency: {},
  pricing: {
    market: 'pt',
    currency: 'EUR',
    lastReviewedAt: new Date().toISOString().slice(0, 7),
    offers: [],
  },
}

const offerDefaults: OfferForm = {
  condition: 'new',
  status: 'available',
  marketScope: 'official_pt',
  priceFrom: '',
  priceTo: '',
  priceDate: new Date().toISOString().slice(0, 7),
  modelYear: '',
  yearFrom: '',
  yearTo: '',
  includesVat: true,
  sourceType: 'unknown',
  sourceLabel: '',
  sourceUrl: '',
  confidence: 'unknown',
  displayPriority: '1',
  notes: '',
  originMarkets: '',
  estimatedPortugalCostsIncluded: '',
}

function stringValue(data: JsonObject | undefined, key: string) {
  const value = data?.[key]
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function numberValue(data: JsonObject | undefined, key: string) {
  const value = data?.[key]
  return typeof value === 'number' ? String(value) : ''
}

function booleanValue(data: JsonObject | undefined, key: string) {
  return data?.[key] === true
}

function toNumber(value: string): number | undefined {
  if (value.trim() === '') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function toNullableNumber(value: string): number | null {
  if (value.trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function putIfNumber(target: JsonObject, key: string, value: string) {
  const number = toNumber(value)
  if (number != null) target[key] = number
}

function putIfString(target: JsonObject, key: string, value: string) {
  const trimmed = value.trim()
  if (trimmed) target[key] = trimmed
}

function localizedFromCore(core: JsonObject, locale: string) {
  const localized = core.localized as Record<string, JsonObject> | undefined
  return localized?.[locale] ?? {}
}

function aliasesToText(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string').join('\n')
    : ''
}

function offerToForm(offer: JsonObject, index: number): OfferForm {
  return {
    condition: stringValue(offer, 'condition') || 'new',
    status: stringValue(offer, 'status') || 'available',
    marketScope: stringValue(offer, 'marketScope') || 'official_pt',
    priceFrom: numberValue(offer, 'priceFrom'),
    priceTo: numberValue(offer, 'priceTo'),
    priceDate: stringValue(offer, 'priceDate'),
    modelYear: numberValue(offer, 'modelYear'),
    yearFrom: numberValue(offer, 'yearFrom'),
    yearTo: numberValue(offer, 'yearTo'),
    includesVat: offer.includesVat !== false,
    sourceType: stringValue(offer, 'sourceType') || 'unknown',
    sourceLabel: stringValue(offer, 'sourceLabel'),
    sourceUrl: stringValue(offer, 'sourceUrl'),
    confidence: stringValue(offer, 'confidence') || 'unknown',
    displayPriority: numberValue(offer, 'displayPriority') || String(index + 1),
    notes: stringValue(offer, 'notes'),
    originMarkets: Array.isArray(offer.originMarkets) ? offer.originMarkets.join(', ') : '',
    estimatedPortugalCostsIncluded:
      typeof offer.estimatedPortugalCostsIncluded === 'boolean'
        ? String(offer.estimatedPortugalCostsIncluded)
        : '',
  }
}

function migrateLegacyPricing(pricing: JsonObject | undefined): OfferForm[] {
  const pt = pricing?.pt as JsonObject | undefined
  const offers: OfferForm[] = []
  const updatedAt = stringValue(pt, 'updatedAt') || new Date().toISOString().slice(0, 7)
  const consumerPrice = pt?.consumerPrice as JsonObject | undefined
  const usedPrice = pt?.usedPrice as JsonObject | undefined

  if (consumerPrice?.min != null) {
    offers.push({
      ...offerDefaults,
      condition: 'new',
      marketScope: 'official_pt',
      priceFrom: numberValue(consumerPrice, 'min'),
      priceTo: numberValue(consumerPrice, 'max'),
      priceDate: updatedAt,
      sourceType: 'manual',
      confidence: 'unknown',
      displayPriority: '1',
    })
  }

  if (usedPrice?.min != null && usedPrice.min !== 0) {
    offers.push({
      ...offerDefaults,
      condition: 'used',
      marketScope: 'used_pt',
      priceFrom: numberValue(usedPrice, 'min'),
      priceTo: numberValue(usedPrice, 'max'),
      priceDate: updatedAt,
      sourceType: 'market_estimate',
      confidence: 'low',
      displayPriority: String(offers.length + 1),
    })
  }

  return offers.length > 0
    ? offers
    : [{
        ...offerDefaults,
        priceDate: updatedAt,
        displayPriority: '1',
      }]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildVehicleId(parts: {
  brand: string
  model: string
  variant: string
}) {
  return slugify([parts.brand, parts.model, parts.variant].filter(Boolean).join(' '))
}

function stableStringify(value: unknown) {
  return JSON.stringify(value, null, 2)
}

function changedModules(current: VehicleFiles, initial?: VehicleFiles) {
  if (!initial) return Object.keys(current)
  return Object.entries(current)
    .filter(([key, value]) => stableStringify(value) !== stableStringify(initial[key as keyof VehicleFiles]))
    .map(([key]) => key)
}

function validateEditorState(files: VehicleFiles) {
  const blocking: string[] = []
  const warnings: string[] = []
  const core = files.core
  const pricing = files.pricing
  const offers = Array.isArray(pricing.offers) ? pricing.offers : []

  for (const key of ['id', 'brand', 'model']) {
    if (!stringValue(core, key)) blocking.push(`Core: ${key} is required.`)
  }

  const id = stringValue(core, 'id')
  if (id && !/^[a-z0-9][a-z0-9-]*$/.test(id)) {
    blocking.push('Core: id must use lowercase letters, numbers, and hyphens only.')
  }

  if (!stringValue(core, 'image')) warnings.push('Core: image path is empty.')
  if (!stringValue(files.battery, 'batteryUsableKWh')) warnings.push('Battery: usable kWh is empty.')
  if (!stringValue(files.charging, 'dcMaxChargeKW')) warnings.push('Charging: DC max kW is empty.')
  if (!stringValue(files.efficiency, 'wltpRangeKm') && !stringValue(files.efficiency, 'estimatedRealRangeKm')) {
    warnings.push('Efficiency: add WLTP or estimated real range.')
  }

  if (offers.length === 0) {
    blocking.push('Pricing: add at least one offer.')
  }

  offers.forEach((offer, index) => {
    const record = offer as JsonObject
    const prefix = `Pricing offer ${index + 1}`

    for (const key of ['condition', 'status', 'marketScope', 'sourceType', 'confidence']) {
      if (!stringValue(record, key)) blocking.push(`${prefix}: ${key} is required.`)
    }

    if (record.priceFrom == null && record.priceTo == null && record.status !== 'not_enough_data') {
      warnings.push(`${prefix}: price is empty.`)
    }

    if (!stringValue(record, 'priceDate')) warnings.push(`${prefix}: priceDate is empty.`)
    if (!stringValue(record, 'sourceUrl')) warnings.push(`${prefix}: sourceUrl is empty.`)
    if (record.confidence === 'low' || record.confidence === 'unknown') {
      warnings.push(`${prefix}: confidence is ${record.confidence}.`)
    }
  })

  const structuralIssues = validateVehicleFiles(
    stringValue(core, 'id') || 'new-vehicle',
    files
  )
  blocking.push(
    ...structuralIssues
      .filter((issue) => issue.severity === 'error')
      .map((issue) => `${issue.path}: ${issue.message}`)
  )
  warnings.push(
    ...structuralIssues
      .filter((issue) => issue.severity === 'warning')
      .map((issue) => `${issue.path}: ${issue.message}`)
  )

  return { blocking, warnings }
}

export function VehicleDataEditor({
  mode,
  vehicleId,
  initialFiles,
  copySourceId,
}: VehicleDataEditorProps) {
  const router = useRouter()
  const files = initialFiles ?? emptyFiles
  const core = files.core
  const pricing = files.pricing
  const existingOffers = Array.isArray(pricing.offers)
    ? pricing.offers.filter((offer): offer is JsonObject =>
        Boolean(offer && typeof offer === 'object' && !Array.isArray(offer))
      )
    : []

  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [id, setId] = useState(vehicleId ?? stringValue(core, 'id'))
  const [coreForm, setCoreForm] = useState({
    brand: stringValue(core, 'brand'),
    model: stringValue(core, 'model'),
    variant: stringValue(core, 'variant'),
    modelYear: numberValue(core, 'modelYear'),
    segment: stringValue(core, 'segment'),
    bodyType: stringValue(core, 'bodyType'),
    drivetrain: stringValue(core, 'drivetrain'),
    doors: numberValue(core, 'doors'),
    seats: numberValue(core, 'seats'),
    image: stringValue(core, 'image'),
  })
  const [localizedForm, setLocalizedForm] = useState(() => {
    const pt = localizedFromCore(core, 'pt')
    const en = localizedFromCore(core, 'en')
    const es = localizedFromCore(core, 'es')
    return {
      ptDisplayName: stringValue(pt, 'displayName'),
      ptSearchAliases: aliasesToText(pt.searchAliases),
      enDisplayName: stringValue(en, 'displayName'),
      enSearchAliases: aliasesToText(en.searchAliases),
      esDisplayName: stringValue(es, 'displayName'),
      esSearchAliases: aliasesToText(es.searchAliases),
    }
  })
  const [batteryForm, setBatteryForm] = useState({
    batteryChemistry: stringValue(files.battery, 'batteryChemistry'),
    batteryGrossKWh: numberValue(files.battery, 'batteryGrossKWh'),
    batteryUsableKWh: numberValue(files.battery, 'batteryUsableKWh'),
    voltageArchitecture: numberValue(files.battery, 'voltageArchitecture'),
  })
  const [chargingForm, setChargingForm] = useState({
    dcMaxChargeKW: numberValue(files.charging, 'dcMaxChargeKW'),
    acMaxChargeKW: numberValue(files.charging, 'acMaxChargeKW'),
    charge10to80Min: numberValue(files.charging, 'charge10to80Min'),
    chargePer10MinKm: numberValue(files.charging, 'chargePer10MinKm'),
    plugAndChargeSupport: booleanValue(files.charging, 'plugAndChargeSupport'),
    teslaSuperchargerAccess: booleanValue(files.charging, 'teslaSuperchargerAccess'),
    chargingCurveId: stringValue(files.charging, 'chargingCurveId'),
  })
  const [efficiencyForm, setEfficiencyForm] = useState({
    wltpRangeKm: numberValue(files.efficiency, 'wltpRangeKm'),
    estimatedRealRangeKm: numberValue(files.efficiency, 'estimatedRealRangeKm'),
    motorwayRangeKm: numberValue(files.efficiency, 'motorwayRangeKm'),
    realWorldConsumptionWhKm: numberValue(files.efficiency, 'realWorldConsumptionWhKm'),
    realMotorwayConsumptionWhKm: numberValue(files.efficiency, 'realMotorwayConsumptionWhKm'),
  })
  const [dimensionsForm, setDimensionsForm] = useState({
    cargoLitersSeatsUp: numberValue(files.dimensions, 'cargoLitersSeatsUp'),
    cargoLitersSeatsDown: numberValue(files.dimensions, 'cargoLitersSeatsDown'),
    frunkLiters: numberValue(files.dimensions, 'frunkLiters'),
    rearLegroomMM: numberValue(files.dimensions, 'rearLegroomMM'),
    wheelbaseMM: numberValue(files.dimensions, 'wheelbaseMM'),
    lengthMM: numberValue(files.dimensions, 'lengthMM'),
    widthMM: numberValue(files.dimensions, 'widthMM'),
    heightMM: numberValue(files.dimensions, 'heightMM'),
  })
  const [comfortForm, setComfortForm] = useState({
    heatPumpAvailable: booleanValue(files.comfort, 'heatPumpAvailable'),
    vehicleToLoad: booleanValue(files.comfort, 'vehicleToLoad'),
    vehicleToGrid: booleanValue(files.comfort, 'vehicleToGrid'),
    panoramicRoof: booleanValue(files.comfort, 'panoramicRoof'),
    softwareExperienceLevel: numberValue(files.comfort, 'softwareExperienceLevel'),
    maintenanceLevel: numberValue(files.comfort, 'maintenanceLevel'),
    insuranceLevel: numberValue(files.comfort, 'insuranceLevel'),
  })
  const [pricingForm, setPricingForm] = useState({
    market: stringValue(pricing, 'market') || 'pt',
    currency: stringValue(pricing, 'currency') || 'EUR',
    lastReviewedAt: stringValue(pricing, 'lastReviewedAt') || stringValue(pricing.pt as JsonObject, 'updatedAt'),
  })
  const [offers, setOffers] = useState<OfferForm[]>(
    existingOffers.length > 0
      ? existingOffers.map(offerToForm)
      : migrateLegacyPricing(pricing)
  )

  const builtFiles = useMemo<VehicleFiles>(() => {
    const nextCore: JsonObject = {
      id,
      brand: coreForm.brand,
      model: coreForm.model,
      variant: coreForm.variant,
      segment: coreForm.segment,
      bodyType: coreForm.bodyType,
      drivetrain: coreForm.drivetrain,
      image: coreForm.image || (id ? `/cars/${id}.webp` : ''),
      localized: {
        pt: {
          displayName: localizedForm.ptDisplayName,
          searchAliases: localizedForm.ptSearchAliases.split('\n').map((item) => item.trim()).filter(Boolean),
        },
        en: {
          displayName: localizedForm.enDisplayName,
          searchAliases: localizedForm.enSearchAliases.split('\n').map((item) => item.trim()).filter(Boolean),
        },
        es: {
          displayName: localizedForm.esDisplayName,
          searchAliases: localizedForm.esSearchAliases.split('\n').map((item) => item.trim()).filter(Boolean),
        },
      },
    }
    putIfNumber(nextCore, 'modelYear', coreForm.modelYear)
    putIfNumber(nextCore, 'doors', coreForm.doors)
    putIfNumber(nextCore, 'seats', coreForm.seats)

    const battery: JsonObject = {}
    putIfString(battery, 'batteryChemistry', batteryForm.batteryChemistry)
    putIfNumber(battery, 'batteryGrossKWh', batteryForm.batteryGrossKWh)
    putIfNumber(battery, 'batteryUsableKWh', batteryForm.batteryUsableKWh)
    putIfNumber(battery, 'voltageArchitecture', batteryForm.voltageArchitecture)

    const charging: JsonObject = {
      plugAndChargeSupport: chargingForm.plugAndChargeSupport,
      teslaSuperchargerAccess: chargingForm.teslaSuperchargerAccess,
    }
    putIfNumber(charging, 'dcMaxChargeKW', chargingForm.dcMaxChargeKW)
    putIfNumber(charging, 'acMaxChargeKW', chargingForm.acMaxChargeKW)
    putIfNumber(charging, 'charge10to80Min', chargingForm.charge10to80Min)
    putIfNumber(charging, 'chargePer10MinKm', chargingForm.chargePer10MinKm)
    putIfString(charging, 'chargingCurveId', chargingForm.chargingCurveId || id)

    const comfort: JsonObject = {
      heatPumpAvailable: comfortForm.heatPumpAvailable,
      vehicleToLoad: comfortForm.vehicleToLoad,
      vehicleToGrid: comfortForm.vehicleToGrid,
      panoramicRoof: comfortForm.panoramicRoof,
    }
    putIfNumber(comfort, 'softwareExperienceLevel', comfortForm.softwareExperienceLevel)
    putIfNumber(comfort, 'maintenanceLevel', comfortForm.maintenanceLevel)
    putIfNumber(comfort, 'insuranceLevel', comfortForm.insuranceLevel)

    const dimensions: JsonObject = {
      cargoLitersSeatsUp: toNullableNumber(dimensionsForm.cargoLitersSeatsUp),
      cargoLitersSeatsDown: toNullableNumber(dimensionsForm.cargoLitersSeatsDown),
      frunkLiters: toNullableNumber(dimensionsForm.frunkLiters),
      rearLegroomMM: toNullableNumber(dimensionsForm.rearLegroomMM),
      wheelbaseMM: toNullableNumber(dimensionsForm.wheelbaseMM),
      lengthMM: toNullableNumber(dimensionsForm.lengthMM),
      widthMM: toNullableNumber(dimensionsForm.widthMM),
      heightMM: toNullableNumber(dimensionsForm.heightMM),
    }

    const efficiency: JsonObject = {}
    putIfNumber(efficiency, 'wltpRangeKm', efficiencyForm.wltpRangeKm)
    putIfNumber(efficiency, 'estimatedRealRangeKm', efficiencyForm.estimatedRealRangeKm)
    putIfNumber(efficiency, 'motorwayRangeKm', efficiencyForm.motorwayRangeKm)
    putIfNumber(efficiency, 'realWorldConsumptionWhKm', efficiencyForm.realWorldConsumptionWhKm)
    putIfNumber(efficiency, 'realMotorwayConsumptionWhKm', efficiencyForm.realMotorwayConsumptionWhKm)

    const pricingOffers = offers.map((offer): JsonObject => {
      const output: JsonObject = {
        condition: offer.condition,
        status: offer.status,
        marketScope: offer.marketScope,
        includesVat: offer.includesVat,
        sourceType: offer.sourceType,
        confidence: offer.confidence,
      }
      putIfNumber(output, 'priceFrom', offer.priceFrom)
      putIfNumber(output, 'priceTo', offer.priceTo)
      putIfString(output, 'priceDate', offer.priceDate)
      putIfNumber(output, 'modelYear', offer.modelYear)
      putIfNumber(output, 'yearFrom', offer.yearFrom)
      putIfNumber(output, 'yearTo', offer.yearTo)
      putIfString(output, 'sourceLabel', offer.sourceLabel)
      if (offer.sourceUrl.trim()) output.sourceUrl = offer.sourceUrl.trim()
      else output.sourceUrl = null
      putIfNumber(output, 'displayPriority', offer.displayPriority)
      if (offer.originMarkets.trim()) {
        output.originMarkets = offer.originMarkets.split(',').map((item) => item.trim()).filter(Boolean)
      }
      if (offer.estimatedPortugalCostsIncluded === 'true') output.estimatedPortugalCostsIncluded = true
      if (offer.estimatedPortugalCostsIncluded === 'false') output.estimatedPortugalCostsIncluded = false
      if (offer.notes.trim()) output.notes = offer.notes.trim()
      else output.notes = null
      return output
    })

    return {
      core: nextCore,
      battery,
      charging,
      comfort,
      dimensions,
      efficiency,
      pricing: {
        market: pricingForm.market || 'pt',
        currency: pricingForm.currency || 'EUR',
        lastReviewedAt: pricingForm.lastReviewedAt || new Date().toISOString().slice(0, 7),
        offers: pricingOffers,
      },
    }
  }, [
    batteryForm,
    chargingForm,
    comfortForm,
    coreForm,
    dimensionsForm,
    efficiencyForm,
    id,
    localizedForm,
    offers,
    pricingForm,
  ])

  const validation = useMemo(() => validateEditorState(builtFiles), [builtFiles])
  const modulesChanged = useMemo(() => changedModules(builtFiles, initialFiles), [builtFiles, initialFiles])
  const canSave = validation.blocking.length === 0 && !isSaving

  async function save() {
    const nextValidation = validateEditorState(builtFiles)
    if (nextValidation.blocking.length > 0) {
      setMessage(`Fix ${nextValidation.blocking.length} required item${nextValidation.blocking.length === 1 ? '' : 's'} before saving.`)
      return
    }

    setIsSaving(true)
    setMessage('')

    try {
      const response = await fetch(
        mode === 'create' ? '/api/internal/vehicles' : `/api/internal/vehicles/${id}`,
        {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, files: builtFiles }),
        }
      )
      const result = await response.json()

      if (!response.ok) throw new Error(result.error ?? 'Save failed.')

      setMessage('Saved successfully.')
      router.refresh()
      if (mode === 'create') router.push(`/internal/vehicles/${id}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {mode === 'create' ? 'Add vehicle' : 'Edit vehicle'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {copySourceId
                ? `Copied from ${copySourceId}. Generate a new ID, adjust the variant data, then save as a new vehicle.`
                : 'Form-based editor for the seven vehicle JSON files and registry entry.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {mode === 'create' && (
              <button
                type="button"
                onClick={() => setId(buildVehicleId(coreForm))}
                disabled={!coreForm.brand.trim() || !coreForm.model.trim()}
                className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate ID
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : mode === 'create' ? 'Create vehicle' : 'Save changes'}
            </button>
          </div>
        </div>
        {message && (
          <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p>
        )}
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          <ValidationPanel
            title="Required before save"
            tone="rose"
            items={validation.blocking}
            emptyText="No blocking issues."
          />
          <ValidationPanel
            title="Warnings"
            tone="amber"
            items={validation.warnings}
            emptyText="No warnings."
          />
          <ValidationPanel
            title="Changed JSON files"
            tone="emerald"
            items={modulesChanged}
            emptyText="No file changes yet."
          />
        </div>
      </section>

      <EditorSection title="Core">
        <Field label="Vehicle ID" value={id} onChange={setId} disabled={mode === 'edit'} />
        <Field label="Brand" value={coreForm.brand} onChange={(brand) => setCoreForm({ ...coreForm, brand })} />
        <Field label="Model" value={coreForm.model} onChange={(model) => setCoreForm({ ...coreForm, model })} />
        <Field label="Variant" value={coreForm.variant} onChange={(variant) => setCoreForm({ ...coreForm, variant })} />
        <Field label="Model year" value={coreForm.modelYear} onChange={(modelYear) => setCoreForm({ ...coreForm, modelYear })} type="number" />
        <Field label="Segment" value={coreForm.segment} onChange={(segment) => setCoreForm({ ...coreForm, segment })} />
        <Field label="Body type" value={coreForm.bodyType} onChange={(bodyType) => setCoreForm({ ...coreForm, bodyType })} />
        <Field label="Drivetrain" value={coreForm.drivetrain} onChange={(drivetrain) => setCoreForm({ ...coreForm, drivetrain })} />
        <Field label="Doors" value={coreForm.doors} onChange={(doors) => setCoreForm({ ...coreForm, doors })} type="number" />
        <Field label="Seats" value={coreForm.seats} onChange={(seats) => setCoreForm({ ...coreForm, seats })} type="number" />
        <Field label="Image path" value={coreForm.image} onChange={(image) => setCoreForm({ ...coreForm, image })} placeholder={`/cars/${id}.webp`} />
      </EditorSection>

      <EditorSection title="Localization">
        <TextArea label="PT display name" value={localizedForm.ptDisplayName} onChange={(ptDisplayName) => setLocalizedForm({ ...localizedForm, ptDisplayName })} rows={2} />
        <TextArea label="PT search aliases" value={localizedForm.ptSearchAliases} onChange={(ptSearchAliases) => setLocalizedForm({ ...localizedForm, ptSearchAliases })} />
        <TextArea label="EN display name" value={localizedForm.enDisplayName} onChange={(enDisplayName) => setLocalizedForm({ ...localizedForm, enDisplayName })} rows={2} />
        <TextArea label="EN search aliases" value={localizedForm.enSearchAliases} onChange={(enSearchAliases) => setLocalizedForm({ ...localizedForm, enSearchAliases })} />
        <TextArea label="ES display name" value={localizedForm.esDisplayName} onChange={(esDisplayName) => setLocalizedForm({ ...localizedForm, esDisplayName })} rows={2} />
        <TextArea label="ES search aliases" value={localizedForm.esSearchAliases} onChange={(esSearchAliases) => setLocalizedForm({ ...localizedForm, esSearchAliases })} />
      </EditorSection>

      <EditorSection title="Battery">
        <Field label="Chemistry" value={batteryForm.batteryChemistry} onChange={(batteryChemistry) => setBatteryForm({ ...batteryForm, batteryChemistry })} />
        <Field label="Gross kWh" value={batteryForm.batteryGrossKWh} onChange={(batteryGrossKWh) => setBatteryForm({ ...batteryForm, batteryGrossKWh })} type="number" />
        <Field label="Usable kWh" value={batteryForm.batteryUsableKWh} onChange={(batteryUsableKWh) => setBatteryForm({ ...batteryForm, batteryUsableKWh })} type="number" />
        <Field label="Voltage architecture" value={batteryForm.voltageArchitecture} onChange={(voltageArchitecture) => setBatteryForm({ ...batteryForm, voltageArchitecture })} type="number" />
      </EditorSection>

      <EditorSection title="Charging">
        <Field label="DC max kW" value={chargingForm.dcMaxChargeKW} onChange={(dcMaxChargeKW) => setChargingForm({ ...chargingForm, dcMaxChargeKW })} type="number" />
        <Field label="AC max kW" value={chargingForm.acMaxChargeKW} onChange={(acMaxChargeKW) => setChargingForm({ ...chargingForm, acMaxChargeKW })} type="number" />
        <Field label="10-80 min" value={chargingForm.charge10to80Min} onChange={(charge10to80Min) => setChargingForm({ ...chargingForm, charge10to80Min })} type="number" />
        <Field label="10 min km" value={chargingForm.chargePer10MinKm} onChange={(chargePer10MinKm) => setChargingForm({ ...chargingForm, chargePer10MinKm })} type="number" />
        <Checkbox label="Plug & Charge" checked={chargingForm.plugAndChargeSupport} onChange={(plugAndChargeSupport) => setChargingForm({ ...chargingForm, plugAndChargeSupport })} />
        <Checkbox label="Tesla Supercharger access" checked={chargingForm.teslaSuperchargerAccess} onChange={(teslaSuperchargerAccess) => setChargingForm({ ...chargingForm, teslaSuperchargerAccess })} />
        <Field label="Charging curve ID" value={chargingForm.chargingCurveId} onChange={(chargingCurveId) => setChargingForm({ ...chargingForm, chargingCurveId })} />
      </EditorSection>

      <EditorSection title="Efficiency">
        <Field label="WLTP range km" value={efficiencyForm.wltpRangeKm} onChange={(wltpRangeKm) => setEfficiencyForm({ ...efficiencyForm, wltpRangeKm })} type="number" />
        <Field label="Real range km" value={efficiencyForm.estimatedRealRangeKm} onChange={(estimatedRealRangeKm) => setEfficiencyForm({ ...efficiencyForm, estimatedRealRangeKm })} type="number" />
        <Field label="Motorway range km" value={efficiencyForm.motorwayRangeKm} onChange={(motorwayRangeKm) => setEfficiencyForm({ ...efficiencyForm, motorwayRangeKm })} type="number" />
        <Field label="Real Wh/km" value={efficiencyForm.realWorldConsumptionWhKm} onChange={(realWorldConsumptionWhKm) => setEfficiencyForm({ ...efficiencyForm, realWorldConsumptionWhKm })} type="number" />
        <Field label="Motorway Wh/km" value={efficiencyForm.realMotorwayConsumptionWhKm} onChange={(realMotorwayConsumptionWhKm) => setEfficiencyForm({ ...efficiencyForm, realMotorwayConsumptionWhKm })} type="number" />
      </EditorSection>

      <EditorSection title="Dimensions">
        {Object.keys(dimensionsForm).map((key) => (
          <Field
            key={key}
            label={key}
            value={dimensionsForm[key as keyof typeof dimensionsForm]}
            onChange={(value) => setDimensionsForm({ ...dimensionsForm, [key]: value })}
            type="number"
          />
        ))}
      </EditorSection>

      <EditorSection title="Comfort">
        <Checkbox label="Heat pump" checked={comfortForm.heatPumpAvailable} onChange={(heatPumpAvailable) => setComfortForm({ ...comfortForm, heatPumpAvailable })} />
        <Checkbox label="Vehicle to load" checked={comfortForm.vehicleToLoad} onChange={(vehicleToLoad) => setComfortForm({ ...comfortForm, vehicleToLoad })} />
        <Checkbox label="Vehicle to grid" checked={comfortForm.vehicleToGrid} onChange={(vehicleToGrid) => setComfortForm({ ...comfortForm, vehicleToGrid })} />
        <Checkbox label="Panoramic roof" checked={comfortForm.panoramicRoof} onChange={(panoramicRoof) => setComfortForm({ ...comfortForm, panoramicRoof })} />
        <Field label="Software level" value={comfortForm.softwareExperienceLevel} onChange={(softwareExperienceLevel) => setComfortForm({ ...comfortForm, softwareExperienceLevel })} type="number" />
        <Field label="Maintenance level" value={comfortForm.maintenanceLevel} onChange={(maintenanceLevel) => setComfortForm({ ...comfortForm, maintenanceLevel })} type="number" />
        <Field label="Insurance level" value={comfortForm.insuranceLevel} onChange={(insuranceLevel) => setComfortForm({ ...comfortForm, insuranceLevel })} type="number" />
      </EditorSection>

      <EditorSection title="Pricing">
        <Field label="Market" value={pricingForm.market} onChange={(market) => setPricingForm({ ...pricingForm, market })} />
        <Field label="Currency" value={pricingForm.currency} onChange={(currency) => setPricingForm({ ...pricingForm, currency })} />
        <Field label="Last reviewed" value={pricingForm.lastReviewedAt} onChange={(lastReviewedAt) => setPricingForm({ ...pricingForm, lastReviewedAt })} />
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setOffers(migrateLegacyPricing(files.pricing))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500"
          >
            Migrate legacy pricing to offers[]
          </button>
        </div>
        <PricingOffersEditor
          offers={offers}
          onChange={setOffers}
          createOffer={(index) => ({
            ...offerDefaults,
            displayPriority: String(index + 1),
          })}
        />
      </EditorSection>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-slate-950">JSON preview</h2>
          <p className="text-sm text-slate-500">
            {modulesChanged.length > 0
              ? `${modulesChanged.length} file${modulesChanged.length === 1 ? '' : 's'} changed`
              : 'No changes detected'}
          </p>
        </div>
        <pre className="mt-4 max-h-[560px] overflow-auto rounded-md bg-slate-950 p-4 text-xs text-slate-100">
          {JSON.stringify(builtFiles, null, 2)}
        </pre>
      </section>
    </div>
  )
}
