import { Router } from 'express'
import { authenticate, type AuthRequest } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

/**
 * POST /api/sessions
 * Create a new study session
 */
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { createSession } = await import('../services/sessionService')
  const { prisma } = await import('../config/database')

  const { title, description, date, link, location, groupId } = req.body

  // Validate required fields
  if (!title || !date || !groupId) {
    return res.status(400).json({ error: 'Title, date, and groupId are required' })
  }

  // Check if user is a member of the group
  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: req.user!.id,
        groupId,
      },
    },
  })

  if (!member) {
    return res.status(403).json({ error: 'You must be a member of this group' })
  }

  const session = await createSession({
    title,
    description,
    date: new Date(date),
    link,
    location,
    groupId,
    createdBy: req.user!.id,
  })

  res.status(201).json({ session })
}))

/**
 * GET /api/sessions/group/:groupId
 * Get all sessions for a group (with optional filtering)
 */
router.get('/group/:groupId', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { getSessionsByGroup, getUpcomingSessions, getPastSessions, isGroupMember } = await import('../services/sessionService')
  const { filter } = req.query

  // Check membership
  const member = await isGroupMember(req.params.groupId, req.user!.id)
  if (!member) {
    return res.status(403).json({ error: 'You must be a member of this group' })
  }

  let sessions
  if (filter === 'upcoming') {
    sessions = await getUpcomingSessions(req.params.groupId)
  } else if (filter === 'past') {
    sessions = await getPastSessions(req.params.groupId)
  } else {
    sessions = await getSessionsByGroup(req.params.groupId)
  }

  res.json({ sessions })
}))

/**
 * GET /api/sessions/:id
 * Get a specific session by ID
 */
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { getSessionById } = await import('../services/sessionService')
  const { prisma } = await import('../config/database')

  const session = await getSessionById(req.params.id)

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  // Check if user is a member of the group
  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: req.user!.id,
        groupId: session.groupId,
      },
    },
  })

  if (!member) {
    return res.status(403).json({ error: 'You must be a member of this group' })
  }

  res.json({ session })
}))

/**
 * PATCH /api/sessions/:id
 * Update a session (creator or group owner only)
 */
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { updateSession } = await import('../services/sessionService')
  const { prisma } = await import('../config/database')

  const session = await prisma.studySession.findUnique({
    where: { id: req.params.id },
  })

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  // Check if user is the creator or the group owner
  const group = await prisma.studyGroup.findUnique({
    where: { id: session.groupId },
  })

  const isCreator = session.createdBy === req.user!.id
  const isOwner = group?.ownerId === req.user!.id

  if (!isCreator && !isOwner) {
    return res.status(403).json({ error: 'Only the creator or group owner can update this session' })
  }

  const { title, description, date, link, location } = req.body

  const updatedSession = await updateSession(req.params.id, {
    title,
    description,
    date: date ? new Date(date) : undefined,
    link,
    location,
  })

  res.json({ session: updatedSession })
}))

/**
 * DELETE /api/sessions/:id
 * Delete a session (creator or group owner only)
 */
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { deleteSession } = await import('../services/sessionService')
  const { prisma } = await import('../config/database')

  const session = await prisma.studySession.findUnique({
    where: { id: req.params.id },
  })

  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }

  // Check if user is the creator or the group owner
  const group = await prisma.studyGroup.findUnique({
    where: { id: session.groupId },
  })

  const isCreator = session.createdBy === req.user!.id
  const isOwner = group?.ownerId === req.user!.id

  if (!isCreator && !isOwner) {
    return res.status(403).json({ error: 'Only the creator or group owner can delete this session' })
  }

  await deleteSession(req.params.id)

  res.json({ message: 'Session deleted successfully' })
}))

export default router
