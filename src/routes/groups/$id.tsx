import { createFileRoute, Link, useNavigate, Outlet, useMatches } from '@tanstack/react-router'
import { ArrowLeft, Users, Calendar, FileText, Settings, UserPlus, Trash2, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { groupsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface GroupMember {
  user: {
    id: string
    name: string
    email: string
  }
  joinedAt: string
}

interface Group {
  id: string
  name: string
  description: string | null
  inviteCode: string
  ownerId: string
  createdAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  members: GroupMember[]
  _count: {
    members: number
    files: number
    sessions: number
    joinRequests: number
    chatMessages: number
  }
}

export const Route = createFileRoute('/groups/$id')({
  component: GroupDetail,
})

function GroupDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if we're on a child route (edit, files, requests)
  const matches = useMatches()
  // The last match is the deepest active route
  const currentRouteId = matches[matches.length - 1]?.id
  const hasChildRoute = currentRouteId && (
    currentRouteId.includes('/edit') ||
    currentRouteId.includes('/files') ||
    currentRouteId.includes('/requests')
  )

  const isOwner = user?.id === group?.ownerId

  useEffect(() => {
    fetchGroup()
  }, [id])

  const fetchGroup = async () => {
    try {
      setIsLoading(true)
      const response = await groupsApi.getById(id)
      setGroup(response.group)
    } catch (err: any) {
      setError(err.message || 'Failed to load group')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await groupsApi.delete(id)
      navigate({ to: '/groups' })
    } catch (err: any) {
      alert(err.message || 'Failed to delete group')
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  // If we're on a child route, render the outlet for child content
  if (hasChildRoute) {
    return <Outlet />
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-bg-primary pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <Card variant="glass" className="text-center py-8">
            <p className="text-red-400 mb-4">{error || 'Group not found'}</p>
            <Button asChild variant="secondary">
              <Link to="/groups">Back to Groups</Link>
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: '/groups' })}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Groups
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
              <p className="text-text-secondary">{group.description || 'No description'}</p>
            </div>

            <div className="flex gap-3">
              {isOwner && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    to="/groups/$id/edit"
                    params={{ id }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Invite Code */}
        <Card variant="glass" className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Group Invite Code</h2>
              <p className="text-sm text-text-secondary">Share this code with others to let them join the group</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
                <span className="text-xl font-bold text-purple-400 tracking-widest">{group.inviteCode}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(group.inviteCode)
                  alert('Invite code copied to clipboard!')
                }}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{group._count.members}</p>
                <p className="text-xs text-text-muted">Members</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{group._count.files}</p>
                <p className="text-xs text-text-muted">Files</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{group._count.sessions}</p>
                <p className="text-xs text-text-muted">Sessions</p>
              </div>
            </div>
          </Card>

          {isOwner && (
            <Link to="/groups/$id/requests" params={{ id }} className="block">
              <Card variant="glass" className="p-4 hover:scale-[1.02] transition-transform cursor-pointer relative">
                {group._count.joinRequests > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{group._count.joinRequests}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{group._count.joinRequests}</p>
                    <p className="text-xs text-text-muted">Requests</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Members */}
        <Card variant="glass">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Group Members</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {group.members.map((member) => (
                <div
                  key={member.user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-400">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{member.user.name}</p>
                      <p className="text-xs text-text-muted">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.user.id === group.ownerId ? (
                      <span className="px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
                        Owner
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-medium bg-white/10 text-text-secondary rounded-full">
                        Member
                      </span>
                    )}
                    <span className="text-xs text-text-muted">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/groups/$id/files" params={{ id }} className="block">
            <Card variant="glass" className="p-6 hover:scale-[1.02] transition-transform cursor-pointer text-center">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Files</h3>
              <p className="text-sm text-text-muted">Share study materials</p>
            </Card>
          </Link>

          {/* Sessions - Coming Soon */}
          <div className="pointer-events-none">
            <Card variant="glass" className="p-6 opacity-50 cursor-not-allowed text-center">
              <Calendar className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Sessions</h3>
              <p className="text-sm text-text-muted">Coming Soon</p>
            </Card>
          </div>

          {/* Chat - Coming Soon */}
          <div className="pointer-events-none">
            <Card variant="glass" className="p-6 opacity-50 cursor-not-allowed text-center">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-1">Chat</h3>
              <p className="text-sm text-text-muted">Coming Soon</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
