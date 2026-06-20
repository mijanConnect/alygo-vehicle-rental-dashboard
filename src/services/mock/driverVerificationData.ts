import type {
  DriverVerification,
  IdentityVerificationOverview,
  IdentityVerificationSettings,
  IdentityVerificationStatus,
  VerificationHistoryEntry,
  VerificationRequest,
} from '@/types/driverVerification'

const STATUSES: IdentityVerificationStatus[] = [
  'verified',
  'pending_re_verification',
  'verification_required',
  'under_review',
  'failed_verification',
]

export function profilePhotoUrl(driverId: string) {
  return `https://api.dicebear.com/7.x/personas/png?seed=${encodeURIComponent(driverId)}-profile&backgroundColor=b6e3f4`
}

export function liveSelfieUrl(driverId: string) {
  return `https://api.dicebear.com/7.x/personas/png?seed=${encodeURIComponent(driverId)}-selfie&backgroundColor=c0aede`
}

function buildVerification(driverId: string, index: number): DriverVerification {
  const status = STATUSES[index % STATUSES.length]
  const now = new Date().toISOString()
  return {
    id: `dv-${driverId}`,
    driverId,
    profilePhoto: profilePhotoUrl(driverId),
    liveSelfiePhoto: status === 'verification_required' ? undefined : liveSelfieUrl(driverId),
    status,
    triggerSource: index % 3 === 0 ? 'onboarding' : index % 3 === 1 ? 'manual_admin_request' : 'automatic_security_check',
    verificationSource: index % 3 === 0 ? 'onboarding' : index % 3 === 1 ? 'manual_admin_request' : 'automatic_security_check',
    reviewedBy: status === 'verified' ? 'Compliance Admin' : status === 'under_review' ? undefined : 'System',
    reviewNotes: status === 'failed_verification' ? 'Live selfie did not match profile photo' : undefined,
    verificationNotes: 'Live selfie captured via in-app camera. Gallery uploads disabled.',
    verifiedAt: status === 'verified' ? now : undefined,
    lastVerifiedAt: status !== 'verification_required' ? new Date(Date.now() - index * 86400000 * 14).toISOString() : undefined,
    requireBeforeNextTrip: status === 'verification_required' || status === 'failed_verification',
    ridesPaused: status === 'failed_verification',
    triggerReason: status === 'pending_re_verification' ? 'Routine security check' : undefined,
    createdAt: new Date(Date.now() - index * 86400000 * 30).toISOString(),
    updatedAt: now,
  }
}

export let mockDriverVerifications: DriverVerification[] = Array.from({ length: 50 }, (_, i) =>
  buildVerification(`DR-${1000 + i}`, i),
)

export let mockVerificationHistory: VerificationHistoryEntry[] = mockDriverVerifications.flatMap((v, i) => {
  const entries: VerificationHistoryEntry[] = [
    {
      id: `vh-${v.driverId}-1`,
      driverId: v.driverId,
      date: v.createdAt,
      triggerSource: 'Onboarding Verification',
      status: 'verified',
      reviewedBy: 'System',
      notes: 'Initial onboarding identity verification passed',
    },
  ]
  if (i % 4 === 1) {
    entries.unshift({
      id: `vh-${v.driverId}-2`,
      driverId: v.driverId,
      date: v.updatedAt,
      triggerSource: 'Admin Requested Verification',
      status: v.status,
      reviewedBy: v.reviewedBy ?? 'Pending',
      notes: v.reviewNotes ?? 'Re-verification in progress',
    })
  }
  if (i % 5 === 2) {
    entries.unshift({
      id: `vh-${v.driverId}-3`,
      driverId: v.driverId,
      date: v.updatedAt,
      triggerSource: 'Automatic Re-Verification',
      status: v.status,
      reviewedBy: 'Security Bot',
      notes: 'Scheduled automatic security check triggered',
    })
  }
  return entries
})

export let mockVerificationRequests: VerificationRequest[] = mockDriverVerifications
  .filter((v) => v.status !== 'verified')
  .slice(0, 8)
  .map((v, i) => ({
    id: `vr-${i}`,
    driverId: v.driverId,
    triggerSource: v.triggerSource,
    triggerReason: v.triggerReason ?? 'Manual review',
    requireBeforeNextTrip: v.requireBeforeNextTrip,
    pauseRides: v.ridesPaused,
    status: 'pending' as const,
    requestedBy: 'Admin',
    createdAt: v.updatedAt,
  }))

export let mockIdentityVerificationSettings: IdentityVerificationSettings = {
  enabled: true,
  reVerificationEveryDays: 90,
  reVerificationEveryTrips: 500,
  allowManualAdminRequests: true,
  autoPauseAfterFailed: true,
  enableSuspiciousActivityChecks: true,
}

export function computeIdentityVerificationOverview(): IdentityVerificationOverview {
  return {
    verifiedDrivers: mockDriverVerifications.filter((v) => v.status === 'verified').length,
    pendingReVerification: mockDriverVerifications.filter((v) => v.status === 'pending_re_verification').length,
    verificationRequired: mockDriverVerifications.filter((v) => v.status === 'verification_required').length,
    failedVerifications: mockDriverVerifications.filter((v) => v.status === 'failed_verification').length,
    driversUnderReview: mockDriverVerifications.filter((v) => v.status === 'under_review').length,
  }
}

export function getVerificationForDriver(driverId: string) {
  return mockDriverVerifications.find((v) => v.driverId === driverId)
}

export function getHistoryForDriver(driverId: string) {
  return mockVerificationHistory.filter((h) => h.driverId === driverId)
}

export const IDENTITY_STATUS_LABELS: Record<IdentityVerificationStatus, string> = {
  verified: 'Verified',
  pending_re_verification: 'Pending Re-Verification',
  verification_required: 'Verification Required',
  under_review: 'Under Review',
  failed_verification: 'Failed Verification',
}

export const TRIGGER_REASON_OPTIONS = [
  { value: 'suspicious_activity', label: 'Suspicious activity' },
  { value: 'identity_mismatch', label: 'Identity mismatch' },
  { value: 'manual_review', label: 'Manual review' },
  { value: 'routine_security_check', label: 'Routine security check' },
  { value: 'other', label: 'Other' },
]

export const VERIFICATION_SOURCE_LABELS: Record<string, string> = {
  onboarding: 'Onboarding',
  manual_admin_request: 'Manual Admin Request',
  automatic_security_check: 'Automatic Security Check',
}
