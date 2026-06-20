import type { Driver, Passenger, Trip } from '@/types'

export interface TripFareBreakdown {
  baseFare: number
  distanceFee: number
  timeFee: number
  surgeFee: number
  platformFee: number
  total: number
  paymentMethod: string
}

export interface TripTimelineEvent {
  id: string
  label: string
  timestamp: string
  status: 'completed' | 'current' | 'pending'
}

export interface TripCancellationEntry {
  id: string
  actor: 'passenger' | 'driver' | 'system'
  reason: string
  timestamp: string
  feeApplied?: number
}

export interface TripSafetyEvent {
  id: string
  type: 'sos' | 'incident' | 'alert'
  description: string
  timestamp: string
  status: string
}

export interface TripLiveMapData {
  driverLocation: string
  pickupLabel: string
  dropoffLabel: string
  routeSummary: string
  etaMinutes: number
  routeProgressPercent: number
  isLive: boolean
}

export interface TripDetail extends Trip {
  distanceMiles: number
  durationMinutes: number
  fareBreakdown: TripFareBreakdown
  timeline: TripTimelineEvent[]
  cancellationHistory: TripCancellationEntry[]
  safetyEvents: TripSafetyEvent[]
  liveMap: TripLiveMapData
  driver?: Driver
  passenger?: Passenger
}
