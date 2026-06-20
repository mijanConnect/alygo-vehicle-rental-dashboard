import { AlertTriangle, CheckCircle, Clock, Search, XCircle } from 'lucide-react'
import { useGetTripCompletionOverviewQuery } from '@/services/tripCompletionReviewApi'
import { formatNumber } from '@/utils/format'

const overviewConfig = [
  { key: 'totalComplaints', label: 'Total Complaints', icon: AlertTriangle },
  { key: 'pendingReview', label: 'Pending Review', icon: Clock },
  { key: 'underInvestigation', label: 'Under Investigation', icon: Search },
  { key: 'approvedRefunds', label: 'Approved Refunds', icon: CheckCircle },
  { key: 'rejectedComplaints', label: 'Rejected', icon: XCircle },
] as const

export function TripCompletionOverviewCards() {
  const { data, isLoading } = useGetTripCompletionOverviewQuery()

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
