import type { RideCategory } from '@/types'

export type LostItemReportStatus =
  | 'pending_review'
  | 'found'
  | 'not_found'
  | 'pickup_scheduled'
  | 'delivery_scheduled'
  | 'completed'
  | 'closed'

export type ReturnMethod = 'passenger_pickup' | 'driver_delivery'

export type ReturnStatus = 'scheduled' | 'in_progress' | 'returned' | 'cancelled'

export type LostFoundEntityStatus = 'active' | 'inactive'

export type DisputeType =
  | 'passenger_item_missing'
  | 'driver_item_not_found'
  | 'return_not_completed'
  | 'ownership_dispute'

export type DisputeStatus = 'open' | 'in_review' | 'resolved' | 'escalated'

export type DisputePriority = 'low' | 'medium' | 'high' | 'critical'

export interface CaseTimelineEvent {
  id: string
  label: string
  description: string
  timestamp: string
  actor: string
}

export interface LostItemReport {
  id: string
  passengerId: string
  passengerName: string
  passengerEmail: string
  passengerPhone: string
  driverId: string
  driverName: string
  driverRating: number
  tripId: string
  pickup: string
  destination: string
  tripDate: string
  itemCategory: string
  itemName: string
  itemDescription: string
  photos: string[]
  status: LostItemReportStatus
  createdAt: string
  assignedAdmin?: string
  timeline: CaseTimelineEvent[]
}

export interface ReturnRecord {
  id: string
  reportId: string
  returnMethod: ReturnMethod
  passengerName: string
  driverName: string
  scheduledDate: string
  returnStatus: ReturnStatus
  fee: number
}

export interface DeliveryFeeSetting {
  id: string
  rideCategory: RideCategory
  baseFee: number
  perMileFee: number
  driverCompensation: number
  status: LostFoundEntityStatus
}

export interface LostItemCategory {
  id: string
  name: string
  status: LostFoundEntityStatus
}

export interface DriverCompensationSettings {
  pickupCompensation: number
  deliveryCompensation: number
  distanceBonus: number
  premiumCategoryBonus: number
}

export interface LostFoundDispute {
  id: string
  reportId: string
  type: DisputeType
  passengerName: string
  driverName: string
  status: DisputeStatus
  priority: DisputePriority
  assignedAdmin: string
  evidence: string
  createdAt: string
}

export interface LostFoundOverview {
  totalReports: number
  pendingDriverReview: number
  itemsFound: number
  itemsNotFound: number
  pickupScheduled: number
  deliveryScheduled: number
  completedReturns: number
  openDisputes: number
}

export interface LostFoundStatPoint {
  label: string
  value: number
  secondary?: number
}

export interface LostFoundAnalyticsData {
  reportsThisMonth: number
  foundRate: number
  returnSuccessRate: number
  avgResolutionTimeHours: number
  driverCompensationPaid: number
  trend: LostFoundStatPoint[]
  mostLostItems: LostFoundStatPoint[]
  cityReports: LostFoundStatPoint[]
  categoryDistribution: LostFoundStatPoint[]
  monthlyReturnRate: LostFoundStatPoint[]
}

export interface LostFoundNotification {
  id: string
  type: 'new_report' | 'driver_response' | 'open_dispute' | 'return_completed' | 'escalated_case'
  title: string
  message: string
  timestamp: string
}
