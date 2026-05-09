export type RoadTripFrequency = 'never' | 'sometimes' | 'often'

export interface QuizAnswers {
  budget: number
  homeCharging: boolean
  familySize: number
  dailyCommuteKm: number
  roadTrips: RoadTripFrequency
}

export interface RecommendationResult {
  vehicle: any
  score: number
  matchPercentage: number
  reasons: string[]
  tags: string[]
  estimatedMonthlyCost: number
  drawbacks: string[]
}
