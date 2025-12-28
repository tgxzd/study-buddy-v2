import { Router } from 'express'
import { authenticate, type AuthRequest } from '../middleware/authMiddleware'
import { asyncHandler } from '../middleware/errorHandler'

const router = Router()

// All dashboard routes require authentication
router.use(authenticate)

/**
 * GET /api/dashboard/stats
 * Get user dashboard statistics
 */
router.get('/stats', asyncHandler(async (req: AuthRequest, res) => {
  const { prisma } = await import('../config/database')

  // Get user's groups
  const groups = await prisma.studyGroup.findMany({
    where: {
      members: {
        some: {
          userId: req.user!.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          members: true,
          files: true,
          sessions: true,
        },
      },
    },
  })

  // Calculate total stats
  const totalFiles = groups.reduce((sum, g) => sum + g._count.files, 0)
  const totalSessions = groups.reduce((sum, g) => sum + g._count.sessions, 0)

  res.json({
    stats: {
      groups: groups.length,
      files: totalFiles,
      sessions: totalSessions,
    },
  })
}))

export default router
