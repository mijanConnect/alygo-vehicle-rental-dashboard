import { AlertTriangle, CheckCircle, Clock, Search, XCircle } from 'lucide-react'
import { ChartCard, LineTrendChart } from '@/components/charts/AnalyticsCharts'
import {
  useGetTripReportsAnalyticsReportsTrendQuery,
  useGetTripReportsAnalyticsStatsQuery,
  type TripCompletionComplaintStats,
} from '@/redux/api/tripReportApi'
import { formatNumber } from '@/utils/format'

const cardConfig: {
  key: keyof TripCompletionComplaintStats
  label: string
  icon: typeof AlertTriangle
}[] = [
  { key: 'totalComplaints', label: 'Total Complaints', icon: AlertTriangle },
  { key: 'pendingReview', label: 'Pending Review', icon: Clock },
  { key: 'underInvestigation', label: 'Under Investigation', icon: Search },
  { key: 'approvedRefunds', label: 'Approved Refunds', icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', icon: XCircle },
]

export function TripCompletionAnalytics() {
  const statsQuery = useGetTripReportsAnalyticsStatsQuery()
  const trendQuery = useGetTripReportsAnalyticsReportsTrendQuery()

  const isLoading = statsQuery.isLoading || trendQuery.isLoading

  if (isLoading || !statsQuery.data) {
    return (
      <div className="glass-card p-8 text-center text-alygo-text-muted">
        Loading analytics...
      </div>
    )
  }

  const stats = statsQuery.data
  const trend = trendQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {cardConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="glass-card p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatNumber(stats[key])}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <ChartCard title="Complaint Trend" subtitle="Monthly complaints filed">
          <LineTrendChart data={trend} color="#ef4444" />
        </ChartCard>
      </div>
    </div>
  )
}
