import { AlertTriangle, CheckCircle, Clock, ScanFace, ShieldAlert } from 'lucide-react'
import { useGetIdentityVerificationOverviewQuery } from '@/services/driverVerificationApi'
import { formatNumber } from '@/utils/format'

const overviewConfig: Array<{
  key: keyof import('@/types/driverVerification').IdentityVerificationOverview
  label: string
  icon: typeof CheckCircle
  iconClass: string
  bgClass: string
}> = [
  { key: 'verifiedDrivers', label: 'Verified Drivers', icon: CheckCircle, iconClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10' },
  { key: 'pendingReVerification', label: 'Pending Re-Verification', icon: Clock, iconClass: 'text-amber-400', bgClass: 'bg-amber-500/10' },
  { key: 'verificationRequired', label: 'Verification Required', icon: ScanFace, iconClass: 'text-orange-400', bgClass: 'bg-orange-500/10' },
  { key: 'failedVerifications', label: 'Failed Verifications', icon: ShieldAlert, iconClass: 'text-red-400', bgClass: 'bg-red-500/10' },
  { key: 'driversUnderReview', label: 'Drivers Under Review', icon: AlertTriangle, iconClass: 'text-indigo-400', bgClass: 'bg-indigo-500/10' },
]

export function DriverVerificationOverviewCards() {
  const { data, isLoading } = useGetIdentityVerificationOverviewQuery()

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
      {overviewConfig.map(({ key, label, icon: Icon, iconClass, bgClass }) => (
        <div key={key} className="glass-card p-5">
          <div className={`rounded-xl p-2.5 w-fit ${bgClass}`}>
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
  )
}
