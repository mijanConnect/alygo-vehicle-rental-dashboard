import { MapPin, Shield, Sliders, AlertTriangle } from 'lucide-react'
import { useGetStateRulesSummaryQuery } from '@/services/drivingHoursApi'
import { formatNumber } from '@/utils/format'

const cards = [
  { key: 'totalStates', label: 'Total States', icon: MapPin },
  { key: 'activeStates', label: 'Active States', icon: Shield },
  { key: 'customStates', label: 'Custom States', icon: Sliders },
  { key: 'violations', label: 'Violations', icon: AlertTriangle },
] as const

export function StateRulesSummaryCards() {
  const { data, isLoading } = useGetStateRulesSummaryQuery()

  if (isLoading || !data) {
    return (
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-white/5 bg-white/[0.02]" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <div key={key} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-indigo-400" />
            <p className="text-xs text-alygo-text-muted">{label}</p>
          </div>
          <p className="mt-2 text-xl font-semibold text-white">{formatNumber(data[key])}</p>
        </div>
      ))}
    </div>
  )
}
