import { useMemo } from 'react'
import { usePermissions } from '@/hooks/useAuth'
import type { AdminRole } from '@/types'

const MANAGE_ROLES: AdminRole[] = ['super_admin', 'operations_manager']
const FINANCE_ROLES: AdminRole[] = ['finance_manager']
const READ_ONLY_ROLES: AdminRole[] = ['support_agent']

export function useDriverRewardsPermissions() {
  const { role, hasPermission } = usePermissions()

  return useMemo(() => {
    const isSuperAdmin = role === 'super_admin'
    const canManage =
      isSuperAdmin ||
      MANAGE_ROLES.includes(role!) ||
      hasPermission('drivers.manage') ||
      hasPermission('operations.manage')
    const canManageFinance =
      canManage || FINANCE_ROLES.includes(role!) || hasPermission('finance.manage')
    const isReadOnly =
      !canManage &&
      !canManageFinance &&
      (READ_ONLY_ROLES.includes(role!) || role === 'compliance_manager')

    return {
      canView: Boolean(role),
      canManage,
      canManageFinance,
      canManagePromotions: canManage || canManageFinance,
      canManagePerformance: canManage || role === 'compliance_manager' || isSuperAdmin,
      isReadOnly,
    }
  }, [hasPermission, role])
}
