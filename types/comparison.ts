export interface VehicleRegistry {
  id: string
  brand: string
  model: string
  variant: string
  segment: string
  bodyType: string
  drivetrain: string
  heroImage?: string
  image?: string
}

export interface VehicleDataForComparison {
  id: string
  brand: string
  model: string
  variant: string
  image: string
  segment: string
  bodyType: string
  drivetrain: string
  doors?: number
  seats?: number
  modelYear?: number
  detailPath?: string
  variantCount?: number
  
  // Core specs
  battery?: {
    capacityKwh?: number
    usableKwh?: number
    type?: string
  }
  
  charging?: {
    maxPowerKw?: number
    chargeTime10To80Min?: number
    acChargeSpeedKw?: number
    dcChargeSpeedKw?: number
    standardCharger?: string
  }
  
  efficiency?: {
    wltpRangeKm?: number
    wltpConsumptionKwh100km?: number
    realWorldRangeKm?: number
    realWorldConsumption?: number
  }
  
  dimensions?: {
    lengthMm?: number
    widthMm?: number
    heightMm?: number
    wheelbaseMm?: number
    trunkCapacityL?: number
  }
  
  pricing?: {
    basePriceEur?: number
    recommendedPriceEur?: number
    highestPriceEur?: number
    primaryPrice?: {
      kind?: 'new' | 'used' | 'importedUsed'
      status?: string
      marketScope?: string
      priceFrom?: number
      priceTo?: number
      modelYear?: number
      yearFrom?: number
      yearTo?: number
      isLegacy?: boolean
    }
    priceSummaries?: {
      kind?: 'new' | 'used' | 'importedUsed'
      status?: string
      marketScope?: string
      priceFrom?: number
      priceTo?: number
      modelYear?: number
      yearFrom?: number
      yearTo?: number
      isLegacy?: boolean
    }[]
  }
  
  comfort?: {
    features?: string[]
    heatPumpAvailable?: boolean
    vehicleToLoad?: boolean
    vehicleToGrid?: boolean
    panoramicRoof?: boolean
    softwareExperienceLevel?: number
    maintenanceLevel?: number
    insuranceLevel?: number
  }
  
  performance?: {
    maxSpeedKmh?: number
    acceleration0To100Ms?: number
    horsepowerBhp?: number
    torqueNm?: number
  }
}

export interface ComparisonVehicle extends VehicleDataForComparison {
  displayName: string
  bestFor?: string[]
  badges?: ComparisonBadge[]
}

export interface ComparisonState {
  vehicleIds: string[]
  vehicles: ComparisonVehicle[]
  isLoading: boolean
  error: string | null
}

export interface ComparisonBadge {
  label: string
  category: 'range' | 'value' | 'charging' | 'efficiency' | 'performance'
  description?: string
}

export interface ComparisonMetric {
  label: string
  category: 'primary' | 'secondary'
  unit?: string
  values: {
    vehicleId: string
    value: string | number | boolean | null | undefined
    displayValue: string
    isWinner?: boolean
    percentageOfMax?: number
  }[]
}

export interface ComparisonSummary {
  bestValue: string
  bestRange: string
  fastestCharging: string
  mostEfficient: string
  recommendation: string
}
