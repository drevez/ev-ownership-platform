import registryData from '@/data/registry/vehicles.json'
import type {
  QuizAnswers,
  RecommendationResult
} from '@/types/recommendation'

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path)

    if (!response.ok) {
      return null
    }

    const text = await response.text()
    if (!text.trim()) {
      return null
    }

    try {
      const data = JSON.parse(text) as T
      return data
    } catch (parseError) {
      return null
    }
  } catch (error) {
    return null
  }
}

function calculateMatchPercentage(score: number) {
  const maxScore = 14
  return Math.min(100, Math.round((score / maxScore) * 100))
}

function buildReasonList(user: QuizAnswers, vehicle: any) {
  const reasons: string[] = []

  if (vehicle.pricing?.pt?.usedPrice) {
    if (vehicle.pricing.pt.usedPrice.max <= user.budget) {
      reasons.push(`Fits comfortably within your €${user.budget.toLocaleString()} budget`)
    } else if (vehicle.pricing.pt.usedPrice.min <= user.budget) {
      reasons.push(`Close to your €${user.budget.toLocaleString()} budget with used pricing`)
    } else {
      reasons.push(`Premium pricing for a specific fit`)
    }
  }

  if (!user.homeCharging) {
    if (vehicle.charging?.dcMaxChargeKW >= 170) {
      reasons.push(`Since you do not have home charging, this vehicle's very fast ${vehicle.charging.dcMaxChargeKW}kW charging is a major advantage`)
    } else if (vehicle.charging?.dcMaxChargeKW >= 150) {
      reasons.push(`Strong ${vehicle.charging.dcMaxChargeKW}kW DC charging for no-home-charging living`)
    }

    if (vehicle.efficiency?.realWorldConsumptionWhKm <= 165) {
      reasons.push(`Efficient enough for frequent public charging`)
    }
  }

  if (user.roadTrips === 'often') {
    if (vehicle.charging?.dcMaxChargeKW >= 170) {
      reasons.push(`Excellent fit for frequent long trips with fast charging`)
    } else if (vehicle.charging?.dcMaxChargeKW >= 150) {
      reasons.push(`Good charging performance for road trips`)
    }
  }

  const commuteRange = vehicle.efficiency?.estimatedRealRangeKm ?? 0
  if (user.dailyCommuteKm > 0) {
    if (commuteRange >= user.dailyCommuteKm * 2) {
      reasons.push(`Your ${user.dailyCommuteKm}km daily commute is easily covered even in winter conditions`)
    } else if (commuteRange >= user.dailyCommuteKm) {
      reasons.push(`Range should cover your ${user.dailyCommuteKm}km commute`)
    }
  }

  if (user.familySize >= 4) {
    if ((vehicle.battery?.batteryUsableKWh ?? 0) >= 65) {
      reasons.push(`Good ${vehicle.battery.batteryUsableKWh}kWh battery capacity for family driving`)
    }
  }

  if (vehicle.charging?.dcMaxChargeKW >= 170) {
    reasons.push(`Very fast charging for longer trips`)
  }

  return reasons.slice(0, 5)
}

function buildTags(vehicle: any) {
  const tags: string[] = []

  if ((vehicle.battery?.batteryUsableKWh ?? 0) >= 65) {
    tags.push('Best for families')
  }

  if (vehicle.charging?.dcMaxChargeKW >= 150) {
    tags.push('Best for apartment charging')
  }

  if (vehicle.charging?.dcMaxChargeKW >= 170) {
    tags.push('Best for road trips')
  }

  if (vehicle.pricing?.pt?.usedPrice?.min <= 30000) {
    tags.push('Best budget option')
  }

  if (vehicle.efficiency?.realWorldConsumptionWhKm <= 160) {
    tags.push('Efficient commuter')
  }

  return tags.slice(0, 3)
}

