import type { Reservation } from '@/types'

export const RESERVATION_TYPE_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Airport', value: 'airport' },
  { label: 'Event', value: 'event' },
] as const

export const RESERVATION_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export const RESERVATION_TYPE_LABELS: Record<Reservation['type'], string> = {
  scheduled: 'Scheduled',
  airport: 'Airport',
  event: 'Event',
  business: 'Business',
}

export interface ReservationFilters {
  type: string
  status: string
  search: string
  driver: string
  passenger: string
  airport: string
  city: string
  dateFrom?: string
  dateTo?: string
}

export function computeReservationOverview(reservations: Reservation[]) {
  const pendingAssignments = reservations.filter(
    (r) => r.status === 'pending' || (r.status === 'assigned' && !r.driverName),
  ).length

  return {
    total: reservations.length,
    scheduled: reservations.filter((r) => r.type === 'scheduled').length,
    airport: reservations.filter((r) => r.type === 'airport').length,
    event: reservations.filter((r) => r.type === 'event').length,
    pendingAssignments,
    completed: reservations.filter((r) => r.status === 'completed').length,
  }
}

export function filterReservations(reservations: Reservation[], filters: ReservationFilters) {
  return reservations.filter((r) => {
    if (filters.type && r.type !== filters.type) return false
    if (filters.status && r.status !== filters.status) return false
    if (filters.driver && !(r.driverName ?? '').toLowerCase().includes(filters.driver.toLowerCase())) return false
    if (filters.passenger && !r.passengerName.toLowerCase().includes(filters.passenger.toLowerCase())) return false
    if (filters.airport && !(r.airportCode ?? '').toLowerCase().includes(filters.airport.toLowerCase())) return false
    if (filters.city && !(r.city ?? '').toLowerCase().includes(filters.city.toLowerCase())) return false
    if (filters.dateFrom && r.scheduledAt < filters.dateFrom) return false
    if (filters.dateTo && r.scheduledAt > filters.dateTo) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const haystack = [r.id, r.passengerName, r.pickup, r.dropoff, r.driverName ?? '', r.eventName ?? ''].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function reservationTimeline(reservation: Reservation) {
  const events = [
    { time: reservation.createdAt, label: 'Reservation created', status: 'completed' },
  ]
  if (reservation.driverName) {
    events.push({ time: reservation.scheduledAt, label: `Driver assigned — ${reservation.driverName}`, status: 'completed' })
  }
  if (reservation.status === 'in_progress') {
    events.push({ time: reservation.scheduledAt, label: 'Trip in progress', status: 'active' })
  }
  if (reservation.status === 'completed') {
    events.push({ time: reservation.scheduledAt, label: 'Trip completed', status: 'completed' })
  }
  if (reservation.status === 'cancelled') {
    events.push({ time: reservation.scheduledAt, label: 'Reservation cancelled', status: 'cancelled' })
  }
  return events
}

export function reservationActivityLog(reservation: Reservation) {
  return [
    { at: reservation.createdAt, actor: 'System', action: 'Reservation created', detail: `${RESERVATION_TYPE_LABELS[reservation.type]} booking` },
    ...(reservation.driverName
      ? [{ at: reservation.scheduledAt, actor: 'Dispatch', action: 'Driver assigned', detail: reservation.driverName }]
      : []),
    { at: reservation.scheduledAt, actor: 'Admin', action: 'Status updated', detail: reservation.status },
  ]
}
