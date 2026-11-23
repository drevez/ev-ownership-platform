import type { VehicleData } from '@/lib/loadVehicle'
import { getVehiclePriceFromEur, getVehiclePriceSummaries } from '@/lib/normalizeVehicle'
import { LANGUAGE_LOCALES, type Language } from '@/config/i18n'

const copy = {
  pt: { title: 'Acabamentos e preços', trim: 'Acabamento', price: 'Novo desde', range: 'Autonomia WLTP', note: 'Os acabamentos partilham a mesma configuração técnica. Os dados e o equipamento da ficha principal correspondem a {trim}; preço, equipamento e autonomia homologada podem variar por acabamento.', unknown: 'Por confirmar', conditions: 'Fonte e condições' },
  en: { title: 'Equipment trims and prices', trim: 'Equipment trim', price: 'New from', range: 'WLTP range', note: 'These trims share the same technical configuration. The main specifications and equipment refer to {trim}; price, equipment and homologated range may vary by trim.', unknown: 'To be confirmed', conditions: 'Source and terms' },
  es: { title: 'Acabados y precios', trim: 'Acabado', price: 'Nuevo desde', range: 'Autonomía WLTP', note: 'Los acabados comparten la misma configuración técnica. Los datos y el equipamiento de la ficha principal corresponden a {trim}; el precio, el equipamiento y la autonomía homologada pueden variar según el acabado.', unknown: 'Por confirmar', conditions: 'Fuente y condiciones' },
}

export function EquipmentTrimsCard({ vehicle, locale }: { vehicle: VehicleData; locale: Language }) {
  const trims = vehicle.equipmentTrims
  if (!trims || trims.length < 2) return null
  const t = copy[locale]
  const money = new Intl.NumberFormat(LANGUAGE_LOCALES[locale], { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

  return (
    <section className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-3 text-2xl font-bold text-slate-900">{t.title}</h2>
      <p className="mb-5 text-sm leading-6 text-slate-600">{t.note.replace('{trim}', trims[0].label)}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="border-b border-slate-200 text-slate-900">
            <tr><th scope="col" className="py-3 pr-4">{t.trim}</th><th scope="col" className="py-3 pr-4">{t.price}</th><th scope="col" className="py-3">{t.range}</th></tr>
          </thead>
          <tbody>
            {trims.map(trim => {
              const price = getVehiclePriceFromEur(trim.pricing)
              const summary = getVehiclePriceSummaries(trim.pricing)[0]
              return <tr key={trim.id} className="border-b border-slate-100 last:border-0">
                <th scope="row" className="py-3 pr-4 font-medium">{trim.label}</th>
                <td className="py-3 pr-4">
                  <span className="whitespace-nowrap">{price == null ? t.unknown : money.format(price)}</span>
                  {summary?.notes && <details className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                    <summary className="cursor-pointer">{t.conditions}</summary>
                    <p className="mt-2">{summary.notes}</p>
                    {summary.sourceUrl && <a href={summary.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline">{summary.sourceLabel || t.conditions}</a>}
                  </details>}
                </td>
                <td className="whitespace-nowrap py-3">{trim.wltpRangeKm == null ? t.unknown : `${trim.wltpRangeKm} km`}</td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
