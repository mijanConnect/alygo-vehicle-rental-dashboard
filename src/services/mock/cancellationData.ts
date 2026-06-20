import type {
  CancellationAnalyticsSummary,
  CancellationReason,
  CancellationReasonStat,
  CancellationTrendPoint,
  CityCancellationPolicy,
} from '@/types/cancellation'

export let mockPassengerCancellationReasons: CancellationReason[] = [
  { id: 'pcr-1', name: 'Changed My Mind', sortOrder: 1, status: 'active' },
  { id: 'pcr-2', name: 'Found Another Ride', sortOrder: 2, status: 'active' },
  { id: 'pcr-3', name: 'Driver Taking Too Long', sortOrder: 3, status: 'active' },
  { id: 'pcr-4', name: 'Pickup Location Incorrect', sortOrder: 4, status: 'active' },
  { id: 'pcr-5', name: 'Emergency', sortOrder: 5, status: 'active' },
  { id: 'pcr-6', name: 'Price Too High', sortOrder: 6, status: 'active' },
  { id: 'pcr-7', name: 'Other', sortOrder: 7, status: 'active' },
]

export let mockDriverCancellationReasons: CancellationReason[] = [
  { id: 'dcr-1', name: 'Vehicle Issue', sortOrder: 1, status: 'active' },
  { id: 'dcr-2', name: 'Emergency', sortOrder: 2, status: 'active' },
  { id: 'dcr-3', name: 'Passenger Unreachable', sortOrder: 3, status: 'active' },
  { id: 'dcr-4', name: 'Safety Concern', sortOrder: 4, status: 'active' },
  { id: 'dcr-5', name: 'Incorrect Rider Information', sortOrder: 5, status: 'active' },
  { id: 'dcr-6', name: 'Passenger Requested Cancellation', sortOrder: 6, status: 'active' },
  { id: 'dcr-7', name: 'Other', sortOrder: 7, status: 'active' },
]

export let mockCityPolicies: CityCancellationPolicy[] = [
  { id: 'cp-1', state: 'California', city: 'Los Angeles', rideCategory: 'standard', cancellationFee: 5, noShowFee: 5, waitTime: 5, status: 'active' },
  { id: 'cp-2', state: 'New York', city: 'New York City', rideCategory: 'standard', cancellationFee: 8, noShowFee: 8, waitTime: 5, status: 'active' },
  { id: 'cp-3', state: 'Texas', city: 'Austin', rideCategory: 'standard', cancellationFee: 4, noShowFee: 4, waitTime: 5, status: 'active' },
  { id: 'cp-4', state: 'California', city: 'San Francisco', rideCategory: 'black', cancellationFee: 15, noShowFee: 15, waitTime: 10, status: 'active' },
  { id: 'cp-5', state: 'Florida', city: 'Miami', rideCategory: 'comfort', cancellationFee: 7, noShowFee: 7, waitTime: 5, status: 'active' },
]

export const mockCancellationAnalyticsSummary: CancellationAnalyticsSummary = {
  totalToday: 142,
  passengerCancellations: 98,
  driverCancellations: 31,
  noShowCases: 13,
  feesCollected: 1840,
  driverCompensationPaid: 920,
}

export const mockCancellationTrend: CancellationTrendPoint[] = [
  { label: 'Mon', value: 118, secondary: 92 },
  { label: 'Tue', value: 132, secondary: 104 },
  { label: 'Wed', value: 125, secondary: 98 },
  { label: 'Thu', value: 148, secondary: 115 },
  { label: 'Fri', value: 165, secondary: 128 },
  { label: 'Sat', value: 189, secondary: 142 },
  { label: 'Sun', value: 142, secondary: 110 },
]

export const mockTopCancellationReasons: CancellationReasonStat[] = [
  { label: 'Changed My Mind', value: 42 },
  { label: 'Driver Taking Too Long', value: 28 },
  { label: 'Found Another Ride', value: 18 },
  { label: 'Emergency', value: 12 },
  { label: 'Price Too High', value: 9 },
]

export const mockCancellationByCity: CancellationReasonStat[] = [
  { label: 'Los Angeles', value: 38 },
  { label: 'New York City', value: 34 },
  { label: 'Austin', value: 22 },
  { label: 'San Francisco', value: 19 },
  { label: 'Miami', value: 15 },
]

export const mockCancellationByCategory: CancellationReasonStat[] = [
  { label: 'Standard', value: 52 },
  { label: 'Comfort', value: 28 },
  { label: 'Black', value: 18 },
  { label: 'XL', value: 14 },
  { label: 'Black SUV', value: 11 },
]

export function generateReasonId(prefix: string) {
  return `${prefix}-${Date.now()}`
}
