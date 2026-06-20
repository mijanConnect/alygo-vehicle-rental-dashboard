export type TripComplaintStatus =
  | 'pending_review'
  | 'under_investigation'
  | 'approved_refund'
  | 'partial_refund'
  | 'rejected'
  | 'fare_adjusted'

export interface RouteTimelinePoint {
  timestamp: string
  lat: number
  lng: number
  label: string
}

export interface FareBreakdownLine {
  label: string
  amount: number
}

export interface TripCompletionComplaint {
  id: string
  tripId: string
  passengerName: string
  passengerId: string
  driverName: string
  driverId: string
  complaintType: string
  description: string
  status: TripComplaintStatus
  reportedAt: string
  actualDropoffLocation: string
  driverEndTripLocation: string
  distanceDeltaMeters: number
  tripDurationMinutes: number
  tripMileage: number
  fareTotal: number
  fareBreakdown: FareBreakdownLine[]
  routeTimeline: RouteTimelinePoint[]
  routeHistory: Array<{ event: string; timestamp: string }>
  assignedAdmin?: string
  resolutionNotes?: string
  refundAmount?: number
  auditLog: Array<{ action: string; admin: string; timestamp: string; notes?: string }>
}

export interface TripCompletionAnalytics {
  totalComplaints: number
  approvedRefunds: number
  fareAdjustments: number
  repeatOffenders: number
  complaintTrend: Array<{ label: string; value: number }>
  resolutionBreakdown: Array<{ label: string; value: number }>
}

export interface TripCompletionOverview {
  totalComplaints: number
  pendingReview: number
  underInvestigation: number
  approvedRefunds: number
  rejectedComplaints: number
}
