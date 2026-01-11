const API_BASE = '/api'

export interface ApiError {
  error: string
  stack?: string
}

// Custom error class for authentication errors (401)
// We use this to silently handle unauthenticated state without console errors
export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface LoginResponse {
  user: User
}

export interface RegisterResponse {
  user: User
}

/**
 * Make an API request with credentials
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    // For 401 errors, throw AuthError (silent, expected for unauthenticated users)
    if (response.status === 401) {
      throw new AuthError('Not authenticated')
    }

    const error: ApiError = await response.json()
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

/**
 * Auth API
 */
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string; rememberMe?: boolean }) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    apiRequest<{ user: User }>('/auth/me'),
}

/**
 * Groups API
 */
export const groupsApi = {
  list: () =>
    apiRequest<{ groups: any[] }>('/groups'),

  create: (data: { name: string; description?: string }) =>
    apiRequest<{ group: any }>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: (id: string) =>
    apiRequest<{ group: any }>(`/groups/${id}`),

  update: (id: string, data: { name?: string; description?: string }) =>
    apiRequest<{ group: any }>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/groups/${id}`, {
      method: 'DELETE',
    }),

  joinRequest: (id: string) =>
    apiRequest<{ request: any }>(`/groups/${id}/join`, {
      method: 'POST',
    }),

  getRequests: (id: string) =>
    apiRequest<{ requests: any[] }>(`/groups/${id}/requests`),

  handleRequest: (id: string, requestId: string, action: 'accept' | 'reject') =>
    apiRequest<{ request: any }>(`/groups/${id}/requests/handle`, {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    }),

  cancelRequest: (id: string, requestId: string) =>
    apiRequest<{ message: string }>(`/groups/${id}/requests/${requestId}`, {
      method: 'DELETE',
    }),

  joinByCode: (code: string) =>
    apiRequest<{ message: string; groupId: string }>('/groups/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  search: (query: string) =>
    apiRequest<{ groups: any[] }>(`/groups/search?q=${encodeURIComponent(query)}`),

  leave: (id: string) =>
    apiRequest<{ message: string }>(`/groups/${id}/leave`, {
      method: 'POST',
    }),

  kickMember: (id: string, memberId: string) =>
    apiRequest<{ message: string }>(`/groups/${id}/members/${memberId}`, {
      method: 'DELETE',
    }),
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  getStats: () =>
    apiRequest<{ stats: { groups: number; files: number; sessions: number } }>('/dashboard/stats'),
}

/**
 * Files API
 */
export const filesApi = {
  list: (groupId: string) =>
    apiRequest<{ files: any[] }>(`/files/group/${groupId}`),

  upload: (file: File, groupId: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('groupId', groupId)

    return fetch('/api/files/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error: ApiError = await res.json()
        throw new Error(error.error || 'Upload failed')
      }
      return res.json()
    })
  },

  download: (fileId: string, filename: string) => {
    return fetch(`/api/files/${fileId}/download`, {
      credentials: 'include',
    }).then(async (res) => {
      if (!res.ok) {
        const error: ApiError = await res.json()
        throw new Error(error.error || 'Download failed')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    })
  },

  delete: (fileId: string) =>
    apiRequest<{ message: string }>(`/files/${fileId}`, {
      method: 'DELETE',
    }),
}

/**
 * Sessions API
 */
export const sessionsApi = {
  list: (groupId: string, filter?: 'upcoming' | 'past') =>
    apiRequest<{ sessions: any[] }>(`/sessions/group/${groupId}${filter ? `?filter=${filter}` : ''}`),

  create: (data: {
    title: string
    description?: string
    date: Date
    link?: string
    location?: string
    groupId: string
  }) =>
    apiRequest<{ session: any }>('/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: {
    title?: string
    description?: string
    date?: Date
    link?: string
    location?: string
  }) =>
    apiRequest<{ session: any }>(`/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/sessions/${id}`, {
      method: 'DELETE',
    }),
}
