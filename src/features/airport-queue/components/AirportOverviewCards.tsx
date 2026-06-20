import { Car, Clock, Plane, Route } from 'lucide-react'
import { useGetAirportQueueOverviewQuery } from '@/services/airportQueueApi'
import { formatNumber } from '@/utils/format'

const overviewConfig: Array<{
  key: keyof import('@/types/airportQueue').AirportQueueOverview
  label: string
  icon: typeof Plane
  suffix?: string
}> = [
  { key: 'activeAirports', label: 'Active Airports', icon: Plane },
  { key: 'driversInQueue', label: 'Drivers In Queue', icon: Car },
  { key: 'averageWaitTimeMinutes', label: 'Average Wait Time', icon: Clock, suffix: ' min' },
  { key: 'completedAirportTrips', label: 'Completed Airport Trips', icon: Route },
]

export function AirportOverviewCards() {
  const { data, isLoading } = useGetAirportQueueOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewConfig.map(({ key, label, icon: Icon, suffix = '' }) => (
        <div key={key} className="glass-card p-5">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(data[key])}{suffix}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
