import { NextResponse } from 'next/server'
import { recommendEVs } from '@/logic/recommendation/recommendEVs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const budget = Number(searchParams.get('budget') ?? '45000')
  const homeCharging = searchParams.get('homeCharging') === '1'
  const roadTrips = (
    searchParams.get('roadTrips') ?? 'often'
  ) as 'never' | 'sometimes' | 'often'

  const familySize = Number(searchParams.get('familySize') ?? '2')
  const dailyCommuteKm = Number(searchParams.get('dailyCommuteKm') ?? '30')

  const results = await recommendEVs({
    budget,
    homeCharging,
    familySize,
    dailyCommuteKm,
    roadTrips
  })

  return NextResponse.json({ results })
}
