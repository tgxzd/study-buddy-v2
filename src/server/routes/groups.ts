import { Router } from 'express'
import { authenticate, type AuthRequest } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

/**
 * GET /api/groups/search?q=query
 * Search for groups by name (public endpoint - no auth required)
 */
router.get('/search', asyncHandler(async (req: AuthRequest, res) => {
  const { prisma } = await import('../config/database')

  const query = req.query.q as string

  if (!query || query.trim().length === 0) {
    return res.json({ groups: [] })
  }

  const groups = await prisma.studyGroup.findMany({
    where: {
      name: {
        contains: query.trim(),
        mode: 'insensitive',
      },
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    take: 20,
  })

  res.json({ groups })
}))

// All other group routes require authentication
router.use(authenticate)

/**
 * GET /api/groups
 * List all groups the user is a member of
 */
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { prisma } = await import('../config/database')

  const groups = await prisma.studyGroup.findMany({
    where: {
      members: {
        some: {
          userId: req.user!.id,
        },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          members: true,
          files: true,
          sessions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  res.json({ groups })
}))

/**
 * POST /api/groups
 * Create a new group
 */
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { createGroupSchema } = await import('../utils/validation')
  const { createGroup } = await import('../services/groupService')

  const validatedData = createGroupSchema.parse(req.body)

  const group = await createGroup(validatedData, req.user!.id)

  res.status(201).json({ group })
}))

/**
 * GET /api/groups/:id
 * Get group details
 */
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupById } = await import('../services/groupService')
  const { isGroupMember } = await import('../services/groupService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  // Check if user is member
  const isMember = await isGroupMember(req.params.id, req.user!.id)

  if (!isMember) {
    return res.status(403).json({ error: 'Not a member of this group' })
  }

  res.json({ group })
}))

/**
 * PATCH /api/groups/:id
 * Update group (only owner)
 */
router.patch('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { updateGroupSchema } = await import('../utils/validation')
  const { getGroupById, updateGroup } = await import('../services/groupService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  if (group.ownerId !== req.user!.id) {
    return res.status(403).json({ error: 'Only group owner can update' })
  }

  const validatedData = updateGroupSchema.parse(req.body)

  const updatedGroup = await updateGroup(req.params.id, validatedData, req.user!.id)

  res.json({ group: updatedGroup })
}))

/**
 * DELETE /api/groups/:id
 * Delete group (only owner)
 */
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupById, deleteGroup } = await import('../services/groupService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  if (group.ownerId !== req.user!.id) {
    return res.status(403).json({ error: 'Only group owner can delete' })
  }

  await deleteGroup(req.params.id, req.user!.id)

  res.json({ message: 'Group deleted successfully' })
}))

/**
 * POST /api/groups/:id/join
 * Request to join a group
 */
router.post('/:id/join', asyncHandler(async (req: AuthRequest, res) => {
  const { createJoinRequest } = await import('../services/joinRequestService')
  const { getGroupById } = await import('../services/groupService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  // Check if already a member
  const isMember = group.members.some((m) => m.user.id === req.user!.id)
  if (isMember) {
    return res.status(400).json({ error: 'You are already a member of this group' })
  }

  const request = await createJoinRequest(req.params.id, req.user!.id)

  res.status(201).json({ request })
}))

/**
 * POST /api/groups/join-by-code
 * Join a group by invite code (auto-joins without approval)
 */
router.post('/join-by-code', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupByInviteCode, addGroupMember } = await import('../services/groupService')

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Invite code is required' })
  }

  const group = await getGroupByInviteCode(code)

  if (!group) {
    return res.status(404).json({ error: 'Invalid invite code' })
  }

  // Check if already a member
  const isMember = group.members.some((m) => m.user.id === req.user!.id)
  if (isMember) {
    return res.status(400).json({ error: 'You are already a member of this group' })
  }

  // Auto-join - add directly without request
  await addGroupMember(group.id, req.user!.id)

  res.json({
    message: 'Successfully joined the group!',
    groupId: group.id,
  })
}))

/**
 * GET /api/groups/:id/requests
 * Get pending join requests (only owner)
 */
router.get('/:id/requests', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupById } = await import('../services/groupService')
  const { getPendingRequests } = await import('../services/joinRequestService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  if (group.ownerId !== req.user!.id) {
    return res.status(403).json({ error: 'Only group owner can view requests' })
  }

  const requests = await getPendingRequests(req.params.id)

  res.json({ requests })
}))

/**
 * POST /api/groups/:id/requests/handle
 * Accept or reject a join request (only owner)
 */
router.post('/:id/requests/handle', asyncHandler(async (req: AuthRequest, res) => {
  const { handleJoinRequestSchema } = await import('../utils/validation')
  const { getGroupById } = await import('../services/groupService')
  const { acceptJoinRequest, rejectJoinRequest } = await import('../services/joinRequestService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  if (group.ownerId !== req.user!.id) {
    return res.status(403).json({ error: 'Only group owner can handle requests' })
  }

  const validatedData = handleJoinRequestSchema.parse(req.body)

  if (validatedData.action === 'accept') {
    const request = await acceptJoinRequest(validatedData.requestId, req.user!.id)
    res.json({ request })
  } else {
    const request = await rejectJoinRequest(validatedData.requestId, req.user!.id)
    res.json({ request })
  }
}))

/**
 * DELETE /api/groups/:id/requests/:requestId
 * Cancel a join request (user's own request)
 */
router.delete('/:id/requests/:requestId', asyncHandler(async (req: AuthRequest, res) => {
  const { cancelJoinRequest } = await import('../services/joinRequestService')

  await cancelJoinRequest(req.params.requestId, req.user!.id)

  res.json({ message: 'Request cancelled successfully' })
}))

/**
 * POST /api/groups/:id/leave
 * Leave a group (members only, not owner)
 */
router.post('/:id/leave', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupById, removeGroupMember } = await import('../services/groupService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  // Owner cannot leave their own group (they must delete or transfer ownership)
  if (group.ownerId === req.user!.id) {
    return res.status(400).json({ error: 'Group owner cannot leave. Delete the group instead.' })
  }

  // Check if user is a member
  const isMember = group.members.some((m) => m.user.id === req.user!.id)
  if (!isMember) {
    return res.status(400).json({ error: 'You are not a member of this group' })
  }

  await removeGroupMember(req.params.id, req.user!.id)

  res.json({ message: 'Successfully left the group' })
}))

/**
 * DELETE /api/groups/:id/members/:memberId
 * Kick a member from the group (owner only)
 */
router.delete('/:id/members/:memberId', asyncHandler(async (req: AuthRequest, res) => {
  const { getGroupById, removeGroupMember } = await import('../services/groupService')

  const group = await getGroupById(req.params.id)

  if (!group) {
    return res.status(404).json({ error: 'Group not found' })
  }

  // Only owner can kick members
  if (group.ownerId !== req.user!.id) {
    return res.status(403).json({ error: 'Only group owner can kick members' })
  }

  // Cannot kick the owner
  if (req.params.memberId === group.ownerId) {
    return res.status(400).json({ error: 'Cannot kick the group owner' })
  }

  await removeGroupMember(req.params.id, req.params.memberId)

  res.json({ message: 'Member removed successfully' })
}))

export default router
