import { formatPrice } from '@/logic/formatters'

interface PricingData {
  pt?: {
    currency?: string
    consumerPrice?: { min?: number; max?: number }
    businessPriceExVat?: { min?: number; max?: number }
    usedPrice?: { min?: number; max?: number }
    updatedAt?: string
  }
  [key: string]: any
}

interface PricingCardProps {
  pricing?: PricingData
}

function PriceRange({ label, data, currency, isHighlight }: { label: string; data?: { min?: number; max?: number }; currency?: string; isHighlight?: boolean }) {
  if (!data || !data.min) return null

  const minPrice = formatPrice(data.min, currency)
  const maxPrice = data.max ? formatPrice(data.max, currency) : null

  return (
    <div className={`rounded-xl p-6 border-2 transition-all ${
      isHighlight
        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg'
        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
    }`}>
      <p className={`text-sm font-semibold mb-3 ${isHighlight ? 'text-blue-900' : 'text-slate-600'}`}>
        {label}
      </p>
      <div className="space-y-1">
        <p className={`text-3xl font-bold ${isHighlight ? 'text-blue-900' : 'text-slate-900'}`}>
          {minPrice}
        </p>
        {maxPrice && (
          <p className="text-sm text-slate-600">
            to {maxPrice}
          </p>
        )}
      </div>
    </div>
  )
}

export function PricingCard({ pricing = {} }: PricingCardProps) {
  const ptPricing = pricing.pt

  if (!ptPricing || !ptPricing.consumerPrice) {
    return null
  }

  const currency = ptPricing.currency || 'EUR'
  const consumerMin = ptPricing.consumerPrice?.min
  const consumerMax = ptPricing.consumerPrice?.max
  const usedMin = ptPricing.usedPrice?.min
  const usedMax = ptPricing.usedPrice?.max
  const hasSavings =
    typeof consumerMin === 'number' &&
    typeof consumerMax === 'number' &&
    typeof usedMin === 'number' &&
    typeof usedMax === 'number' &&
    consumerMin > 0 &&
    consumerMax > 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Pricing</h2>
          <p className="text-sm text-slate-500 mt-1">Portugal Market Prices</p>
        </div>
        {ptPricing.updatedAt && (
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <span className="text-xs font-medium text-slate-600">Updated:</span>
            <span className="text-xs font-semibold text-slate-900">{ptPricing.updatedAt}</span>
          </div>
        )}
      </div>

      {/* Main pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <PriceRange
          label="Consumer Price"
          data={ptPricing.consumerPrice}
          currency={currency}
          isHighlight={true}
        />
        <PriceRange
          label="Business (ex VAT)"
          data={ptPricing.businessPriceExVat}
          currency={currency}
        />
        <PriceRange
          label="Used Vehicle"
          data={ptPricing.usedPrice}
          currency={currency}
        />
      </div>

      {/* Footer info */}
      {hasSavings && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Expected savings:</span> Used vehicles typically offer {Math.round(((consumerMin - usedMax) / consumerMin) * 100)}% to {Math.round(((consumerMax - usedMin) / consumerMax) * 100)}% savings over new.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
