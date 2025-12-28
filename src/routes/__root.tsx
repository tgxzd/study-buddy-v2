import { Outlet, createRootRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import { AuthProvider } from '../contexts/AuthContext'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <Header />
      <Outlet />
    </AuthProvider>
  ),
})
