import { AlertTriangle, CheckCircle, DollarSign, Users } from 'lucide-react'
import {
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetTripCompletionAnalyticsQuery } from '@/services/tripCompletionReviewApi'
import { formatNumber } from '@/utils/format'

const cardConfig = [
  { key: 'totalComplaints', label: 'Total Complaints', icon: AlertTriangle },
  { key: 'approvedRefunds', label: 'Approved Refunds', icon: CheckCircle },
  { key: 'fareAdjustments', label: 'Fare Adjustments', icon: DollarSign },
  { key: 'repeatOffenders', label: 'Repeat Offenders', icon: Users },
]

export function TripCompletionAnalytics() {
  const { data, isLoading } = useGetTripCompletionAnalyticsQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cardConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="glass-card p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatNumber(data[key as keyof typeof data] as number)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Complaint Trend" subtitle="Monthly complaints filed">
          <LineTrendChart data={data.complaintTrend} color="#ef4444" />
        </ChartCard>
        <ChartCard title="Resolution Breakdown" subtitle="Complaint outcomes">
          <CategoryPieChart data={data.resolutionBreakdown} />
        </ChartCard>
      </div>
    </div>
  )
}
