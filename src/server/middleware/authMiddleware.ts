import type { Request, Response, NextFunction } from 'express'
import { getUserFromToken } from '../services/authService'
import { getTokenFromCookies } from '../utils/cookie'

export interface AuthRequest extends Request {
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = getTokenFromCookies(req.headers.cookie || null)

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const user = await getUserFromToken(token)

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' })
  }
}

export function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const token = getTokenFromCookies(req.headers.cookie || null)

  if (token) {
    getUserFromToken(token)
      .then((user) => {
        if (user) req.user = user
        next()
      })
      .catch(() => next())
  } else {
    next()
  }
}
