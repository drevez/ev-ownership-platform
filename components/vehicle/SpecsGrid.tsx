interface SpecsGridProps {
  brand: string
  model: string
  variant: string
  modelYear: number
  doors?: number
  seats?: number
  dimensions?: {
    lengthMm?: number
    widthMm?: number
    heightMm?: number
    wheelbaseMm?: number
  }
}

export function SpecsGrid({
  brand,
  model,
  variant,
  modelYear,
  doors,
  seats,
  dimensions = {}
}: SpecsGridProps) {
  const specs = [
    {
      label: 'Brand',
      value: brand,
      icon: '🏢'
    },
    {
      label: 'Model',
      value: model,
      icon: '🚗'
    },
    {
      label: 'Variant',
      value: variant,
      icon: '⭐'
    },
    {
      label: 'Model Year',
      value: modelYear,
      icon: '📅'
    },
    ...(doors ? [{
      label: 'Doors',
      value: doors,
      icon: '🚪'
    }] : []),
    ...(seats ? [{
      label: 'Seats',
      value: seats,
      icon: '💺'
    }] : []),
    ...(dimensions.lengthMm ? [{
      label: 'Length',
      value: `${dimensions.lengthMm} mm`,
      icon: '📏'
    }] : []),
    ...(dimensions.widthMm ? [{
      label: 'Width',
      value: `${dimensions.widthMm} mm`,
      icon: '↔️'
    }] : []),
    ...(dimensions.heightMm ? [{
      label: 'Height',
      value: `${dimensions.heightMm} mm`,
      icon: '📐'
    }] : []),
    ...(dimensions.wheelbaseMm ? [{
      label: 'Wheelbase',
      value: `${dimensions.wheelbaseMm} mm`,
      icon: '🛞'
    }] : [])
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Specifications</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {specs.map((spec) => (
          <div key={spec.label} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{spec.icon}</span>
              <p className="text-sm font-medium text-slate-600">{spec.label}</p>
            </div>
            <p className="text-lg font-bold text-slate-900">{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
