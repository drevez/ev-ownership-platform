import { NextResponse } from 'next/server'
import { recommendEVs } from '@/lib/recommendation/recommendEVs'
import { DEFAULT_LANGUAGE, isSupportedLanguage } from '@/config/i18n'
import type { QuizAnswers } from '@/types/recommendation'

const fallbackAnswers: QuizAnswers = {
  budget: 45000,
  purchaseType: 'either',
  chargingAccess: 'mixed',
  familySize: 2,
  dailyCommuteKm: 30,
  roadTrips: 'sometimes',
  cargoNeed: 'medium',
  bodyPreference: 'any',
  ownershipStyle: 'balanced',
  priorities: ['budget', 'range', 'charging'],
}

function parseNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : fallback
}

function parseAnswers(input: Partial<QuizAnswers>): QuizAnswers {
  return {
    ...fallbackAnswers,
    ...input,
    budget: parseNumber(input.budget, fallbackAnswers.budget),
    familySize: parseNumber(input.familySize, fallbackAnswers.familySize),
    dailyCommuteKm: parseNumber(input.dailyCommuteKm, fallbackAnswers.dailyCommuteKm),
    priorities:
      Array.isArray(input.priorities) && input.priorities.length > 0
        ? input.priorities
        : fallbackAnswers.priorities,
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<QuizAnswers> & {
      locale?: unknown
    }
    const answers = parseAnswers(body)
    const requestedLocale =
      typeof body.locale === 'string' ? body.locale : undefined
    const locale = isSupportedLanguage(requestedLocale)
      ? requestedLocale
      : DEFAULT_LANGUAGE
    const results = await recommendEVs(answers, 6, locale)

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Failed to build recommendations:', error)
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const legacyHomeCharging = searchParams.get('homeCharging') === '1'

  const answers = parseAnswers({
    budget: Number(searchParams.get('budget') ?? fallbackAnswers.budget),
    chargingAccess: legacyHomeCharging ? 'home' : 'mixed',
    roadTrips:
      searchParams.get('roadTrips') === 'never'
        ? 'rarely'
        : searchParams.get('roadTrips') === 'often'
          ? 'often'
          : 'sometimes',
    familySize: Number(searchParams.get('familySize') ?? fallbackAnswers.familySize),
    dailyCommuteKm: Number(searchParams.get('dailyCommuteKm') ?? fallbackAnswers.dailyCommuteKm),
  })
  const requestedLocale = searchParams.get('lang')
  const locale = isSupportedLanguage(requestedLocale)
    ? requestedLocale
    : DEFAULT_LANGUAGE

  const results = await recommendEVs(answers, 6, locale)

  return NextResponse.json({ results })
}
