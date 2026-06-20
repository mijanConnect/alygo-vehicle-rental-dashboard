export type IdentityVerificationStatus =
  | 'verified'
  | 'pending_re_verification'
  | 'verification_required'
  | 'under_review'
  | 'failed_verification'

export type VerificationTriggerSource =
  | 'onboarding'
  | 'manual_admin_request'
  | 'automatic_security_check'
  | 'suspicious_activity'
  | 'identity_mismatch'
  | 'manual_review'
  | 'routine_security_check'
  | 'other'

export type VerificationSource =
  | 'onboarding'
  | 'manual_admin_request'
  | 'automatic_security_check'

export interface DriverVerification {
  id: string
  driverId: string
  profilePhoto: string
  liveSelfiePhoto?: string
  status: IdentityVerificationStatus
  triggerSource: VerificationTriggerSource
  verificationSource: VerificationSource
  reviewedBy?: string
  reviewNotes?: string
  verificationNotes?: string
  verifiedAt?: string
  lastVerifiedAt?: string
  requireBeforeNextTrip: boolean
  ridesPaused: boolean
  triggerReason?: string
  createdAt: string
  updatedAt: string
}

export interface VerificationHistoryEntry {
  id: string
  driverId: string
  date: string
  triggerSource: string
  status: IdentityVerificationStatus
  reviewedBy: string
  notes: string
}

export interface VerificationRequest {
  id: string
  driverId: string
  triggerSource: VerificationTriggerSource
  triggerReason: string
  requireBeforeNextTrip: boolean
  pauseRides: boolean
  status: 'pending' | 'completed' | 'cancelled'
  requestedBy: string
  createdAt: string
}

export interface IdentityVerificationSettings {
  enabled: boolean
  reVerificationEveryDays: number
  reVerificationEveryTrips: number
  allowManualAdminRequests: boolean
  autoPauseAfterFailed: boolean
  enableSuspiciousActivityChecks: boolean
}

export interface IdentityVerificationOverview {
  verifiedDrivers: number
  pendingReVerification: number
  verificationRequired: number
  failedVerifications: number
  driversUnderReview: number
}
