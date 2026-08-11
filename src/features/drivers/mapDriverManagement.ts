import type { Driver, RideCategory } from '@/types'
import type { ComplianceStatus, DriverStatus, IdentityVerificationStatus } from '@/types'
import type {
  ComplianceDriverItem,
  DriverDetailsData,
  DriverOverviewItem,
  OnlineDriverItem,
  PendingApprovalDriverItem,
} from '@/redux/api/driverManagementApi'

export type DriverTableRow = Driver & {
  tierProgressText?: string
  availabilityStatus?: string
  vehiclePlate?: string
}

function asDriverId(driverId: DriverOverviewItem['driverId']): string {
  if (!driverId) return ''
  if (typeof driverId === 'string') return driverId
  return driverId._id ?? ''
}

function normalizeStatus(status?: string): DriverStatus {
  const value = (status ?? '').toLowerCase()
  if (value === 'approved' || value === 'active') return 'active'
  if (value === 'pending') return 'pending'
  if (value === 'suspended') return 'suspended'
  if (value === 'deactivated' || value === 'rejected') return 'deactivated'
  return 'pending'
}

function normalizeCompliance(status?: string): ComplianceStatus {
  const value = (status ?? '').toLowerCase()
  if (value === 'verified' || value === 'approved') return 'approved'
  if (value === 'expired') return 'expired'
  if (value === 'rejected') return 'rejected'
  if (value === 'expiring_soon') return 'expiring_soon'
  return 'pending'
}

function normalizeIdentity(status?: string): IdentityVerificationStatus {
  const value = (status ?? '').toLowerCase()
  if (value === 'verified') return 'verified'
  if (value === 'failed' || value === 'rejected' || value === 'failed_verification') {
    return 'failed_verification'
  }
  if (value === 'required' || value === 'verification_required') return 'verification_required'
  if (value === 'under_review' || value === 'review') return 'under_review'
  if (value === 'pending_re_verification' || value === 'pending_reverification') {
    return 'pending_re_verification'
  }
  return 'pending_re_verification'
}

function vehicleLabel(vehicle?: { brand?: string; model?: string; licensePlate?: string } | string | null) {
  if (!vehicle) return '—'
  if (typeof vehicle === 'string') return vehicle.trim() || '—'
  const name = [vehicle.brand, vehicle.model].filter(Boolean).join(' ').trim()
  return name || vehicle.licensePlate || '—'
}

function userName(user?: { name?: string } | null, fallback = '—') {
  return user?.name?.trim() || fallback
}

export function mapOverviewDriver(item: DriverOverviewItem): DriverTableRow {
  const id = asDriverId(item.driverId)
  return {
    id,
    name: item.fullName?.trim() || `Driver ${id.slice(-6) || '—'}`,
    email: item.email?.trim() || '—',
    phone: item.phone?.trim() || '—',
    rating: item.averageRating ?? 0,
    completedTrips: item.completedTrips ?? 0,
    vehicle: item.vehicle?.trim() || '—',
    vehicleYear: 0,
    categories: (item.rideCategories ?? []) as RideCategory[],
    complianceStatus: normalizeCompliance(item.compliance),
    backgroundCheckStatus: normalizeCompliance(item.backgroundCheck),
    identityVerificationStatus: normalizeIdentity(item.identityVerification),
    status: normalizeStatus(item.status),
    city: item.city?.trim() || '—',
    state: '',
    joinedAt: '',
    earnings: 0,
    currentTier: item.tier || undefined,
    tierProgressText: item.tierProgress || undefined,
    tierStatus:
      item.tierStatus?.toLowerCase() === 'active' || item.tierStatus?.toLowerCase() === 'good_standing'
        ? 'good_standing'
        : item.tierStatus
          ? 'at_risk'
          : undefined,
  }
}

