import { Tag } from 'antd'
import type { IdentityVerificationStatus } from '@/types/driverVerification'
import { identityStatusColor, identityStatusLabel } from '@/features/drivers/driverVerificationHelpers'

interface IdentityVerificationBadgeProps {
  status: IdentityVerificationStatus
}

export function IdentityVerificationBadge({ status }: IdentityVerificationBadgeProps) {
  return <Tag color={identityStatusColor(status)}>{identityStatusLabel(status)}</Tag>
}
