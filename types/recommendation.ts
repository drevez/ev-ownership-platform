import type { ComparisonVehicle } from '@/types/comparison'

export type RoadTripFrequency = 'rarely' | 'sometimes' | 'often'
export type ChargingAccess = 'home' | 'work' | 'public' | 'mixed'
export type PurchaseType = 'new' | 'used' | 'either'
export type CargoNeed = 'light' | 'medium' | 'large'
export type BodyPreference =
  | 'any'
  | 'hatchback'
  | 'sedan'
  | 'suv'
  | 'wagon'
  | 'mpv'
export type OwnershipStyle = 'lowest_cost' | 'balanced' | 'premium'
export type OwnershipPriority =
  | 'budget'
  | 'range'
  | 'charging'
  | 'space'
  | 'efficiency'
  | 'comfort'
  | 'performance'

export interface QuizAnswers {
  budget: number
  purchaseType: PurchaseType
  chargingAccess: ChargingAccess
  familySize: number
  dailyCommuteKm: number
  roadTrips: RoadTripFrequency
  cargoNeed: CargoNeed
  bodyPreference: BodyPreference
  ownershipStyle: OwnershipStyle
  priorities: OwnershipPriority[]
}

export interface RecommendationBreakdownItem {
  category:
    | 'budget'
    | 'range'
    | 'charging'
    | 'space'
    | 'efficiency'
    | 'comfort'
    | 'preference'
    | 'confidence'
  label: string
  score: number
  maxScore: number
  reason: string
}

export interface RecommendationKeySpecs {
  priceFromEur?: number
  priceKind?: 'new' | 'used' | 'importedUsed'
  priceModelYear?: number
  priceYearFrom?: number
  priceYearTo?: number
  usableBatteryKwh?: number
  realRangeKm?: number
  motorwayRangeKm?: number
  dcChargeKw?: number
  charge10to80Min?: number
  consumptionWhKm?: number
  trunkLiters?: number
  seats?: number
}

export interface RecommendationResult {
  vehicle: ComparisonVehicle
  score: number
  matchPercentage: number
  confidence: 'high' | 'medium' | 'low'
  dataCompleteness: number
  reasons: string[]
  drawbacks: string[]
  tags: string[]
  estimatedMonthlyCost: number
  priceDeltaEur?: number
  breakdown: RecommendationBreakdownItem[]
  keySpecs: RecommendationKeySpecs
}
