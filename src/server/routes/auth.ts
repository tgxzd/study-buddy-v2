import { Router } from 'express'
import { registerUser, loginUser, getUserById } from '../services/authService'
import { registerSchema, loginSchema } from '../utils/validation'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()
const COOKIE_NAME = 'jwt'
const OLD_COOKIE_NAME = 'auth_token' // Legacy cookie name for migration
const MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds (for res.cookie)
const SESSION_AGE = 24 * 60 * 60 * 1000 // 24 hours for session cookies (fallback)

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(async (req, res) => {
  // Validate input
  const validatedData = registerSchema.parse(req.body)

  // Register user
  const user = await registerUser(validatedData)

  // Generate token
  const { generateToken } = await import('../config/jwt')
  const token = await generateToken({
    userId: user.id,
    email: user.email,
  })

  // Check if user wants to be remembered
  const rememberMe = req.body.rememberMe === true

  // Set HTTP-only cookie using Express res.cookie
  // If rememberMe is false, use shorter expiration (24 hours)
  // If rememberMe is true, use longer expiration (7 days)
  const cookieOptions: any = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false, // Set to true once HTTPS is configured with Nginx
  }

  if (rememberMe) {
    cookieOptions.maxAge = MAX_AGE // 7 days
  } else {
    cookieOptions.maxAge = SESSION_AGE // 24 hours - shorter for non-persistent sessions
  }

  res.cookie(COOKIE_NAME, token, cookieOptions)
  // Clear old cookie name if exists
  res.clearCookie(OLD_COOKIE_NAME, { path: '/' })

  console.log('[REGISTER] Cookie set for user:', user.email, 'rememberMe:', rememberMe, 'maxAge:', cookieOptions.maxAge)

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })
}))

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', asyncHandler(async (req, res) => {
  // Validate input
  const validatedData = loginSchema.parse(req.body)

  // Login user
  const result = await loginUser(validatedData)

  // Check if user wants to be remembered
  const rememberMe = req.body.rememberMe === true

  // Set HTTP-only cookie using Express res.cookie
  // If rememberMe is false, use shorter expiration (24 hours)
  // If rememberMe is true, use longer expiration (7 days)
  const cookieOptions: any = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false, // Set to true once HTTPS is configured with Nginx
  }

  if (rememberMe) {
    cookieOptions.maxAge = MAX_AGE // 7 days
  } else {
    cookieOptions.maxAge = SESSION_AGE // 24 hours - shorter for non-persistent sessions
  }

  res.cookie(COOKIE_NAME, result.token, cookieOptions)
  // Clear old cookie name if exists
  res.clearCookie(OLD_COOKIE_NAME, { path: '/' })

  console.log('[LOGIN] Cookie set for user:', result.user.email, 'rememberMe:', rememberMe, 'maxAge:', cookieOptions.maxAge)

  res.json({
    user: result.user,
  })
}))

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', asyncHandler(async (_req, res) => {
  // Clear both old and new cookie names
  res.clearCookie(COOKIE_NAME, { path: '/' })
  res.clearCookie(OLD_COOKIE_NAME, { path: '/' })
  res.json({ message: 'Logged out successfully' })
}))

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', asyncHandler(async (req, res) => {
  // Cookie is parsed by cookie-parser middleware
  const cookies = (req as any).cookies
  // Check for new cookie name first, then fall back to old name for backward compatibility
  const token = cookies?.jwt || cookies?.auth_token

  console.log('[AUTH ME] Cookies:', cookies)
  console.log('[AUTH ME] Token:', token ? 'found' : 'not found')

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const { verifyToken } = await import('../config/jwt')
  const payload = await verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const user = await getUserById(payload.userId)

  if (!user) {
    return res.status(401).json({ error: 'User not found' })
  }

  res.json({ user })
}))

export default router
