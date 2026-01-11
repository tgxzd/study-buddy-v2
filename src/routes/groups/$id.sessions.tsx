import { createFileRoute, Link, useRouterState } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, MapPin, Plus, Video, Edit, Trash2, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { sessionsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import SessionForm from '@/components/SessionForm'

interface Session {
  id: string
  title: string
  description: string | null
  date: string
  link: string | null
  location: string | null
  groupId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string
    email: string
  }
}

export const Route = createFileRoute('/groups/$id/sessions')({
  component: GroupSessions,
})

function GroupSessions() {
  const { id } = Route.useParams()
  const routerState = useRouterState()
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')
  const [showForm, setShowForm] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Track route/location changes to refetch data
  const location = routerState.location.pathname

  useEffect(() => {
    fetchSessions()
  }, [id, filter, location])

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      const response = await sessionsApi.list(
        id,
        filter === 'all' ? undefined : filter
      )
      setSessions(response.sessions)
    } catch (err: any) {
      setError(err.message || 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingSession(null)
    setShowForm(true)
  }

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setShowForm(true)
  }

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return
    }

    try {
      setDeletingId(sessionId)
      await sessionsApi.delete(sessionId)
      fetchSessions()
    } catch (err: any) {
      alert(err.message || 'Failed to delete session')
      setDeletingId(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingSession(null)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSession(null)
    fetchSessions()
  }

  const isCreator = (session: Session) => session.createdBy === user?.id

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isPast = date < now

    return {
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isPast,
    }
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-bg-primary pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={handleFormClose}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sessions
          </button>
          <SessionForm
            groupId={id}
            session={editingSession}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/groups/$id"
                params={{ id }}
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Group
              </Link>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Study Sessions</h1>
          <p className="text-text-secondary">Schedule and manage study sessions with your group</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            All
          </button>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card variant="glass" className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button asChild variant="secondary">
              <Link to="/groups">Back to Groups</Link>
            </Button>
          </Card>
        ) : sessions.length === 0 ? (
          <Card variant="glass" className="text-center py-16">
            <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No sessions yet</h3>
            <p className="text-text-muted mb-6">
              {filter === 'upcoming'
                ? 'No upcoming sessions scheduled'
                : filter === 'past'
                ? 'No past sessions'
                : 'No sessions created yet'}
            </p>
            {filter !== 'past' && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Session
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const { fullDate, time, isPast } = formatDate(session.date)

              return (
                <Card key={session.id} variant="glass" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{session.title}</h3>
                        {isPast && (
                          <span className="px-2 py-1 text-xs font-medium bg-white/10 text-text-muted rounded-full">
                            Past
                          </span>
                        )}
                      </div>
                      {session.description && (
                        <p className="text-text-secondary mb-4">{session.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span>{fullDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span>{time}</span>
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <span>{session.location}</span>
                          </div>
                        )}
                        {session.link && (
                          <a
                            href={session.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            <span>Join Meeting</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4 text-sm text-text-muted">
                        <Users className="w-4 h-4" />
                        <span>Created by {session.creator.name}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {isCreator(session) && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(session)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(session.id)}
                            disabled={deletingId === session.id}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
