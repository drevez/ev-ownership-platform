import { NextRequest, NextResponse } from 'next/server'

const VEHICLE_SUGGESTIONS_WEBHOOK_URL = process.env.VEHICLE_SUGGESTIONS_WEBHOOK_URL
const VEHICLE_SUGGESTIONS_WEBHOOK_SECRET = process.env.VEHICLE_SUGGESTIONS_WEBHOOK_SECRET

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
    : ''
}

function webhookHeaders() {
  const headers: HeadersInit = {
    'content-type': 'application/json',
  }

  if (VEHICLE_SUGGESTIONS_WEBHOOK_SECRET) {
    headers.authorization = `Bearer ${VEHICLE_SUGGESTIONS_WEBHOOK_SECRET}`
  }

  return headers
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as Record<string, unknown>

    const event = {
      brand: cleanText(payload.brand, 80),
      model: cleanText(payload.model, 120),
      variant: cleanText(payload.variant, 120),
      marketContext: cleanText(payload.marketContext, 40),
      note: cleanText(payload.note, 800),
      sourcePage: cleanText(payload.sourcePage, 300),
      sourceComponent: cleanText(payload.sourceComponent, 80),
      locale: cleanText(payload.locale, 12),
      queryNormalized: cleanText(payload.queryNormalized, 80),
      resultCount: Number.isFinite(Number(payload.resultCount))
        ? Math.max(0, Math.round(Number(payload.resultCount)))
        : 0,
      userAgent: cleanText(request.headers.get('user-agent'), 240),
      referrer: cleanText(request.headers.get('referer'), 500),
      createdAt: new Date().toISOString(),
    }

    if (!event.model) {
      return NextResponse.json({ error: 'Missing vehicle model.' }, { status: 400 })
    }

    if (!event.sourcePage) {
      return NextResponse.json({ error: 'Missing source page.' }, { status: 400 })
    }

    if (!VEHICLE_SUGGESTIONS_WEBHOOK_URL) {
      return NextResponse.json({ stored: false })
    }

    const response = await fetch(VEHICLE_SUGGESTIONS_WEBHOOK_URL, {
      method: 'POST',
      headers: webhookHeaders(),
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error(`Vehicle suggestion webhook failed (${response.status})`)
    }

    return NextResponse.json({ stored: true })
  } catch (error) {
    console.error('Vehicle suggestion failed:', error)
    return NextResponse.json({ error: 'Vehicle suggestion failed.' }, { status: 500 })
  }
}

