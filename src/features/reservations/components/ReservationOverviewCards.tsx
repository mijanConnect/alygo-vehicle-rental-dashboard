interface ReservationOverviewCardsProps {
  statistics?: {
    totalReservations: number
    scheduledReservations: number
    airportReservations: number
    eventReservations: number
    pendingAssignments: number
    completedReservations: number
  }
}

export function ReservationOverviewCards({ statistics }: ReservationOverviewCardsProps) {
  const metrics = [
    { label: 'Total Reservations', value: statistics?.totalReservations ?? 0 },
    { label: 'Scheduled Reservations', value: statistics?.scheduledReservations ?? 0 },
    { label: 'Airport Reservations', value: statistics?.airportReservations ?? 0 },
    { label: 'Event Reservations', value: statistics?.eventReservations ?? 0 },
    { label: 'Pending Assignments', value: statistics?.pendingAssignments ?? 0 },
    { label: 'Completed Reservations', value: statistics?.completedReservations ?? 0 },
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