export function mapOnlineDriver(item: OnlineDriverItem): DriverTableRow {
  const user = item.userId
  return {
    id: item._id,
    name: userName(user, `Driver ${item._id.slice(-6)}`),
    email: user?.email?.trim() || '—',
    phone: user?.phone?.trim() || '—',
    rating: item.averageRating ?? user?.averageRating ?? 0,
    completedTrips: 0,
    vehicle: vehicleLabel(item.vehicle),
    vehiclePlate: item.vehicle?.licensePlate,
    vehicleYear: item.vehicle?.year ?? 0,
    categories: [],
    complianceStatus: normalizeCompliance(item.approvalStatus),
    backgroundCheckStatus: normalizeCompliance(item.backgroundCheckStatus),
    identityVerificationStatus: normalizeIdentity(item.identityVerificationStatus),
    status: 'active',
    city: item.location?.address?.trim() || '—',
    state: '',
    joinedAt: item.createdAt ?? '',
    earnings: 0,
    currentTier: item.currentTier?.name,
    tierProgress: item.progressPercentage,
    availabilityStatus: item.driverAvailabilityStatus,
  }
}

export function mapPendingDriver(item: PendingApprovalDriverItem): DriverTableRow {
  const user = item.userId as { name?: string; email?: string; phone?: string } | null
  return {
    id: item._id,
    name: userName(user, `Driver ${item._id.slice(-6)}`),
    email: user?.email?.trim() || '—',
    phone: user?.phone?.trim() || '—',
    rating: (item as { averageRating?: number }).averageRating ?? 0,
    completedTrips: 0,
    vehicle: vehicleLabel(item.vehicle),
    vehiclePlate: item.vehicle?.licensePlate,
    vehicleYear: item.vehicle?.year ?? 0,
    categories: [],
    complianceStatus: normalizeCompliance(item.approvalStatus),
    backgroundCheckStatus: normalizeCompliance(item.backgroundCheckStatus),
    identityVerificationStatus: normalizeIdentity(item.identityVerificationStatus),
    status: 'pending',
    city: item.location?.address?.trim() || '—',
    state: '',
    joinedAt: item.createdAt ?? '',
    earnings: 0,
    currentTier: item.currentTier?.name,
  }
}

export function mapComplianceDriver(item: ComplianceDriverItem): DriverTableRow {
  const user = item.userId as { name?: string; email?: string; phone?: string } | null
  return {
    id: item._id,
    name: userName(user, `Driver ${item._id.slice(-6)}`),
    email: user?.email?.trim() || '—',
    phone: user?.phone?.trim() || '—',
    rating: (item as { averageRating?: number }).averageRating ?? 0,
    completedTrips: 0,
    vehicle: vehicleLabel(item.vehicle),
    vehiclePlate: item.vehicle?.licensePlate,
    vehicleYear: item.vehicle?.year ?? 0,
    categories: [],
    complianceStatus: normalizeCompliance(item.approvalStatus),
    backgroundCheckStatus: normalizeCompliance(item.backgroundCheckStatus),
    identityVerificationStatus: normalizeIdentity(item.identityVerificationStatus),
    status: normalizeStatus(item.approvalStatus),
    city: item.location?.address?.trim() || '—',
    state: '',
    joinedAt: item.createdAt ?? '',
    earnings: 0,
    currentTier: (item as { currentTier?: { name?: string } }).currentTier?.name,
  }
}

export function mapDriverDetailsToDriver(data: DriverDetailsData): DriverTableRow {
  const d = data.driver
  return {
    id: d.driverId,
    name: d.fullName?.trim() || '—',
    email: d.email?.trim() || '—',
    phone: d.phone?.trim() || '—',
    rating: d.averageRating ?? 0,
    completedTrips: d.completedTrips ?? 0,
    vehicle: d.vehicleName?.trim() || '—',
    vehiclePlate: d.vehicleNumber,
    vehicleYear: 0,
    categories: [],
    complianceStatus: 'pending',
    backgroundCheckStatus: 'pending',
    identityVerificationStatus: normalizeIdentity(
      data.identityVerification.verificationStatus,
    ),
    status: 'active',
    city: '—',
    state: '',
    joinedAt: '',
    earnings: 0,
  }
}
