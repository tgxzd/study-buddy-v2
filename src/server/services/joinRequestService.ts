import { prisma } from '../config/database'

// Define join request status type locally (not importing from Prisma due to Vite SSR issues)
export type JoinRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

/**
 * Create a join request
 */
export async function createJoinRequest(groupId: string, userId: string) {
  // Check if request already exists
  const existingRequest = await prisma.groupJoinRequest.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })

  if (existingRequest) {
    if (existingRequest.status === 'PENDING') {
      throw new Error('You already have a pending request for this group')
    }
    if (existingRequest.status === 'ACCEPTED') {
      throw new Error('You are already a member of this group')
    }
    // If rejected, allow creating a new request
  }

  const request = await prisma.groupJoinRequest.create({
    data: {
      groupId,
      userId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return request
}

/**
 * Accept a join request
 */
export async function acceptJoinRequest(requestId: string, ownerId: string) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      group: {
        select: {
          ownerId: true,
        },
      },
    },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  if (request.group.ownerId !== ownerId) {
    throw new Error('Only the group owner can accept requests')
  }

  if (request.status !== 'PENDING') {
    throw new Error('Request has already been processed')
  }

  // Update request status and add user to group in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update request
    const updatedRequest = await tx.groupJoinRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Add user to group
    await tx.groupMember.create({
      data: {
        groupId: request.groupId,
        userId: request.userId,
      },
    })

    return updatedRequest
  })

  return result
}

/**
 * Reject a join request
 */
export async function rejectJoinRequest(requestId: string, ownerId: string) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      group: {
        select: {
          ownerId: true,
        },
      },
    },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  if (request.group.ownerId !== ownerId) {
    throw new Error('Only the group owner can reject requests')
  }

  if (request.status !== 'PENDING') {
    throw new Error('Request has already been processed')
  }

  const updatedRequest = await prisma.groupJoinRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return updatedRequest
}

/**
 * Cancel a join request (user's own request)
 */
export async function cancelJoinRequest(requestId: string, userId: string) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: { id: requestId },
  })

  if (!request) {
    throw new Error('Request not found')
  }

  if (request.userId !== userId) {
    throw new Error('You can only cancel your own requests')
  }

  if (request.status !== 'PENDING') {
    throw new Error('Cannot cancel a processed request')
  }

  await prisma.groupJoinRequest.delete({
    where: { id: requestId },
  })

  return { success: true }
}

/**
 * Get pending requests for a group
 */
export async function getPendingRequests(groupId: string) {
  const requests = await prisma.groupJoinRequest.findMany({
    where: {
      groupId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return requests
}

/**
 * Count pending requests for a group
 */
export async function countPendingRequests(groupId: string): Promise<number> {
  const count = await prisma.groupJoinRequest.count({
    where: {
      groupId,
      status: 'PENDING',
    },
  })

  return count
}

/**
 * Get user's request status for a group
 */
export async function getUserRequestStatus(groupId: string, userId: string) {
  const request = await prisma.groupJoinRequest.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })

  return request
}

/**
 * Get all pending requests count for groups owned by user
 */
export async function getPendingRequestsCountForOwner(userId: string): Promise<number> {
  // Get all groups owned by user
  const groups = await prisma.studyGroup.findMany({
    where: { ownerId: userId },
    select: { id: true },
  })

  const groupIds = groups.map((g) => g.id)

  if (groupIds.length === 0) {
    return 0
  }

  // Count pending requests for these groups
  const count = await prisma.groupJoinRequest.count({
    where: {
      groupId: { in: groupIds },
      status: 'PENDING',
    },
  })

  return count
}
