import type { Reservation } from '@/types'
import { computeReservationOverview } from '@/features/reservations/reservationData'

interface ReservationOverviewCardsProps {
  reservations: Reservation[]
}

export function ReservationOverviewCards({ reservations }: ReservationOverviewCardsProps) {
  const overview = computeReservationOverview(reservations)

  const metrics = [
    { label: 'Total Reservations', value: overview.total },
    { label: 'Scheduled Reservations', value: overview.scheduled },
    { label: 'Airport Reservations', value: overview.airport },
    { label: 'Event Reservations', value: overview.event },
    { label: 'Pending Assignments', value: overview.pendingAssignments },
    { label: 'Completed Reservations', value: overview.completed },
  ]

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">{m.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{m.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
