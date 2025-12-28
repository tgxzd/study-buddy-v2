import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, BookOpen, Calendar, FileText, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { dashboardApi } from '@/lib/api'

export const Route = createFileRoute('/dashboard')({
  component: () => (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  ),
})

function Dashboard() {
  const [stats, setStats] = useState({ groups: 0, files: 0, sessions: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getStats()
      setStats(response.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome to <span className="text-gradient">StudyBuddy</span>
          </h1>
          <p className="text-text-secondary">
            Your collaborative learning journey starts here
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="glass" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.groups}</p>
                <p className="text-sm text-text-secondary">Study Groups</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.files}</p>
                <p className="text-sm text-text-secondary">Files Shared</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{isLoading ? '...' : stats.sessions}</p>
                <p className="text-sm text-text-secondary">Sessions</p>
              </div>
            </div>
          </Card>

          <Card variant="glass" hover>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">0</p>
                <p className="text-sm text-text-secondary">Notes</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card variant="gradient" hover>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Create a Study Group
                </h3>
                <p className="text-text-secondary mb-4">
                  Start collaborating with friends and classmates
                </p>
                <Button asChild>
                  <Link to="/groups/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="glass" hover>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Join a Study Group
                </h3>
                <p className="text-text-secondary mb-4">
                  Enter a group invite code to join
                </p>
                <Button variant="secondary" asChild>
                  <Link to="/groups">
                    <Users className="w-4 h-4 mr-2" />
                    Browse Groups
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Getting Started */}
        <Card variant="glass" className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Getting Started
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-400 font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">
                  Create or Join a Study Group
                </h3>
                <p className="text-text-secondary text-sm">
                  Start by creating your own group or joining with an invite code
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-cyan-400 font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">
                  Share Resources
                </h3>
                <p className="text-text-secondary text-sm">
                  Upload notes, assignments, and study materials
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-pink-400 font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">
                  Schedule Study Sessions
                </h3>
                <p className="text-text-secondary text-sm">
                  Plan and organize group study sessions
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
