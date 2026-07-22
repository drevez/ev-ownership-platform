import { NextRequest, NextResponse } from 'next/server'

const FEEDBACK_WEBHOOK_URL = process.env.FEEDBACK_WEBHOOK_URL
const FEEDBACK_WEBHOOK_SECRET = process.env.FEEDBACK_WEBHOOK_SECRET

type FeedbackKind = 'vote' | 'note'

interface FeedbackStats {
  helpfulCount: number
  notHelpfulCount: number
  totalCount: number
}

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : ''
}

function normalizeBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

function normalizeKind(value: unknown): FeedbackKind {
  return value === 'note' ? 'note' : 'vote'
}

function normalizeStats(value: unknown): FeedbackStats | null {
  if (!value || typeof value !== 'object') return null

  const maybeStats = value as Partial<FeedbackStats>
  const helpfulCount = Number(maybeStats.helpfulCount)
  const notHelpfulCount = Number(maybeStats.notHelpfulCount)
  const totalCount = Number(maybeStats.totalCount)

  if (
    !Number.isFinite(helpfulCount) ||
    !Number.isFinite(notHelpfulCount) ||
    !Number.isFinite(totalCount)
  ) {
    return null
  }

  return {
    helpfulCount: Math.max(0, Math.round(helpfulCount)),
    notHelpfulCount: Math.max(0, Math.round(notHelpfulCount)),
    totalCount: Math.max(0, Math.round(totalCount)),
  }
}

function webhookHeaders() {
  const headers: HeadersInit = {
    'content-type': 'application/json',
  }

  if (FEEDBACK_WEBHOOK_SECRET) {
    headers.authorization = `Bearer ${FEEDBACK_WEBHOOK_SECRET}`
  }

  return headers
}

export async function GET(request: NextRequest) {
  const pagePath = cleanText(request.nextUrl.searchParams.get('pagePath'), 300)

  if (!pagePath || !FEEDBACK_WEBHOOK_URL) {
    return NextResponse.json({ stats: null })
  }

  try {
    const webhookUrl = new URL(FEEDBACK_WEBHOOK_URL)
    webhookUrl.searchParams.set('action', 'stats')
    webhookUrl.searchParams.set('pagePath', pagePath)

    const response = await fetch(webhookUrl, {
      headers: webhookHeaders(),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`Feedback stats failed (${response.status})`)

    const data = await response.json() as { stats?: unknown }
    return NextResponse.json({ stats: normalizeStats(data.stats) })
  } catch (error) {
    console.error('Feedback stats request failed:', error)
    return NextResponse.json({ stats: null }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as Record<string, unknown>
    const helpful = normalizeBoolean(payload.helpful)

    if (helpful == null) {
      return NextResponse.json({ error: 'Invalid feedback vote.' }, { status: 400 })
    }

    const event = {
      kind: normalizeKind(payload.kind),
      helpful,
      pagePath: cleanText(payload.pagePath, 300),
      pageUrl: cleanText(payload.pageUrl, 500),
      locale: cleanText(payload.locale, 12),
      message: cleanText(payload.message, 1200),
      viewport: cleanText(payload.viewport, 40),
      userAgent: cleanText(request.headers.get('user-agent'), 240),
      referrer: cleanText(request.headers.get('referer'), 500),
      createdAt: new Date().toISOString(),
    }

    if (!event.pagePath) {
      return NextResponse.json({ error: 'Missing page path.' }, { status: 400 })
    }

    if (!FEEDBACK_WEBHOOK_URL) {
      return NextResponse.json({ stored: false, stats: null })
    }

    const response = await fetch(FEEDBACK_WEBHOOK_URL, {
      method: 'POST',
      headers: webhookHeaders(),
      body: JSON.stringify(event),
    })

    if (!response.ok) throw new Error(`Feedback webhook failed (${response.status})`)

    const data = await response.json().catch(() => ({})) as { stats?: unknown }
    return NextResponse.json({
      stored: true,
      stats: normalizeStats(data.stats),
    })
  } catch (error) {
    console.error('Feedback submission failed:', error)
    return NextResponse.json({ error: 'Feedback submission failed.' }, { status: 500 })
  }
}
