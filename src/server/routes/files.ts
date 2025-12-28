import { Router } from 'express'
import multer from 'multer'
import { authenticate, type AuthRequest } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'
import { uploadFile, getFileById, listGroupFiles, deleteFile } from '../services/fileService'

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// All file routes require authentication
router.use(authenticate)

/**
 * POST /api/files/upload
 * Upload a file to a group
 */
router.post('/upload', upload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  const { isGroupMember } = await import('../services/groupService')

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const groupId = req.body.groupId
  if (!groupId) {
    return res.status(400).json({ error: 'Group ID is required' })
  }

  // Check if user is a member of the group
  const isMember = await isGroupMember(groupId, req.user!.id)
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a member of the group to upload files' })
  }

  // Convert multer file to File-like object
  const file = new File([req.file.buffer as unknown as BlobPart], req.file.originalname, {
    type: req.file.mimetype,
  })

  // Upload file
  const uploadedFile = await uploadFile(file, groupId, req.user!.id)

  res.status(201).json({ file: uploadedFile })
}))

/**
 * GET /api/files/group/:groupId
 * List all files in a group
 */
router.get('/group/:groupId', asyncHandler(async (req: AuthRequest, res) => {
  const { isGroupMember } = await import('../services/groupService')

  // Check if user is a member of the group
  const isMember = await isGroupMember(req.params.groupId, req.user!.id)
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a member of the group to view files' })
  }

  const files = await listGroupFiles(req.params.groupId)

  res.json({ files })
}))

/**
 * GET /api/files/:id/download
 * Download a file
 */
router.get('/:id/download', asyncHandler(async (req: AuthRequest, res) => {
  const file = await getFileById(req.params.id)

  if (!file) {
    return res.status(404).json({ error: 'File not found' })
  }

  const { isGroupMember } = await import('../services/groupService')

  // Check if user is a member of the group
  const isMember = await isGroupMember(file.groupId, req.user!.id)
  if (!isMember) {
    return res.status(403).json({ error: 'You must be a member of the group to download files' })
  }

  // Send file with proper headers
  res.setHeader('Content-Type', file.mimeType)
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`)
  res.setHeader('Content-Length', file.size.toString())
  res.send(file.data)
}))

/**
 * DELETE /api/files/:id
 * Delete a file
 */
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const file = await getFileById(req.params.id)

  if (!file) {
    return res.status(404).json({ error: 'File not found' })
  }

  const { getGroupById } = await import('../services/groupService')
  const group = await getGroupById(file.groupId)

  const isOwner = group?.ownerId === req.user!.id

  await deleteFile(req.params.id, req.user!.id, isOwner)

  res.json({ message: 'File deleted successfully' })
}))

export default router
