import { useEffect } from 'react'
import { Ban, Car, DollarSign, Users, Wallet } from 'lucide-react'
import {
  BarTrendChart,
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import {
  useGetCancellationByCategoriesQuery,
  useGetCancellationByCitiesQuery,
  useGetCancellationReasonsStatsQuery,
  useGetCancellationSummaryQuery,
  useGetCancellationTrendsQuery,
  type CancellationAnalyticsSummary,
} from '@/redux/api/cancellationAnalyticsApi'
import { socketService } from '@/services/socket'
import { formatCurrency, formatNumber } from '@/utils/format'

const kpiConfig: {
  key: keyof CancellationAnalyticsSummary
  label: string
  icon: typeof Ban
  format: 'number' | 'currency'
}[] = [
  { key: 'totalCancellations', label: 'Total Cancellations', icon: Ban, format: 'number' },
  { key: 'passengerCancellations', label: 'Passenger Cancellations', icon: Users, format: 'number' },
  { key: 'driverCancellations', label: 'Driver Cancellations', icon: Car, format: 'number' },
  { key: 'feesCollected', label: 'Fees Collected', icon: DollarSign, format: 'currency' },
  { key: 'totalDriverPaid', label: 'Driver Compensation Paid', icon: Wallet, format: 'currency' },
]

export function CancellationAnalytics() {
  const summaryQuery = useGetCancellationSummaryQuery()
  const trendsQuery = useGetCancellationTrendsQuery()
  const reasonsQuery = useGetCancellationReasonsStatsQuery()
  const citiesQuery = useGetCancellationByCitiesQuery()
  const categoriesQuery = useGetCancellationByCategoriesQuery()

  useEffect(() => {
    const handleUpdate = () => {
      void summaryQuery.refetch()
      void trendsQuery.refetch()
      void reasonsQuery.refetch()
      void citiesQuery.refetch()
      void categoriesQuery.refetch()
    }
    socketService.on('cancellation:stats-update', handleUpdate)
    return () => {
      socketService.off('cancellation:stats-update', handleUpdate)
    }
  }, [summaryQuery, trendsQuery, reasonsQuery, citiesQuery, categoriesQuery])

  const isLoading =
    summaryQuery.isLoading ||
    trendsQuery.isLoading ||
    reasonsQuery.isLoading ||
    citiesQuery.isLoading ||
    categoriesQuery.isLoading

  if (isLoading || !summaryQuery.data) {
    return (
      <div className="glass-card p-8 text-center text-alygo-text-muted">
        Loading analytics...
      </div>
    )
  }

  const summary = summaryQuery.data
  const trend = trendsQuery.data ?? []
  const topReasons = reasonsQuery.data ?? []
  const byCity = citiesQuery.data ?? []
  const byCategory = categoriesQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {kpiConfig.map(({ key, label, icon: Icon, format }) => {
          const value = summary[key]
          const formatted =
            format === 'currency' ? formatCurrency(value) : formatNumber(value)
          return (
            <div key={key} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl bg-indigo-500/10 p-2.5">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-alygo-text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {formatted}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Cancellation Trends" subtitle="Daily cancelled rides">
          <LineTrendChart data={trend} />
        </ChartCard>
        <ChartCard
          title="Most Common Cancellation Reasons"
          subtitle="Top cancellation reasons"
        >
          <BarTrendChart data={topReasons} />
        </ChartCard>
        <ChartCard title="Cancellation Rate by City" subtitle="Cancellations per city">
          <BarTrendChart data={byCity} />
        </ChartCard>
        <ChartCard
          title="Cancellation Rate by Ride Category"
          subtitle="Distribution by ride type"
        >
          <CategoryPieChart data={byCategory} />
        </ChartCard>
      </div>
    </div>
  )
}
