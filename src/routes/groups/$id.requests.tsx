import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Check, X, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { groupsApi } from '@/lib/api'

interface JoinRequest {
  id: string
  status: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export const Route = createFileRoute('/groups/$id/requests')({
  component: JoinRequests,
})

function JoinRequests() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<JoinRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [id])

  const fetchRequests = async () => {
    try {
      setIsLoading(true)
      const response = await groupsApi.getRequests(id)
      setRequests(response.requests)
    } catch (err: any) {
      setError(err.message || 'Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      await groupsApi.handleRequest(id, requestId, action)
      // Refresh the list
      fetchRequests()
    } catch (err: any) {
      alert(err.message || `Failed to ${action} request`)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate({ to: `/groups/${id}` })}
            className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Join Requests
              </h1>
              <p className="text-text-secondary">
                {requests.length} pending request{requests.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card variant="glass" className="text-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="primary"
              onClick={fetchRequests}
            >
              Retry
            </Button>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && requests.length === 0 && (
          <Card variant="glass" className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 flex items-center justify-center mx-auto mb-6">
              <UserPlus className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Pending Requests
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              When people request to join your group, you'll see them here.
            </p>
          </Card>
        )}

        {/* Requests List */}
        {!isLoading && !error && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} variant="glass">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="text-lg font-medium text-purple-400">
                          {request.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{request.user.name}</h3>
                        <p className="text-sm text-text-muted">{request.user.email}</p>
                        <p className="text-xs text-text-muted mt-1">
                          Requested {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRequest(request.id, 'reject')}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRequest(request.id, 'accept')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
