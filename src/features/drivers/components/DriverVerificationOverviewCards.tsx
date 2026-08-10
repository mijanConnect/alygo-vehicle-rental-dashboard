import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Users,
  Wifi,
} from 'lucide-react'
import { useGetDriverManagementSummaryQuery } from '@/redux/api/driverManagementApi'
import { formatNumber } from '@/utils/format'

const overviewConfig = [
  {
    key: 'totalDrivers' as const,
    label: 'Total Drivers',
    icon: Users,
    iconClass: 'text-indigo-400',
    bgClass: 'bg-indigo-500/10',
  },
  {
    key: 'onlineDrivers' as const,
    label: 'Online Drivers',
    icon: Wifi,
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
  {
    key: 'pendingApproval' as const,
    label: 'Pending Approval',
    icon: Clock,
    iconClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
  },
  {
    key: 'suspendedDrivers' as const,
    label: 'Suspended',
    icon: ShieldAlert,
    iconClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
  },
  {
    key: 'compliancePending' as const,
    label: 'Compliance Pending',
    icon: AlertTriangle,
    iconClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
  },
  {
    key: 'verifiedDrivers' as const,
    label: 'Verified Drivers',
    icon: CheckCircle,
    iconClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
  },
]

export function DriverVerificationOverviewCards() {
  const { data, isLoading } = useGetDriverManagementSummaryQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {overviewConfig.map(({ key, label, icon: Icon, iconClass, bgClass }) => (
          <div key={key} className="glass-card p-5">
            <div className={`w-fit rounded-xl p-2.5 ${bgClass}`}>
              <Icon className={`h-5 w-5 ${iconClass}`} />
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

      {(data.activeTiers?.length ?? 0) > 0 && (
        <div className="glass-card p-4">
          <p className="mb-3 text-sm font-medium text-white">Active Tiers</p>
          <div className="flex flex-wrap gap-2">
            {data.activeTiers.map((tier) => (
              <div
                key={`${tier.tierId ?? 'none'}-${tier.name}`}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
              >
                <span className="text-white">{tier.name}</span>
                <span className="ml-2 text-alygo-text-muted">
                  {formatNumber(tier.count)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
