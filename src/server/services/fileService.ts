import { prisma } from '../config/database'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/validation'

/**
 * Upload a file to the group
 */
export async function uploadFile(file: File, groupId: string, uploaderId: string) {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 5MB limit`)
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('File type not allowed')
  }

  // Convert file to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Save to database
  const uploadedFile = await prisma.file.create({
    data: {
      filename: file.name,
      data: buffer,
      size: file.size,
      mimeType: file.type,
      groupId,
      uploaderId,
    },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return uploadedFile
}

/**
 * Get file by ID
 */
export async function getFileById(id: string) {
  const file = await prisma.file.findUnique({
    where: { id },
    include: {
      uploader: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return file
}

/**
 * List all files in a group
 */
export async function listGroupFiles(groupId: string) {
  const files = await prisma.file.findMany({
    where: { groupId },
    select: {
      id: true,
      filename: true,
      size: true,
      mimeType: true,
      createdAt: true,
      uploader: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return files
}

/**
 * Delete a file
 */
export async function deleteFile(id: string, userId: string, isOwner: boolean = false) {
  const file = await prisma.file.findUnique({
    where: { id },
    select: {
      uploaderId: true,
      group: {
        select: {
          ownerId: true,
        },
      },
    },
  })

  if (!file) {
    throw new Error('File not found')
  }

  // Check if user is uploader or group owner
  if (file.uploaderId !== userId && !isOwner) {
    throw new Error('You can only delete your own files')
  }

  await prisma.file.delete({
    where: { id },
  })

  return { success: true }
}
