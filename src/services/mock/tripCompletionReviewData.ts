import type {
  TripCompletionAnalytics,
  TripCompletionComplaint,
  TripCompletionOverview,
} from '@/types/tripCompletionReview'

const baseFareBreakdown = [
  { label: 'Base Fare', amount: 4.5 },
  { label: 'Distance', amount: 12.8 },
  { label: 'Time', amount: 6.2 },
  { label: 'Service Fee', amount: 2.1 },
  { label: 'Tip', amount: 5.0 },
]

export let mockTripComplaints: TripCompletionComplaint[] = [
  {
    id: 'tcc-1001',
    tripId: 'trip-88241',
    passengerName: 'Sarah Chen',
    passengerId: 'p-4412',
    driverName: 'Marcus Johnson',
    driverId: 'd-204',
    complaintType: 'Early Dropoff',
    description: 'Driver ended trip before reaching my destination. I had to walk 3 blocks.',
    status: 'pending_review',
    reportedAt: '2026-06-12T14:22:00Z',
    actualDropoffLocation: '1420 Market St, San Francisco, CA',
    driverEndTripLocation: '1380 Market St, San Francisco, CA',
    distanceDeltaMeters: 340,
    tripDurationMinutes: 18,
    tripMileage: 4.2,
    fareTotal: 30.6,
    fareBreakdown: baseFareBreakdown,
    routeTimeline: [
      { timestamp: '2026-06-12T14:00:00Z', lat: 37.7749, lng: -122.4194, label: 'Pickup' },
      { timestamp: '2026-06-12T14:08:00Z', lat: 37.781, lng: -122.415, label: 'En Route' },
      { timestamp: '2026-06-12T14:16:00Z', lat: 37.785, lng: -122.408, label: 'Driver End Trip' },
      { timestamp: '2026-06-12T14:18:00Z', lat: 37.7862, lng: -122.4065, label: 'Actual Dropoff' },
    ],
    routeHistory: [
      { event: 'Trip Started', timestamp: '2026-06-12T14:00:00Z' },
      { event: 'Driver Ended Trip', timestamp: '2026-06-12T14:16:00Z' },
      { event: 'Passenger Reported Issue', timestamp: '2026-06-12T14:22:00Z' },
    ],
    auditLog: [],
  },
  {
    id: 'tcc-1002',
    tripId: 'trip-88190',
    passengerName: 'James Wilson',
    passengerId: 'p-3891',
    driverName: 'David Kim',
    driverId: 'd-118',
    complaintType: 'Incorrect Fare',
    description: 'Fare charged was higher than estimated. Trip took same route as usual.',
    status: 'under_investigation',
    reportedAt: '2026-06-11T09:45:00Z',
    actualDropoffLocation: 'SFO Terminal 2, San Francisco, CA',
    driverEndTripLocation: 'SFO Terminal 2, San Francisco, CA',
    distanceDeltaMeters: 12,
    tripDurationMinutes: 42,
    tripMileage: 14.8,
    fareTotal: 58.4,
    fareBreakdown: [
      { label: 'Base Fare', amount: 6.0 },
      { label: 'Distance', amount: 32.5 },
      { label: 'Time', amount: 14.2 },
      { label: 'Airport Surcharge', amount: 4.0 },
      { label: 'Service Fee', amount: 1.7 },
    ],
    routeTimeline: [
      { timestamp: '2026-06-11T08:50:00Z', lat: 37.7849, lng: -122.4094, label: 'Pickup' },
      { timestamp: '2026-06-11T09:32:00Z', lat: 37.6213, lng: -122.379, label: 'Dropoff' },
    ],
    routeHistory: [
      { event: 'Trip Started', timestamp: '2026-06-11T08:50:00Z' },
      { event: 'Trip Completed', timestamp: '2026-06-11T09:32:00Z' },
      { event: 'Fare Dispute Opened', timestamp: '2026-06-11T09:45:00Z' },
    ],
    assignedAdmin: 'Admin Ops',
    auditLog: [
      { action: 'Case Assigned', admin: 'Admin Ops', timestamp: '2026-06-11T10:00:00Z' },
    ],
  },
  {
    id: 'tcc-1003',
    tripId: 'trip-88102',
    passengerName: 'Elena Rodriguez',
    passengerId: 'p-2201',
    driverName: 'Lisa Martinez',
    driverId: 'd-089',
    complaintType: 'Route Deviation',
    description: 'Driver took a longer route increasing the fare unnecessarily.',
    status: 'approved_refund',
    reportedAt: '2026-06-10T18:30:00Z',
    actualDropoffLocation: '2200 Van Ness Ave, San Francisco, CA',
    driverEndTripLocation: '2200 Van Ness Ave, San Francisco, CA',
    distanceDeltaMeters: 5,
    tripDurationMinutes: 25,
    tripMileage: 6.8,
    fareTotal: 28.9,
    fareBreakdown: baseFareBreakdown,
    routeTimeline: [
      { timestamp: '2026-06-10T18:00:00Z', lat: 37.79, lng: -122.42, label: 'Pickup' },
      { timestamp: '2026-06-10T18:12:00Z', lat: 37.795, lng: -122.41, label: 'Detour' },
      { timestamp: '2026-06-10T18:25:00Z', lat: 37.798, lng: -122.425, label: 'Dropoff' },
    ],
    routeHistory: [
      { event: 'Trip Started', timestamp: '2026-06-10T18:00:00Z' },
      { event: 'Route Deviation Detected', timestamp: '2026-06-10T18:12:00Z' },
      { event: 'Full Refund Approved', timestamp: '2026-06-10T20:00:00Z' },
    ],
    refundAmount: 28.9,
    resolutionNotes: 'GPS confirms unnecessary detour. Full refund issued.',
    auditLog: [
      { action: 'Approve Refund', admin: 'Finance Admin', timestamp: '2026-06-10T20:00:00Z', notes: 'Full refund $28.90' },
    ],
  },
  {
    id: 'tcc-1004',
    tripId: 'trip-88055',
    passengerName: 'Michael Brown',
    passengerId: 'p-5510',
    driverName: 'Marcus Johnson',
    driverId: 'd-204',
    complaintType: 'Early Dropoff',
    description: 'Dropped off at wrong intersection.',
    status: 'partial_refund',
    reportedAt: '2026-06-09T22:10:00Z',
    actualDropoffLocation: '500 Hayes St, San Francisco, CA',
    driverEndTripLocation: '450 Hayes St, San Francisco, CA',
    distanceDeltaMeters: 180,
    tripDurationMinutes: 12,
    tripMileage: 2.1,
    fareTotal: 16.4,
    fareBreakdown: [
      { label: 'Base Fare', amount: 4.5 },
      { label: 'Distance', amount: 6.2 },
      { label: 'Time', amount: 3.5 },
      { label: 'Service Fee', amount: 2.2 },
    ],
    routeTimeline: [
      { timestamp: '2026-06-09T21:55:00Z', lat: 37.776, lng: -122.424, label: 'Pickup' },
      { timestamp: '2026-06-09T22:07:00Z', lat: 37.778, lng: -122.422, label: 'Driver End Trip' },
    ],
    routeHistory: [
      { event: 'Trip Started', timestamp: '2026-06-09T21:55:00Z' },
      { event: 'Partial Refund Issued', timestamp: '2026-06-10T08:00:00Z' },
    ],
    refundAmount: 8.0,
    resolutionNotes: 'Partial refund for distance delta.',
    auditLog: [
      { action: 'Partial Refund', admin: 'Admin Ops', timestamp: '2026-06-10T08:00:00Z', notes: '$8.00 partial refund' },
    ],
  },
  {
    id: 'tcc-1005',
    tripId: 'trip-87998',
    passengerName: 'Jennifer Park',
    passengerId: 'p-3302',
    driverName: 'David Kim',
    driverId: 'd-118',
    complaintType: 'Trip Not Completed',
    description: 'Driver ended trip while still in vehicle.',
    status: 'rejected',
    reportedAt: '2026-06-08T16:20:00Z',
    actualDropoffLocation: '1 Ferry Building, San Francisco, CA',
    driverEndTripLocation: '1 Ferry Building, San Francisco, CA',
    distanceDeltaMeters: 0,
    tripDurationMinutes: 15,
    tripMileage: 3.5,
    fareTotal: 22.1,
    fareBreakdown: baseFareBreakdown,
    routeTimeline: [
      { timestamp: '2026-06-08T16:00:00Z', lat: 37.77, lng: -122.43, label: 'Pickup' },
      { timestamp: '2026-06-08T16:15:00Z', lat: 37.7955, lng: -122.3937, label: 'Dropoff' },
    ],
    routeHistory: [
      { event: 'Trip Started', timestamp: '2026-06-08T16:00:00Z' },
      { event: 'Complaint Rejected', timestamp: '2026-06-08T18:00:00Z' },
    ],
    resolutionNotes: 'GPS data confirms trip completed at destination.',
    auditLog: [
      { action: 'Reject Complaint', admin: 'Compliance Admin', timestamp: '2026-06-08T18:00:00Z' },
    ],
  },
]

