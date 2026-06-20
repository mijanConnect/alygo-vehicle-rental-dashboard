import { useMemo } from 'react'
import { useAppSelector } from '@/store/hooks'
import type { Permission } from '@/types'

export function useAuth() {
  const { user, token, isAuthenticated } = useAppSelector((state) => state.auth)
  return { user, token, isAuthenticated }
}

export function usePermissions() {
  const { user } = useAuth()

  const permissions = useMemo(() => new Set(user?.permissions ?? []), [user])

  const hasPermission = (permission: Permission | Permission[]) => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    const required = Array.isArray(permission) ? permission : [permission]
    return required.some((p) => permissions.has(p))
  }

  return { permissions, hasPermission, role: user?.role }
}
