import Link from 'next/link'
import { VehicleHero } from './VehicleHero'
import { SpecsGrid } from './SpecsGrid'
import { BatteryAndChargingCard } from './BatteryAndChargingCard'
import { ComfortAndFeaturesCard } from './ComfortAndFeaturesCard'
import { EfficiencyCard } from './EfficiencyCard'
import { DimensionsCard } from './DimensionsCard'
import { PricingCard } from './PricingCard'
import type { VehicleData } from '@/lib/loadVehicle'
import { VehicleComparisonSection } from './VehicleComparisonSection'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { LANGUAGE_LOCALES, type Language } from '@/config/i18n'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import { getTranslations } from '@/lib/getTranslations'
import { getVehicleDisplayName, getVehiclePriceFromEur } from '@/lib/normalizeVehicle'
import { absoluteUrl } from '@/lib/siteUrl'

interface VehiclePageProps {
  vehicle: VehicleData
  modelSlug?: string
  variantCount?: number
  locale?: Language
}

export function VehiclePage({
  vehicle,
  modelSlug,
  variantCount = 1,
  locale = 'pt',
}: VehiclePageProps) {
  const t = getTranslations(locale)
  const displayName = getVehicleDisplayName(vehicle, locale)
  const modelName = `${vehicle.brand} ${vehicle.model}`
  const brandHref = buildLocalizedHref(
    `/models?brand=${encodeURIComponent(vehicle.brand)}`,
    locale
  )
  const modelHref = modelSlug
    ? buildLocalizedHref(`/models/${modelSlug}`, locale)
    : buildLocalizedHref('/models', locale)
  const price = getVehiclePriceFromEur(vehicle.pricing)
  const image = vehicle.image || VEHICLE_PLACEHOLDER_IMAGE
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: displayName,
    brand: {
      '@type': 'Brand',
      name: vehicle.brand,
    },
    model: vehicle.model,
    image: image.startsWith('/') ? absoluteUrl(image) : image,
    category: vehicle.bodyType ?? 'Electric vehicle',
    description: t.vehicle.description.replace('{vehicle}', displayName),
    offers: price
      ? {
          '@type': 'Offer',
          price,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(buildLocalizedHref(`/vehicles/${vehicle.id}`, locale)),
        }
      : undefined,
    inLanguage: LANGUAGE_LOCALES[locale],
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3 text-sm">
          <nav className="flex flex-wrap items-center gap-2 text-slate-400" aria-label="Breadcrumb">
            <Link
              href={buildLocalizedHref('/', locale)}
              className="hover:text-white transition"
            >
              {t.modelPage.home}
            </Link>
            <span>/</span>
            <Link
              href={buildLocalizedHref('/models', locale)}
              className="hover:text-white transition"
            >
              {t.models.title}
            </Link>
            <span>/</span>
            <Link
              href={brandHref}
              className="hover:text-white transition"
            >
              {vehicle.brand}
            </Link>
            <span>/</span>
            <Link
              href={modelHref}
              className="text-emerald-400 hover:text-emerald-300 transition"
            >
              {variantCount > 1
                ? t.vehicle.allVersionsOf.replace('{model}', modelName)
                : modelName}
            </Link>
            <span>/</span>
            <span className="text-slate-200">{vehicle.variant ?? displayName}</span>
          </nav>
        </div>
      </div>
      <VehicleHero
        displayName={displayName}
        image={image}
        segment={vehicle.segment}
        bodyType={vehicle.bodyType}
        drivetrain={vehicle.drivetrain}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        <VehicleComparisonSection vehicle={vehicle} displayName={displayName} />
        <SpecsGrid
          brand={vehicle.brand}
          model={vehicle.model}
          variant={vehicle.variant}
          modelYear={vehicle.modelYear}
          doors={vehicle.doors}
          seats={vehicle.seats}
          dimensions={vehicle.dimensions}
        />

        <BatteryAndChargingCard
          battery={vehicle.battery}
          charging={vehicle.charging}
        />

        <ComfortAndFeaturesCard comfort={vehicle.comfort} />

        <EfficiencyCard efficiency={vehicle.efficiency} />

        <DimensionsCard dimensions={vehicle.dimensions} />

        <PricingCard pricing={vehicle.pricing} />
      </div>
    </main>
  )
}
