import { notFound } from 'next/navigation'
import { ViewEventTracker } from '@/components/analytics/ViewEventTracker'
import { loadVehicle, getVehicleParams } from '@/lib/loadVehicle'
import { loadModel, toModelSlug } from '@/lib/models'
import { VehiclePage as VehicleDetailsPage } from '@/components/vehicle/VehiclePage'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'
import { getVehicleDisplayName } from '@/lib/normalizeVehicle'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import {
  buildPageContext,
  pageContextToFlatProperties,
  singleVehicleFlatProperties,
  toAnalyticsVehicle,
} from '@/lib/analytics'

interface VehiclePageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const params = await getVehicleParams()
  return params
}

export async function generateMetadata({ params }: VehiclePageProps) {
  const resolvedParams = await params
  const vehicle = await loadVehicle(resolvedParams.id)
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  if (!vehicle) {
    return {
      title: t.vehicle.notFoundTitle
    }
  }

  const displayName =
    getVehicleDisplayName(vehicle, locale) || vehicle.model || t.vehicle.fallbackName

  return {
    title: `${displayName} | ${t.vehicle.evPlatform}`,
    description: t.vehicle.description.replace('{vehicle}', displayName)
  }
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const resolvedParams = await params
  const locale = await getRequestLanguage()
  const vehicle = await loadVehicle(resolvedParams.id)

  if (!vehicle) {
    notFound()
  }

  const modelSlug = toModelSlug(vehicle.brand, vehicle.model)
  const model = await loadModel(modelSlug)
  const page = buildPageContext({
    path: buildLocalizedHref(`/vehicles/${vehicle.id}`, locale),
    canonicalPath: `/vehicles/${vehicle.id}`,
    type: 'vehicle',
    language: locale,
  })
  const analyticsVehicle = toAnalyticsVehicle(vehicle)
  const vehicleProperties = {
    event_schema_version: 2,
    page,
    vehicles: [analyticsVehicle],
    model_slug: modelSlug,
    ...pageContextToFlatProperties(page),
    ...singleVehicleFlatProperties(analyticsVehicle),
  }

  return (
    <>
      <ViewEventTracker
        event="vehicle_viewed"
        properties={vehicleProperties}
        gaEvent="vehicle_viewed"
        gaProperties={vehicleProperties}
      />
      <VehicleDetailsPage
        vehicle={vehicle}
        modelSlug={modelSlug}
        variantCount={model?.variants.length ?? 1}
        locale={locale}
      />
    </>
  )
}
