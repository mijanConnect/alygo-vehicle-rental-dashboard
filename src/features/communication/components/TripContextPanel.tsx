import { Tag } from 'antd'
import { Car, Clock, MapPin, Navigation, User } from 'lucide-react'
import type { Trip } from '@/types'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { StatusBadge } from '@/components/common/StatusBadge'
import { formatCurrency } from '@/utils/format'

interface TripContextPanelProps {
  trip: Trip
  vehicle?: string
}

function tripDuration(startedAt: string) {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000))
  return `${mins} min`
}

export function TripContextPanel({ trip, vehicle }: TripContextPanelProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Car className="h-4 w-4 text-indigo-400" />
        <h4 className="text-sm font-semibold text-white">Trip Context</h4>
        <Tag color="processing" className="ml-auto !m-0">
          Live
        </Tag>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Info label="Trip ID" value={trip.id} />
        <Info label="Driver" value={trip.driverName} icon={User} />
        <Info label="Passenger" value={trip.passengerName} icon={User} />
        <Info label="Vehicle" value={vehicle ?? '—'} />
        <Info label="Ride Category" value={RIDE_CATEGORY_LABELS[trip.category]} />
        <Info label="Current Status" value={<StatusBadge status={trip.status} />} />
        <Info label="Current Fare" value={formatCurrency(trip.fare)} />
        <Info label="Trip Start" value={new Date(trip.startedAt).toLocaleTimeString()} icon={Clock} />
        <Info label="Duration" value={tripDuration(trip.startedAt)} icon={Clock} />
        <Info label="City" value={trip.city} />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-white/5 bg-black/20 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase text-alygo-text-muted">
            <MapPin className="h-3 w-3" /> Pickup
          </p>
          <p className="text-sm text-white">{trip.pickup}</p>
        </div>
        <div className="rounded-lg border border-white/5 bg-black/20 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase text-alygo-text-muted">
            <Navigation className="h-3 w-3" /> Destination
          </p>
          <p className="text-sm text-white">{trip.dropoff}</p>
        </div>
      </div>
    </div>
  )
}

function Info({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  icon?: typeof User
}) {
  return (
    <div>
      <p className="mb-0.5 flex items-center gap-1 text-[11px] uppercase tracking-wide text-alygo-text-muted">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <div className="text-sm text-white">{value}</div>
    </div>
  )
}
