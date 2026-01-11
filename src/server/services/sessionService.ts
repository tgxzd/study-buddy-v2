import { prisma } from '../config/database'

export interface CreateSessionInput {
  title: string
  description?: string
  date: Date
  link?: string
  location?: string
  groupId: string
  createdBy: string
}

export interface UpdateSessionInput {
  title?: string
  description?: string
  date?: Date
  link?: string
  location?: string
}

/**
 * Create a new study session
 */
export async function createSession(data: CreateSessionInput) {
  const session = await prisma.studySession.create({
    data: {
      title: data.title,
      description: data.description,
      date: data.date,
      link: data.link,
      location: data.location,
      groupId: data.groupId,
      createdBy: data.createdBy,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return session
}

/**
 * Get session by ID
 */
export async function getSessionById(id: string) {
  const session = await prisma.studySession.findUnique({
    where: { id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return session
}

/**
 * Get all sessions for a group
 */
export async function getSessionsByGroup(groupId: string) {
  const sessions = await prisma.studySession.findMany({
    where: { groupId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return sessions
}

/**
 * Get upcoming sessions for a group (sessions in the future)
 */
export async function getUpcomingSessions(groupId: string) {
  const now = new Date()
  const sessions = await prisma.studySession.findMany({
    where: {
      groupId,
      date: {
        gte: now,
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return sessions
}

/**
 * Get past sessions for a group
 */
export async function getPastSessions(groupId: string) {
  const now = new Date()
  const sessions = await prisma.studySession.findMany({
    where: {
      groupId,
      date: {
        lt: now,
      },
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return sessions
}

/**
 * Update session (creator or group owner only)
 */
export async function updateSession(id: string, data: UpdateSessionInput) {
  const session = await prisma.studySession.update({
    where: { id },
    data,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return session
}

/**
 * Delete session
 */
export async function deleteSession(id: string) {
  await prisma.studySession.delete({
    where: { id },
  })
}

/**
 * Check if user is session creator
 */
export async function isSessionCreator(sessionId: string, userId: string): Promise<boolean> {
  const session = await prisma.studySession.findUnique({
    where: { id: sessionId },
    select: { createdBy: true },
  })

  return session?.createdBy === userId
}

/**
 * Check if user is a member of a group
 */
export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const member = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId,
        groupId,
      },
    },
  })

  return !!member
}