export function computeTripCompletionOverview(): TripCompletionOverview {
  return {
    totalComplaints: mockTripComplaints.length,
    pendingReview: mockTripComplaints.filter((c) => c.status === 'pending_review').length,
    underInvestigation: mockTripComplaints.filter((c) => c.status === 'under_investigation').length,
    approvedRefunds: mockTripComplaints.filter((c) => c.status === 'approved_refund').length,
    rejectedComplaints: mockTripComplaints.filter((c) => c.status === 'rejected').length,
  }
}

export const mockTripCompletionAnalytics: TripCompletionAnalytics = {
  totalComplaints: 142,
  approvedRefunds: 38,
  fareAdjustments: 24,
  repeatOffenders: 6,
  complaintTrend: [
    { label: 'Jan', value: 18 },
    { label: 'Feb', value: 22 },
    { label: 'Mar', value: 20 },
    { label: 'Apr', value: 25 },
    { label: 'May', value: 28 },
    { label: 'Jun', value: 29 },
  ],
  resolutionBreakdown: [
    { label: 'Approved Refund', value: 38 },
    { label: 'Partial Refund', value: 22 },
    { label: 'Fare Adjusted', value: 24 },
    { label: 'Rejected', value: 48 },
    { label: 'Pending', value: 10 },
  ],
}

export function appendAuditLog(
  complaintId: string,
  action: string,
  admin: string,
  notes?: string,
) {
  const index = mockTripComplaints.findIndex((c) => c.id === complaintId)
  if (index === -1) return
  mockTripComplaints[index].auditLog.push({
    action,
    admin,
    timestamp: new Date().toISOString(),
    notes,
  })
}