function estimateMonthlyCost(vehicle: any, user: QuizAnswers) {
  // More realistic estimate: assume 1200km/month (average European driving)
  // Electricity cost €0.28/kWh (includes taxes and distribution)
  // 85% charging efficiency
  const monthlyKm = 1200
  const electricityCostPerKWh = 0.28
  const chargingEfficiency = 0.85
  const consumption = vehicle.efficiency?.realWorldConsumptionWhKm ?? 180

  // Calculate energy used per month
  const kWhUsed = (monthlyKm * consumption) / 100

  // Account for charging efficiency and electricity cost
  const totalCost = (kWhUsed / chargingEfficiency) * electricityCostPerKWh

  return Math.round(totalCost)
}

function buildDrawbacks(vehicle: any, user: QuizAnswers) {
  const drawbacks: string[] = []

  if (!user.homeCharging && vehicle.charging?.dcMaxChargeKW < 150) {
    drawbacks.push('Slower charging without home charger')
  }

  if (user.familySize >= 4 && (vehicle.battery?.batteryUsableKWh ?? 0) < 60) {
    drawbacks.push('Smaller battery for larger families')
  }

  if (vehicle.pricing?.pt?.usedPrice?.min > user.budget) {
    drawbacks.push('Higher purchase price')
  }

  if (vehicle.efficiency?.estimatedRealRangeKm < user.dailyCommuteKm * 1.5) {
    drawbacks.push('Limited range for your commute')
  }

  return drawbacks.slice(0, 3)
}

export async function recommendEVs(
  user: QuizAnswers
): Promise<RecommendationResult[]> {
  const registry = registryData as any[]

  if (!registry || registry.length === 0) {
    return []
  }

  const enriched = await Promise.all(
    registry.map(async (vehicle) => {
      const base = `/data/vehicles/${vehicle.id}`

      const [charging, efficiency, pricing, comfort, battery] =
        await Promise.all([
          fetchJson<any>(`${base}/charging.json`),
          fetchJson<any>(`${base}/efficiency.json`),
          fetchJson<any>(`${base}/pricing.json`),
          fetchJson<any>(`${base}/comfort.json`),
          fetchJson<any>(`${base}/battery.json`)
        ])

      if (!charging || !efficiency || !pricing) {
        return null
      }

      return {
        ...vehicle,
        charging,
        efficiency,
        pricing,
        comfort,
        battery
      }
    })
  )

  const scored: RecommendationResult[] = enriched
    .filter(Boolean)
    .map((vehicle: any) => {
      let score = 0

      if (vehicle.pricing?.pt?.usedPrice) {
        if (vehicle.pricing.pt.usedPrice.max <= user.budget) {
          score += 3
        } else if (vehicle.pricing.pt.usedPrice.min <= user.budget) {
          score += 1
        }
      }

      if (!user.homeCharging) {
        if (vehicle.charging?.dcMaxChargeKW >= 170) {
          score += 4
        } else if (vehicle.charging?.dcMaxChargeKW >= 150) {
          score += 2
        }
      }

      if (user.roadTrips === 'often') {
        if (vehicle.charging?.dcMaxChargeKW >= 170) {
          score += 2
        } else if (vehicle.charging?.dcMaxChargeKW >= 150) {
          score += 1
        }
      }

      const commuteRange = vehicle.efficiency?.estimatedRealRangeKm ?? 0
      if (user.dailyCommuteKm > 0) {
        if (commuteRange >= user.dailyCommuteKm * 2) {
          score += 3
        } else if (commuteRange >= user.dailyCommuteKm) {
          score += 1
        }
      }

      if (user.familySize >= 4) {
        if ((vehicle.battery?.batteryUsableKWh ?? 0) >= 65) {
          score += 2
        }
      }

      if (vehicle.charging?.dcMaxChargeKW >= 170) {
        score += 1
      }

      return {
        vehicle,
        score,
        reasons: buildReasonList(user, vehicle),
        matchPercentage: calculateMatchPercentage(score),
        tags: buildTags(vehicle),
        estimatedMonthlyCost: estimateMonthlyCost(vehicle, user),
        drawbacks: buildDrawbacks(vehicle, user)
      }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, 3)
}
