interface ComfortData {
  heatPumpAvailable?: boolean
  vehicleToLoad?: boolean
  vehicleToGrid?: boolean
  panoramicRoof?: boolean
  softwareExperienceLevel?: number
  maintenanceLevel?: number
  insuranceLevel?: number
}

interface ComfortAndFeaturesProps {
  comfort?: ComfortData
}

export function ComfortAndFeaturesCard({ comfort = {} }: ComfortAndFeaturesProps) {
  const features = [
    {
      label: 'Heat Pump',
      value: comfort.heatPumpAvailable,
      icon: '🌡️'
    },
    {
      label: 'Vehicle to Load',
      value: comfort.vehicleToLoad,
      icon: '🔌'
    },
    {
      label: 'Vehicle to Grid',
      value: comfort.vehicleToGrid,
      icon: '⚡'
    },
    {
      label: 'Panoramic Roof',
      value: comfort.panoramicRoof,
      icon: '🪟'
    }
  ]

  const ratings = [
    {
      label: 'Software Experience',
      level: comfort.softwareExperienceLevel,
      icon: '💻'
    },
    {
      label: 'Maintenance',
      level: comfort.maintenanceLevel,
      icon: '🔧'
    },
    {
      label: 'Insurance',
      level: comfort.insuranceLevel,
      icon: '📋'
    }
  ]

  const hasFeatures = features.some(f => f.value !== undefined)
  const hasRatings = ratings.some(r => r.level !== undefined)

  if (!hasFeatures && !hasRatings) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Comfort & Features</h2>

      {hasFeatures && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {features.map((feature) => {
              if (feature.value === undefined) return null
              return (
                <div
                  key={feature.label}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    feature.value
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span
                    className={`font-medium ${
                      feature.value ? 'text-green-900' : 'text-slate-600'
                    }`}
                  >
                    {feature.label}
                  </span>
                  <span
                    className={`ml-auto text-sm font-bold ${
                      feature.value ? 'text-green-600' : 'text-slate-400'
                    }`}
                  >
                    {feature.value ? '✓' : '✗'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasRatings && (
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Ratings</h3>
          <div className="space-y-3">
            {ratings.map((rating) => {
              if (rating.level === undefined) return null
              return (
                <div key={rating.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{rating.icon}</span>
                      <span className="font-medium text-slate-900">
                        {rating.label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                      {rating.level}/5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(rating.level / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
