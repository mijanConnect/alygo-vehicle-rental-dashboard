import type { IdentityVerificationStatus } from '@/types/driverVerification'
import { IDENTITY_STATUS_LABELS } from '@/services/driverVerificationApi'

export type DriverVerificationFocus = 'default' | 'history' | 'compare' | 'selfie' | 'security'

export function identityStatusLabel(status: IdentityVerificationStatus) {
  return IDENTITY_STATUS_LABELS[status]
}

export function identityStatusColor(status: IdentityVerificationStatus): string {
  switch (status) {
    case 'verified':
      return 'green'
    case 'pending_re_verification':
      return 'gold'
    case 'verification_required':
      return 'orange'
    case 'under_review':
      return 'blue'
    case 'failed_verification':
      return 'red'
    default:
      return 'default'
  }
}
