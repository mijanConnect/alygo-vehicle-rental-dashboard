import {
  BarTrendChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetDrivingHoursAnalyticsQuery } from '@/services/drivingHoursApi'

export function DrivingHoursAnalytics() {
  const { data, isLoading } = useGetDrivingHoursAnalyticsQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Violation Trend" subtitle="Monthly driving hour violations">
        <LineTrendChart data={data.violationTrend} color="#ef4444" />
      </ChartCard>
      <ChartCard title="Compliance Rate" subtitle="Monthly compliance (%)">
        <LineTrendChart data={data.complianceRate} color="#10b981" />
      </ChartCard>
      <ChartCard title="Hours by City" subtitle="Total driving hours" className="lg:col-span-2">
        <BarTrendChart data={data.hoursByCity} />
      </ChartCard>
    </div>
  )
}
