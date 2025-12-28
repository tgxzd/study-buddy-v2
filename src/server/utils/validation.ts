import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Group Schemas
export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters').max(100, 'Group name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
})

export const joinGroupSchema = z.object({
  groupCode: z.string().min(1, 'Group code is required'),
})

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
})

// Join Request Schemas
export const createJoinRequestSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
})

export const handleJoinRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  action: z.enum(['accept', 'reject'], {
    message: 'Action must be either accept or reject',
  }),
})

// File Schemas
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB in bytes
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'text/plain',
]

export const uploadFileSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  file: z.any(),
})

// Session Schemas
export const createSessionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  date: z.string().or(z.date()),
  link: z.string().url('Invalid meeting link').optional().or(z.literal('')),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  groupId: z.string().min(1, 'Group ID is required'),
})

export const updateSessionSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).optional(),
  date: z.string().or(z.date()).optional(),
  link: z.string().url().optional().or(z.literal('')),
  location: z.string().max(200).optional(),
})

// Chat Schemas
export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message must be less than 2000 characters'),
  groupId: z.string().min(1, 'Group ID is required'),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateGroupInput = z.infer<typeof createGroupSchema>
export type JoinGroupInput = z.infer<typeof joinGroupSchema>
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>
export type CreateJoinRequestInput = z.infer<typeof createJoinRequestSchema>
export type HandleJoinRequestInput = z.infer<typeof handleJoinRequestSchema>
export type UploadFileInput = z.infer<typeof uploadFileSchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
