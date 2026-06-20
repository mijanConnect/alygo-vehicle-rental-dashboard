import { KpiCard } from '@/components/dashboard/KpiCard'
import { ChartCard, LineTrendChart, RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import { useGetDashboardKpisQuery, useGetDemandTrendQuery, useGetRevenueTrendQuery } from '@/services/api'
import { useAppSelector } from '@/store/hooks'

const OVERVIEW_KPI_KEYS = [
  'revenueMonth',
  'activeTrips',
  'totalDrivers',
  'totalPassengers',
  'scheduledRides',
] as const

export function AnalyticsOverviewPanel() {
  const liveKpis = useAppSelector((state) => state.auth.liveKpis)
  const { data: kpis = [] } = useGetDashboardKpisQuery()
  const { data: revenueTrend = [] } = useGetRevenueTrendQuery()
  const { data: demandTrend = [] } = useGetDemandTrendQuery()

  const primaryKpis = kpis.filter((k) =>
    OVERVIEW_KPI_KEYS.includes(k.key as (typeof OVERVIEW_KPI_KEYS)[number]),
  )

  const operationalMetrics = [
    { label: 'Completed Trips (Today)', value: '4,218', change: '+6.2%' },
    { label: 'Acceptance Rate', value: '87.4%', change: '+1.1%' },
    { label: 'Completion Rate', value: '94.8%', change: '+0.4%' },
    { label: 'Cancellation Rate', value: '5.2%', change: '-0.3%' },
    { label: 'SOS Incidents (7d)', value: '3', change: '-2' },
    { label: 'Reservations (Active)', value: '156', change: '+9.1%' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {primaryKpis.map((metric) => (
          <KpiCard key={metric.key} metric={metric} liveValue={liveKpis[metric.key]} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {operationalMetrics.map((m) => (
          <div key={m.label} className="glass-card p-4">
            <p className="text-sm text-alygo-text-muted">{m.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{m.value}</p>
            <p className="mt-1 text-xs text-emerald-400">{m.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Platform revenue over time">
          <RevenueTrendChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Demand Trend" subtitle="Trip demand by hour">
          <LineTrendChart data={demandTrend} color="#22d3ee" />
        </ChartCard>
      </div>
    </div>
  )
}
