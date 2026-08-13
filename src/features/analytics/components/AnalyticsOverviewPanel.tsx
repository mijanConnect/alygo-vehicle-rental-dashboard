import { KpiCard } from '@/components/dashboard/KpiCard'
import { ChartCard, LineTrendChart, RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import { useGetOverviewAnalyticsQuery } from '@/redux/api/analyticsApi'
import { useAppSelector } from '@/store/hooks'
import { formatNumber } from '@/utils/format'

export function AnalyticsOverviewPanel() {
  const liveKpis = useAppSelector((state) => state.auth.liveKpis)
  const { data, isLoading, error } = useGetOverviewAnalyticsQuery()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card h-32 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card h-24 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-card h-80 animate-pulse" />
          <div className="glass-card h-80 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="glass-card p-6 text-center text-red-400">
        <p className="text-lg font-semibold">Failed to load overview analytics data</p>
        <p className="text-sm mt-1">Please try again later or contact support if the issue persists.</p>
      </div>
    )
  }

  const primaryKpis = [
    {
      key: 'totalDrivers',
      label: 'Total Drivers',
      value: data.totalDrivers,
      change: 0,
      format: 'number' as const,
      icon: 'users',
    },
    {
      key: 'totalPassengers',
      label: 'Total Passengers',
      value: data.totalPassengers,
      change: 0,
      format: 'number' as const,
      icon: 'user-check',
    },
    {
      key: 'activeTrips',
      label: 'Active Trips',
      value: data.activeTrips,
      change: 0,
      format: 'number' as const,
      icon: 'car',
    },
    {
      key: 'revenueMonth',
      label: 'Revenue This Month',
      value: data.revenueThisMonth,
      change: 0,
      format: 'currency' as const,
      icon: 'trending-up',
    },
    {
      key: 'scheduledRides',
      label: 'Scheduled Rides',
      value: data.scheduledRides,
      change: 0,
      format: 'number' as const,
      icon: 'calendar',
    },
  ]

  const operationalMetrics = [
    { label: 'Completed Trips (Today)', value: formatNumber(data.completedTripsToday), change: '+0.0%' },
    { label: 'Acceptance Rate', value: `${data.acceptanceRate.toFixed(1)}%`, change: '+0.0%' },
    { label: 'Completion Rate', value: `${data.completionRate.toFixed(1)}%`, change: '+0.0%' },
    { label: 'Cancellation Rate', value: `${data.cancellationRate.toFixed(1)}%`, change: '+0.0%' },
    { label: 'SOS Incidents (7d)', value: '0', change: '+0.0%' },
    { label: 'Reservations (Active)', value: formatNumber(data.activeReservations), change: '+0.0%' },
  ]

  const revenueTrendData = (data.revenueTrend ?? []).map((point) => ({
    label: point.day,
    value: point.revenue,
  }))

  const demandTrendData = (data.demandTrend ?? []).map((point) => ({
    label: point.time,
    value: point.demand,
  }))

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
          <RevenueTrendChart data={revenueTrendData} />
        </ChartCard>
        <ChartCard title="Demand Trend" subtitle="Trip demand by hour">
          <LineTrendChart data={demandTrendData} color="#22d3ee" />
        </ChartCard>
      </div>
    </div>
  )
}

