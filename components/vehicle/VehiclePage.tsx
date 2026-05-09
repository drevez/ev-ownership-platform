import { VehicleHero } from './VehicleHero'
import { SpecsGrid } from './SpecsGrid'
import { BatteryAndChargingCard } from './BatteryAndChargingCard'
import { ComfortAndFeaturesCard } from './ComfortAndFeaturesCard'
import { EfficiencyCard } from './EfficiencyCard'
import { DimensionsCard } from './DimensionsCard'
import { PricingCard } from './PricingCard'
import { VehicleData } from '@/logic/loadVehicle'

interface VehiclePageProps {
  vehicle: VehicleData
}

export function VehiclePage({ vehicle }: VehiclePageProps) {
  const displayName =
    vehicle.localized?.pt?.displayName ||
    `${vehicle.brand} ${vehicle.model}` ||
    'Vehicle'

  return (
    <main className="bg-slate-50 min-h-screen">
      <VehicleHero
        displayName={displayName}
        image={vehicle.image || '/cars/placeholder.webp'}
        segment={vehicle.segment}
        bodyType={vehicle.bodyType}
        drivetrain={vehicle.drivetrain}
      />

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
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
