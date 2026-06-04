'use client'

import type { VehicleBattery, VehicleCharging } from '@/lib/loadVehicle'
import { useTranslations } from '@/hooks/useTranslations'

interface BatteryAndChargingProps {
  battery?: VehicleBattery
  charging?: VehicleCharging
}

export function BatteryAndChargingCard({
  battery = {},
  charging = {},
}: BatteryAndChargingProps) {

  const t = useTranslations()

  const specs = [
    {
      label: t.batteryAndCharging.usableBattery,
      value: battery.batteryUsableKWh
        ? `${battery.batteryUsableKWh} kWh`
        : t.common.notAvailable,
      icon: '🔋',
    },
    {
      label: t.batteryAndCharging.grossBattery,
      value: battery.batteryGrossKWh
        ? `${battery.batteryGrossKWh} kWh`
        : t.common.notAvailable,
      icon: '📦',
    },
    {
      label: t.batteryAndCharging.chemistry,
      value:
        battery.batteryChemistry ||
        t.common.notAvailable,
      icon: '⚗️',
    },
    {
      label: t.batteryAndCharging.dcCharging,
      value: charging.dcMaxChargeKW
        ? `${charging.dcMaxChargeKW} kW`
        : t.common.notAvailable,
      icon: '⚡',
    },
    {
      label: t.batteryAndCharging.acCharging,
      value: charging.acMaxChargeKW
        ? `${charging.acMaxChargeKW} kW`
        : t.common.notAvailable,
      icon: '🏠',
    },
    {
      label: t.batteryAndCharging.voltage,
      value: battery.voltageArchitecture
        ? `${battery.voltageArchitecture}V`
        : t.common.notAvailable,
      icon: '⚙️',
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {t.batteryAndCharging.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {specs.map((spec) => (
          <div
            key={spec.label}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          >

            <div className="flex items-center gap-2 mb-2">

              <span className="text-2xl">
                {spec.icon}
              </span>

              <p className="text-sm font-medium text-slate-600">
                {spec.label}
              </p>
            </div>

            <p className="text-xl font-bold text-slate-900">
              {spec.value}
            </p>
          </div>
        ))}
      </div>

      {/* Features */}
      {(charging.plugAndChargeSupport ||
        charging.teslaSuperchargerAccess) && (
        <div className="mt-6 pt-6 border-t border-slate-200">

          <h3 className="font-semibold text-slate-900 mb-3">
            {t.batteryAndCharging.features}
          </h3>

          <div className="flex flex-wrap gap-2">

            {charging.plugAndChargeSupport && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ {t.batteryAndCharging.plugAndCharge}
              </span>
            )}

            {charging.teslaSuperchargerAccess && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ {t.batteryAndCharging.teslaSupercharger}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
