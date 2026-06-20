import { Tag } from 'antd'
import type { ComplianceStatus, DriverStatus } from '@/types'
import { COMPLIANCE_STATUS_COLORS, DRIVER_STATUS_COLORS } from '@/constants'

const statusLabels: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
  rejected: 'Rejected',
  approved: 'Approved',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
  banned: 'Banned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  assigned: 'Assigned',
}

interface StatusBadgeProps {
  status: DriverStatus | ComplianceStatus | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color =
    status in DRIVER_STATUS_COLORS
      ? DRIVER_STATUS_COLORS[status as DriverStatus]
      : status in COMPLIANCE_STATUS_COLORS
        ? COMPLIANCE_STATUS_COLORS[status as ComplianceStatus]
        : 'default'

  return (
    <Tag color={color} className={className}>
      {statusLabels[status] ?? status.replace(/_/g, ' ')}
    </Tag>
  )
}
