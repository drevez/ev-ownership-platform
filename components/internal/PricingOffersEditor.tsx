'use client'

import {
  Checkbox,
  Field,
  Select,
} from '@/components/internal/VehicleEditorControls'

export interface OfferForm {
  condition: string
  status: string
  marketScope: string
  priceFrom: string
  priceTo: string
  priceDate: string
  modelYear: string
  yearFrom: string
  yearTo: string
  includesVat: boolean
  sourceType: string
  sourceLabel: string
  sourceUrl: string
  confidence: string
  displayPriority: string
  notes: string
  originMarkets: string
  estimatedPortugalCostsIncluded: string
}

export function PricingOffersEditor({
  offers,
  onChange,
  createOffer,
}: {
  offers: OfferForm[]
  onChange: (offers: OfferForm[]) => void
  createOffer: (index: number) => OfferForm
}) {
  function updateOffer(index: number, patch: Partial<OfferForm>) {
    onChange(offers.map((offer, offerIndex) =>
      offerIndex === index ? { ...offer, ...patch } : offer
    ))
  }

  return (
    <div className="space-y-4 md:col-span-2">
      {offers.map((offer, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Offer {index + 1}</h3>
            <button
              type="button"
              onClick={() => onChange(offers.filter((_, itemIndex) => itemIndex !== index))}
              className="text-sm font-medium text-rose-600 hover:text-rose-700"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Select label="Condition" value={offer.condition} onChange={(condition) => updateOffer(index, { condition })} options={['new', 'used']} />
            <Select label="Status" value={offer.status} onChange={(status) => updateOffer(index, { status })} options={['available', 'not_sold_new', 'not_enough_data', 'not_sold_in_pt', 'unknown']} />
            <Select label="Market scope" value={offer.marketScope} onChange={(marketScope) => updateOffer(index, { marketScope })} options={['official_pt', 'used_pt', 'imported_to_pt', 'new_import', 'unknown']} />
            <Field label="Price from" value={offer.priceFrom} onChange={(priceFrom) => updateOffer(index, { priceFrom })} type="number" />
            <Field label="Price to" value={offer.priceTo} onChange={(priceTo) => updateOffer(index, { priceTo })} type="number" />
            <Field label="Price date" value={offer.priceDate} onChange={(priceDate) => updateOffer(index, { priceDate })} />
            <Field label="Model year" value={offer.modelYear} onChange={(modelYear) => updateOffer(index, { modelYear })} type="number" />
            <Field label="Year from" value={offer.yearFrom} onChange={(yearFrom) => updateOffer(index, { yearFrom })} type="number" />
            <Field label="Year to" value={offer.yearTo} onChange={(yearTo) => updateOffer(index, { yearTo })} type="number" />
            <Checkbox label="Includes VAT" checked={offer.includesVat} onChange={(includesVat) => updateOffer(index, { includesVat })} />
            <Select label="Source type" value={offer.sourceType} onChange={(sourceType) => updateOffer(index, { sourceType })} options={['official_brand', 'dealer', 'classifieds', 'market_estimate', 'manual', 'unknown']} />
            <Select label="Confidence" value={offer.confidence} onChange={(confidence) => updateOffer(index, { confidence })} options={['high', 'medium', 'low', 'unknown']} />
            <Field label="Source label" value={offer.sourceLabel} onChange={(sourceLabel) => updateOffer(index, { sourceLabel })} />
            <Field label="Source URL" value={offer.sourceUrl} onChange={(sourceUrl) => updateOffer(index, { sourceUrl })} />
            <Field label="Display priority" value={offer.displayPriority} onChange={(displayPriority) => updateOffer(index, { displayPriority })} type="number" />
            <Field label="Origin markets" value={offer.originMarkets} onChange={(originMarkets) => updateOffer(index, { originMarkets })} placeholder="DE, FR, ES" />
            <Select label="PT costs included" value={offer.estimatedPortugalCostsIncluded} onChange={(estimatedPortugalCostsIncluded) => updateOffer(index, { estimatedPortugalCostsIncluded })} options={['', 'true', 'false']} />
            <Field label="Notes" value={offer.notes} onChange={(notes) => updateOffer(index, { notes })} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...offers, createOffer(offers.length)])}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500"
      >
        Add offer
      </button>
    </div>
  )
}
