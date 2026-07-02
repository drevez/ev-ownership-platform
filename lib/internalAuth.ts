const INTERNAL_AUTH_USERNAME = process.env.INTERNAL_AUTH_USERNAME
const INTERNAL_AUTH_PASSWORD = process.env.INTERNAL_AUTH_PASSWORD
export const INTERNAL_AUTH_COOKIE = 'motorzero_internal_auth'

function expectedCookieValue() {
  if (!INTERNAL_AUTH_USERNAME || !INTERNAL_AUTH_PASSWORD) return null
  return btoa(`${INTERNAL_AUTH_USERNAME}:${INTERNAL_AUTH_PASSWORD}`)
}

function constantTimeEqual(left: string, right: string) {
  const length = Math.max(left.length, right.length)
  let difference = left.length ^ right.length

  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0)
  }

  return difference === 0
}

function readBasicCredentials(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Basic ')) return null

  try {
    const decoded = atob(authorization.slice(6))
    const separatorIndex = decoded.indexOf(':')
    if (separatorIndex < 0) return null

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1),
    }
  } catch {
    return null
  }
}

export function isInternalAuthorized(request: Request) {
  if (!INTERNAL_AUTH_USERNAME || !INTERNAL_AUTH_PASSWORD) return false

  const cookieHeader = request.headers.get('cookie')
  const cookieValue = cookieHeader
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${INTERNAL_AUTH_COOKIE}=`))
    ?.slice(INTERNAL_AUTH_COOKIE.length + 1)
  const expectedCookie = expectedCookieValue()

  if (
    cookieValue &&
    expectedCookie &&
    constantTimeEqual(decodeURIComponent(cookieValue), expectedCookie)
  ) {
    return true
  }

  const credentials = readBasicCredentials(request)
  if (!credentials) return false

  return (
    constantTimeEqual(credentials.username, INTERNAL_AUTH_USERNAME) &&
    constantTimeEqual(credentials.password, INTERNAL_AUTH_PASSWORD)
  )
}

export function validateInternalCredentials(username: string, password: string) {
  if (!INTERNAL_AUTH_USERNAME || !INTERNAL_AUTH_PASSWORD) return false

  return (
    constantTimeEqual(username, INTERNAL_AUTH_USERNAME) &&
    constantTimeEqual(password, INTERNAL_AUTH_PASSWORD)
  )
}

export function createInternalAuthCookieValue() {
  return expectedCookieValue()
}

export function internalApiUnauthorizedResponse() {
  return Response.json(
    { error: 'Authentication required.' },
    {
      status: 401,
      headers: {
        'Cache-Control': 'no-store',
        'WWW-Authenticate': 'Basic realm="MotorZero Internal", charset="UTF-8"',
      },
    }
  )
}
