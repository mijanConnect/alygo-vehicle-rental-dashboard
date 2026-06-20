import type { IdentityVerificationStatus } from '@/types/driverVerification'

export type AdminRole =
  | 'super_admin'
  | 'operations_manager'
  | 'compliance_manager'
  | 'finance_manager'
  | 'support_agent'

export type Permission =
  | 'dashboard.view'
  | 'operations.view'
  | 'operations.manage'
  | 'drivers.view'
  | 'drivers.manage'
  | 'passengers.view'
  | 'passengers.manage'
  | 'compliance.view'
  | 'compliance.manage'
  | 'eligibility.view'
  | 'eligibility.manage'
  | 'pricing.view'
  | 'pricing.manage'
  | 'reservations.view'
  | 'reservations.manage'
  | 'reservations.create_manual'
  | 'finance.view'
  | 'finance.manage'
  | 'analytics.view'
  | 'settings.view'
  | 'settings.manage'
  | 'communication.view'
  | 'communication.manage'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AdminRole
  permissions: Permission[]
  avatar?: string
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
}

export type DriverStatus = 'active' | 'pending' | 'suspended' | 'deactivated' | 'rejected'

export type { IdentityVerificationStatus }
export type ComplianceStatus = 'approved' | 'pending' | 'expiring_soon' | 'expired' | 'rejected'
export type RideCategory =
  | 'standard'
  | 'comfort'
  | 'xl'
  | 'pet'
  | 'priority'
  | 'black'
  | 'black_suv'

export type TierStandingStatus = 'good_standing' | 'at_risk' | 'under_review' | 'suspended'

export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  rating: number
  completedTrips: number
  vehicle: string
  vehicleYear: number
  categories: RideCategory[]
  complianceStatus: ComplianceStatus
  backgroundCheckStatus: ComplianceStatus
  identityVerificationStatus: IdentityVerificationStatus
  status: DriverStatus
  city: string
  state: string
  joinedAt: string
  earnings: number
  currentTier?: string
  tierProgress?: number
  tierStatus?: TierStandingStatus
  acceptanceRate?: number
  safetyScore?: number
}

export interface Passenger {
  id: string
  name: string
  email: string
  phone: string
  rating: number
  completedTrips: number
  walletBalance: number
  status: 'active' | 'suspended' | 'banned'
  city: string
  joinedAt: string
}

export interface Trip {
  id: string
  driverId: string
  driverName: string
  passengerId: string
  passengerName: string
  category: RideCategory
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  pickup: string
  dropoff: string
  fare: number
  startedAt: string
  city: string
}

export interface KpiMetric {
  key: string
  label: string
  value: number
  change: number
  format: 'number' | 'currency' | 'percent'
  icon: string
}

export interface ChartPoint {
  label: string
  value: number
  secondary?: number
}

export interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  severity?: 'info' | 'warning' | 'error' | 'success'
}

export interface ComplianceDocument {
  id: string
  driverId: string
  driverName: string
  type: string
  status: ComplianceStatus
  expiresAt?: string
  submittedAt: string
}

export interface EligibilityRule {
  id: string
  name: string
  scope: 'state' | 'city' | 'airport' | 'category'
  scopeValue: string
  category: RideCategory
  minVehicleYear: number
  maxVehicleAge: number
  minRating: number
  minTrips: number
  minExperienceYears: number
  seatCount: number
  vehicleTypes: string[]
  inspectionRequired: boolean
  commercialInsuranceRequired: boolean
  active: boolean
}

export interface SurgeZone {
  id: string
  name: string
  city: string
  multiplier: number
  demand: number
  supply: number
  active: boolean
}

export type DemandZoneStatus = 'normal' | 'medium_demand' | 'high_demand'

export interface DemandZone {
  id: string
  zone: string
  activeRequests: number
  availableDrivers: number
  demandRatio: number
  averageEtaMinutes: number
  status: DemandZoneStatus
}

export type OperationalEventStatus = 'upcoming' | 'active' | 'completed'

export interface OperationalEvent {
  id: string
  eventName: string
  location: string
  date: string
  status: OperationalEventStatus
}

export interface Reservation {
  id: string
  passengerName: string
  type: 'scheduled' | 'airport' | 'event' | 'business'
  pickup: string
  dropoff: string
  scheduledAt: string
  createdAt: string
  category: RideCategory
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  driverName?: string
  city?: string
  airportCode?: string
  flightNumber?: string
  terminal?: string
  eventName?: string
  venue?: string
  eventTime?: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  category: 'system' | 'compliance' | 'operations' | 'finance'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  message: string
  code?: string
}
