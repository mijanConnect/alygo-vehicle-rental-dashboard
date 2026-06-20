import { mockDrivers, mockPassengers, mockTrips } from '@/services/mock/data'
import type { Trip } from '@/types'
import type {
  TripCancellationEntry,
  TripDetail,
  TripFareBreakdown,
  TripLiveMapData,
  TripSafetyEvent,
  TripTimelineEvent,
} from '@/types/tripOperations'

function buildFareBreakdown(trip: Trip): TripFareBreakdown {
  const baseFare = Math.round(trip.fare * 0.45)
  const distanceFee = Math.round(trip.fare * 0.3)
  const timeFee = Math.round(trip.fare * 0.15)
  const surgeFee = Math.max(0, trip.fare - baseFare - distanceFee - timeFee - 2)
  const platformFee = 2
  return {
    baseFare,
    distanceFee,
    timeFee,
    surgeFee,
    platformFee,
    total: trip.fare,
    paymentMethod: 'Card ending 4242',
  }
}

function buildTimeline(trip: Trip): TripTimelineEvent[] {
  const base = new Date(trip.startedAt).getTime()
  const steps = [
    { label: 'Trip Requested', offset: 0 },
    { label: 'Driver Accepted', offset: 2 },
    { label: 'Driver En Route', offset: 5 },
    { label: 'Driver Arrived', offset: 12 },
    { label: 'Trip In Progress', offset: 15 },
    { label: 'Trip Completed', offset: 28 },
  ]

  const statusOrder = ['requested', 'accepted', 'in_progress', 'completed', 'cancelled'] as const
  const currentIndex =
    trip.status === 'cancelled'
      ? 2
      : Math.max(0, statusOrder.indexOf(trip.status as (typeof statusOrder)[number]))

  return steps.map((step, index) => {
    let status: TripTimelineEvent['status'] = 'pending'
    if (trip.status === 'completed' && index <= steps.length - 1) {
      status = index === steps.length - 1 ? 'current' : 'completed'
    } else if (index < currentIndex) {
      status = 'completed'
    } else if (index === currentIndex) {
      status = 'current'
    }

    if (trip.status === 'cancelled' && index >= 3) {
      status = 'pending'
    }

    return {
      id: `${trip.id}-tl-${index}`,
      label: step.label,
      timestamp: new Date(base + step.offset * 60000).toISOString(),
      status,
    }
  })
}

function buildCancellationHistory(trip: Trip): TripCancellationEntry[] {
  if (trip.status !== 'cancelled') return []

  return [
    {
      id: `${trip.id}-cancel-1`,
      actor: 'passenger',
      reason: 'Changed My Mind',
      timestamp: new Date(new Date(trip.startedAt).getTime() + 8 * 60000).toISOString(),
      feeApplied: 5,
    },
  ]
}

function buildSafetyEvents(trip: Trip, index: number): TripSafetyEvent[] {
  if (index % 9 !== 0) return []

  return [
    {
      id: `${trip.id}-safety-1`,
      type: 'alert',
      description: 'Route deviation detected — auto-check sent to passenger',
      timestamp: new Date(new Date(trip.startedAt).getTime() + 18 * 60000).toISOString(),
      status: 'resolved',
    },
  ]
}

function buildLiveMap(trip: Trip): TripLiveMapData {
  const isLive = trip.status === 'in_progress' || trip.status === 'accepted'
  const progressByStatus: Record<Trip['status'], number> = {
    requested: 5,
    accepted: 18,
    in_progress: 52 + (parseInt(trip.id.replace(/\D/g, ''), 10) % 35),
    completed: 100,
    cancelled: 0,
  }

  return {
    driverLocation: isLive
      ? `En route near ${trip.pickup.split(',')[0]}`
      : trip.status === 'completed'
        ? trip.dropoff
        : trip.pickup,
    pickupLabel: trip.pickup,
    dropoffLabel: trip.dropoff,
    routeSummary: `${trip.pickup.split(',')[0]} → ${trip.dropoff.split(',')[0]}`,
    etaMinutes: isLive ? 6 + (parseInt(trip.id.replace(/\D/g, ''), 10) % 12) : 0,
    routeProgressPercent: progressByStatus[trip.status],
    isLive,
  }
}

export function buildTripDetail(tripId: string): TripDetail | undefined {
  const trip = mockTrips.find((item) => item.id === tripId)
  if (!trip) return undefined

  const index = mockTrips.findIndex((item) => item.id === tripId)
  const driver = mockDrivers.find((item) => item.id === trip.driverId)
  const passenger = mockPassengers.find((item) => item.id === trip.passengerId)

  return {
    ...trip,
    distanceMiles: Number((8 + (index % 9) * 1.4).toFixed(1)),
    durationMinutes: 18 + (index % 7) * 4,
    fareBreakdown: buildFareBreakdown(trip),
    timeline: buildTimeline(trip),
    cancellationHistory: buildCancellationHistory(trip),
    safetyEvents: buildSafetyEvents(trip, index),
    liveMap: buildLiveMap(trip),
    driver,
    passenger,
  }
}
