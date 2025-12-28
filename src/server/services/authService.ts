import { prisma } from '../config/database'
import { hashPassword, verifyPassword } from '../utils/password'
import { generateToken } from '../config/jwt'
import type { RegisterInput, LoginInput } from '../utils/validation'

/**
 * Register a new user
 */
export async function registerUser(data: RegisterInput) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    throw new Error('User already exists with this email')
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return user
}

/**
 * Login user and return token
 */
export async function loginUser(data: LoginInput) {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    throw new Error('Invalid email or password')
  }

  // Verify password
  const isValidPassword = await verifyPassword(data.password, user.password)

  if (!isValidPassword) {
    throw new Error('Invalid email or password')
  }

  // Generate token
  const token = await generateToken({
    userId: user.id,
    email: user.email,
  })

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  }
}

/**
 * Get user by ID
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

/**
 * Verify JWT token and return user
 */
export async function getUserFromToken(token: string) {
  const { verifyToken } = await import('../config/jwt')
  const payload = await verifyToken(token)

  if (!payload) {
    return null
  }

  const user = await getUserById(payload.userId)
  return user
}
