import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Plus, Users, Calendar, FileText, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { groupsApi } from '@/lib/api'

interface Group {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  members: Array<{
    user: {
      id: string
      name: string
      email: string
    }
  }>
  _count: {
    members: number
    files: number
    sessions: number
  }
}

interface PublicGroup {
  id: string
  name: string
  description: string | null
  owner: {
    name: string
  }
  _count: {
    members: number
  }
}

export const Route = createFileRoute('/groups/')({
  component: GroupsList,
})

function GroupsList() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [publicGroups, setPublicGroups] = useState<PublicGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'my-groups' | 'browse'>('my-groups')

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      setIsLoading(true)
      const response = await groupsApi.list()
      setGroups(response.groups)
    } catch (err: any) {
      setError(err.message || 'Failed to load groups')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setPublicGroups([])
      return
    }

    try {
      setIsSearching(true)
      const response = await groupsApi.search(searchQuery.trim())
      setPublicGroups(response.groups)
    } catch (err: any) {
      alert(err.message || 'Failed to search groups')
    } finally {
      setIsSearching(false)
    }
  }

  const handleJoinRequest = async (groupId: string, groupName: string) => {
    if (!confirm(`Send join request to "${groupName}"?`)) {
      return
    }

    try {
      setIsJoining(true)
      await groupsApi.joinRequest(groupId)
      alert('Join request sent! Wait for the group owner to accept.')
    } catch (err: any) {
      alert(err.message || 'Failed to send join request')
    } finally {
      setIsJoining(false)
    }
  }

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      alert('Please enter an invite code')
      return
    }

    try {
      setIsJoining(true)
      const response = await groupsApi.joinByCode(joinCode.trim().toUpperCase())
      alert('Successfully joined the group!')
      setJoinCode('')
      fetchGroups() // Refresh the list
      navigate({ to: `/groups/${response.groupId}` })
    } catch (err: any) {
      alert(err.message || 'Failed to join group')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Study Groups
            </h1>
            <p className="text-text-secondary">
              {groups.length > 0 ? `You have ${groups.length} group${groups.length > 1 ? 's' : ''}` : 'Join or create study groups'}
            </p>
          </div>
          <Button asChild>
            <Link to="/groups/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Link>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('my-groups')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'my-groups'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            My Groups
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'browse'
                ? 'text-white border-b-2 border-purple-500'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Browse & Join
          </button>
        </div>

        {/* My Groups Tab */}
        {activeTab === 'my-groups' && (
          <>
            {/* Join by Code */}
            <Card variant="glass" className="p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Join a Group with Invite Code
              </h2>
              <p className="text-sm text-text-secondary mb-4">
                Enter the invite code from a group owner to join instantly
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter 6-character invite code (e.g., ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  onClick={handleJoinByCode}
                  disabled={isJoining || joinCode.length !== 6}
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-16">
                <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card variant="glass" className="text-center py-8">
                <p className="text-red-400">{error}</p>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={fetchGroups}
                >
                  Retry
                </Button>
              </Card>
            )}

            {/* Empty State */}
            {!isLoading && !error && groups.length === 0 && (
              <Card variant="glass" className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Study Groups Yet
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Create your own study group or join with an invite code
                </p>
                <Button asChild>
                  <Link to="/groups/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Group
                  </Link>
                </Button>
              </Card>
            )}

            {/* Groups Grid */}
            {!isLoading && !error && groups.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <Link
                    key={group.id}
                    to="/groups/$id"
                    params={{ id: group.id }}
                    className="block"
                  >
                    <Card variant="glass" className="h-full hover:scale-[1.02] transition-transform cursor-pointer">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                          {group.name}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2 min-h-[40px]">
                          {group.description || 'No description'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-text-muted">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{group._count.members}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{group._count.files}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{group._count.sessions}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-purple-400">
                                {group.owner.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-text-muted">
                              {group.owner.name}
                            </span>
                          </div>
                          <span className="text-xs text-text-muted">
                            Owner
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* Browse & Join Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Search */}
            <Card variant="glass" className="p-6 mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">
                Search Groups by Name
              </h2>
              <p className="text-sm text-text-secondary mb-4">
                Find groups and send join requests to the owners
              </p>
              <div className="flex gap-3">
                <Input
                  placeholder="Enter group name to search..."
                  icon={<Search className="w-5 h-5" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </Card>

            {/* Search Results */}
            {publicGroups.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Search Results
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publicGroups.map((group) => (
                    <Card key={group.id} variant="glass" className="h-full">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1">
                          {group.name}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4 line-clamp-2 min-h-[40px]">
                          {group.description || 'No description'}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{group._count.members}</span>
                          </div>
                          <div className="text-xs text-text-muted">
                            Owner: {group.owner.name}
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          className="w-full"
                          onClick={() => handleJoinRequest(group.id, group.name)}
                          disabled={isJoining}
                        >
                          Request to Join
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && publicGroups.length === 0 && !isSearching && (
              <Card variant="glass" className="text-center py-8">
                <p className="text-text-secondary">
                  No groups found matching "{searchQuery}"
                </p>
              </Card>
            )}

            {/* Initial Browse State */}
            {!searchQuery && (
              <Card variant="glass" className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Search for Groups
                </h3>
                <p className="text-text-secondary max-w-md mx-auto">
                  Enter a group name above to search and send join requests
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
