import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Only fetch user if we haven't checked yet
    if (!hasChecked) {
      refreshUser().finally(() => setHasChecked(true))
    }
  }, [hasChecked, refreshUser])

  useEffect(() => {
    if (hasChecked && !isLoading && !isAuthenticated) {
      navigate({ to: '/auth/login', search: { redirect: location.pathname } })
    }
  }, [isAuthenticated, isLoading, navigate, hasChecked])

  if (!hasChecked || isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
