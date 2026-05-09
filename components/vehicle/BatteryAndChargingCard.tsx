interface BatteryData {
  batteryGrossKWh?: number
  batteryUsableKWh?: number
  batteryChemistry?: string
  voltageArchitecture?: number
}

interface ChargingData {
  dcMaxChargeKW?: number
  acMaxChargeKW?: number
  plugAndChargeSupport?: boolean
  teslaSuperchargerAccess?: boolean
}

interface BatteryAndChargingProps {
  battery?: BatteryData
  charging?: ChargingData
}

export function BatteryAndChargingCard({ battery = {}, charging = {} }: BatteryAndChargingProps) {
  const specs = [
    {
      label: 'Usable Battery',
      value: battery.batteryUsableKWh ? `${battery.batteryUsableKWh} kWh` : 'N/A',
      icon: '🔋'
    },
    {
      label: 'Gross Battery',
      value: battery.batteryGrossKWh ? `${battery.batteryGrossKWh} kWh` : 'N/A',
      icon: '📦'
    },
    {
      label: 'Chemistry',
      value: battery.batteryChemistry || 'N/A',
      icon: '⚗️'
    },
    {
      label: 'DC Charging',
      value: charging.dcMaxChargeKW ? `${charging.dcMaxChargeKW} kW` : 'N/A',
      icon: '⚡'
    },
    {
      label: 'AC Charging',
      value: charging.acMaxChargeKW ? `${charging.acMaxChargeKW} kW` : 'N/A',
      icon: '🏠'
    },
    {
      label: 'Voltage',
      value: battery.voltageArchitecture ? `${battery.voltageArchitecture}V` : 'N/A',
      icon: '⚙️'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Battery & Charging</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specs.map((spec) => (
          <div key={spec.label} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{spec.icon}</span>
              <p className="text-sm font-medium text-slate-600">{spec.label}</p>
            </div>
            <p className="text-xl font-bold text-slate-900">{spec.value}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      {(charging.plugAndChargeSupport || charging.teslaSuperchargerAccess) && (
        <div className="mt-6 pt-6 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
          <div className="flex flex-wrap gap-2">
            {charging.plugAndChargeSupport && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Plug & Charge
              </span>
            )}
            {charging.teslaSuperchargerAccess && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Tesla Supercharger
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
