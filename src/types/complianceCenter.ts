export type BackgroundCheckStatus = 'pending' | 'in_review' | 'approved' | 'rejected'

export interface ComplianceOverview {
  pendingBackgroundChecks: number
  expiredDocuments: number
  restrictedDrivers: number
  pendingReviews: number
  complianceScore: number
}

export interface BackgroundCheckRecord {
  id: string
  driverId: string
  driverName: string
  provider: string
  status: BackgroundCheckStatus
  submittedAt: string
  completedAt?: string
}

export interface DocumentMonitorRecord {
  id: string
  driverId: string
  driverName: string
  documentType: string
  expiryDate?: string
  daysRemaining: number | null
  status: string
}

export type DriverRestrictionStatus = 'active' | 'inactive'

export interface DriverRestrictionRecord {
  id: string
  driverId: string
  driverName: string
  reason: string
  restrictedCategories: string[]
  restrictionEndDate?: string
  status: DriverRestrictionStatus
}

export interface DriverRestrictionFormValues {
  driverName: string
  reason: string
  restrictedCategories: string[]
  restrictionEndDate?: string
  status: DriverRestrictionStatus
}

export interface ComplianceListParams {
  page?: number
  pageSize?: number
  search?: string
}

export interface ComplianceListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
