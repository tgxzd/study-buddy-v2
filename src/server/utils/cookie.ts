const COOKIE_NAME = 'jwt'
const MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

/**
 * Create an HTTP-only cookie string for JWT token
 */
export function createAuthCookie(token: string): string {
  const cookieAttributes = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'SameSite=lax',
    `Max-Age=${MAX_AGE}`,
    'Path=/',
  ]

  // Add Secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieAttributes.push('Secure')
  }

  return cookieAttributes.join('; ')
}

/**
 * Create a cookie string to clear the JWT token
 */
export function clearAuthCookie(): string {
  return [
    `${COOKIE_NAME}=`,
    'HttpOnly',
    'SameSite=lax',
    'Max-Age=0',
    'Path=/',
  ].join('; ')
}

/**
 * Parse JWT from cookie string
 */
export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map((c) => c.trim())
  const jwtCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`))

  if (!jwtCookie) return null

  return jwtCookie.substring(COOKIE_NAME.length + 1)
}
