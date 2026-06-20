import { Navigate, useLocation } from 'react-router-dom'
import type { Permission } from '@/types'
import { useAuth, usePermissions } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  permission?: Permission
}

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()
  const { hasPermission } = usePermissions()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
