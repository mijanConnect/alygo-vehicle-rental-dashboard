import { Car, CheckCircle, Clock, Users, XCircle } from 'lucide-react'
import { useGetStateActivationOverviewQuery } from '@/services/stateActivationApi'
import { formatNumber } from '@/utils/format'

const overviewConfig = [
  { key: 'totalActiveStates', label: 'Total Active States', icon: CheckCircle },
  { key: 'disabledStates', label: 'Disabled States', icon: XCircle },
  { key: 'pendingLaunchStates', label: 'Pending Launch States', icon: Clock },
  { key: 'totalActiveDrivers', label: 'Active Drivers (Active States)', icon: Car },
  { key: 'totalActivePassengers', label: 'Active Passengers (Active States)', icon: Users },
] as const

export function StateActivationOverviewCards() {
  const { data, isLoading } = useGetStateActivationOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {overviewConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
