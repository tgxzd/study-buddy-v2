import { prisma } from '../config/database'
import type { CreateGroupInput, UpdateGroupInput } from '../utils/validation'

/**
 * Generate a unique 6-character invite code
 */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // No ambiguous characters like I, 1, O, 0
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Create a new study group
 * Note: The owner is automatically added as a member when creating a group
 */
export async function createGroup(data: CreateGroupInput, ownerId: string) {
  // Generate unique invite code
  let inviteCode = generateInviteCode()
  let codeExists = await prisma.studyGroup.findUnique({ where: { inviteCode } })

  // Keep generating until we get a unique code
  while (codeExists) {
    inviteCode = generateInviteCode()
    codeExists = await prisma.studyGroup.findUnique({ where: { inviteCode } })
  }

  const group = await prisma.studyGroup.create({
    data: {
      name: data.name,
      description: data.description,
      inviteCode,
      ownerId,
      members: {
        create: {
          userId: ownerId,
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
        },
      },
    },
  })

  return group
}

/**
 * Get group by ID
 */
export async function getGroupById(id: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id },
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
        orderBy: {
          joinedAt: 'asc',
        },
      },
      _count: {
        select: {
          members: true,
          joinRequests: true,
          files: true,
          sessions: true,
          chatMessages: true,
        },
      },
    },
  })

  return group
}

/**
 * Get group by invite code
 */
export async function getGroupByInviteCode(inviteCode: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { inviteCode },
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
  })

  return group
}

/**
 * List all groups
 */
export async function listGroups() {
  const groups = await prisma.studyGroup.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return groups
}

/**
 * List groups that a user is a member of
 */
export async function getUserGroups(userId: string) {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  })

  return memberships.map((m) => ({
    ...m.group,
    isOwner: m.group.ownerId === userId,
    joinedAt: m.joinedAt,
  }))
}

/**
 * Update group
 */
export async function updateGroup(id: string, data: UpdateGroupInput, userId: string) {
  // Check if user is the owner
  const group = await prisma.studyGroup.findUnique({
    where: { id },
    select: { ownerId: true },
  })

  if (!group) {
    throw new Error('Group not found')
  }

  if (group.ownerId !== userId) {
    throw new Error('Only the group owner can update the group')
  }

  const updatedGroup = await prisma.studyGroup.update({
    where: { id },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return updatedGroup
}

/**
 * Delete group
 */
export async function deleteGroup(id: string, userId: string) {
  // Check if user is the owner
  const group = await prisma.studyGroup.findUnique({
    where: { id },
    select: { ownerId: true },
  })

  if (!group) {
    throw new Error('Group not found')
  }

  if (group.ownerId !== userId) {
    throw new Error('Only the group owner can delete the group')
  }

  await prisma.studyGroup.delete({
    where: { id },
  })

  return { success: true }
}

/**
 * Check if user is a member of a group
 */
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })

  return !!membership
}

/**
 * Add user to group
 */
export async function addGroupMember(groupId: string, userId: string) {
  const member = await prisma.groupMember.create({
    data: {
      groupId,
      userId,
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
  })

  return member
}

/**
 * Remove user from group
 */
export async function removeGroupMember(groupId: string, userId: string) {
  await prisma.groupMember.delete({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })

  return { success: true }
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string) {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
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
      joinedAt: 'asc',
    },
  })

  return members
}
