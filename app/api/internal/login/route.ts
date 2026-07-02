import { NextResponse } from 'next/server'

import {
  createInternalAuthCookieValue,
  INTERNAL_AUTH_COOKIE,
  validateInternalCredentials,
} from '@/lib/internalAuth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    username?: unknown
    password?: unknown
  } | null

  const username = typeof body?.username === 'string' ? body.username : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!validateInternalCredentials(username, password)) {
    return NextResponse.json(
      { error: 'Invalid credentials.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const cookieValue = createInternalAuthCookieValue()
  if (!cookieValue) {
    return NextResponse.json(
      { error: 'Internal authentication is not configured.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const response = NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'no-store' },
  })

  response.cookies.set(INTERNAL_AUTH_COOKIE, cookieValue, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}
