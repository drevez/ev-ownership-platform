import { notFound } from 'next/navigation'
import { loadVehicle, getVehicleParams } from '@/logic/loadVehicle'
import { VehiclePage as VehicleDetailsPage } from '@/components/vehicle/VehiclePage'

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

  if (!vehicle) {
    return {
      title: 'Vehicle Not Found'
    }
  }

  const displayName =
    vehicle.localized?.pt?.displayName || vehicle.model || 'Vehicle'

  return {
    title: `${displayName} | EV Platform`,
    description: `Detailed specifications for the ${displayName}`
  }
}

export default async function VehiclePage({ params }: VehiclePageProps) {
  const resolvedParams = await params
  const vehicle = await loadVehicle(resolvedParams.id)

  if (!vehicle) {
    notFound()
  }

  return <VehicleDetailsPage vehicle={vehicle} />
}
