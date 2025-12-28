import { createContext, useContext, useState, type ReactNode } from 'react'
import { authApi, type User, AuthError } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const USER_STORAGE_KEY = 'studybuddy_user'

const getStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore storage errors
  }
  return null
}

const setStoredUser = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage to persist auth across refreshes
  const [user, setUser] = useState<User | null>(getStoredUser)
  const [isLoading, setIsLoading] = useState(false)

  const refreshUser = async () => {
    setIsLoading(true)
    try {
      const response = await authApi.getMe()
      setUser(response.user)
      setStoredUser(response.user)
    } catch (error) {
      // Only log non-auth errors (401s are expected for unauthenticated users)
      if (!(error instanceof AuthError)) {
        console.error('Failed to fetch user:', error)
      }
      setUser(null)
      setStoredUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't auto-fetch on mount - let protected routes trigger the fetch
  // This avoids unnecessary API calls on public pages like landing page

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await authApi.login({ email, password, rememberMe })
    setUser(response.user)
    setStoredUser(response.user)
    setIsLoading(false)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.register({ name, email, password })
    setUser(response.user)
    setStoredUser(response.user)
    setIsLoading(false)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    setStoredUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
