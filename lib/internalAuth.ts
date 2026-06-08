const INTERNAL_AUTH_USERNAME = process.env.INTERNAL_AUTH_USERNAME
const INTERNAL_AUTH_PASSWORD = process.env.INTERNAL_AUTH_PASSWORD

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

  const credentials = readBasicCredentials(request)
  if (!credentials) return false

  return (
    constantTimeEqual(credentials.username, INTERNAL_AUTH_USERNAME) &&
    constantTimeEqual(credentials.password, INTERNAL_AUTH_PASSWORD)
  )
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
