import { AlertTriangle, CheckCircle, Shield, Siren } from 'lucide-react'
import { useGetSafetyOverviewQuery } from '@/services/safetyIncidentApi'
import type { SafetyOverview } from '@/types/safetyIncident'
import { formatNumber } from '@/utils/format'

const overviewConfig: Array<{
  key: keyof SafetyOverview
  label: string
  icon: typeof Shield
}> = [
  { key: 'openCases', label: 'Open Cases', icon: AlertTriangle },
  { key: 'criticalCases', label: 'Critical Cases', icon: Siren },
  { key: 'sosAlerts', label: 'SOS Alerts', icon: Shield },
  { key: 'resolvedCases', label: 'Resolved Cases', icon: CheckCircle },
]

export function SafetyOverviewCards() {
  const { data, isLoading } = useGetSafetyOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="w-fit rounded-xl bg-indigo-500/10 p-2.5">
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
