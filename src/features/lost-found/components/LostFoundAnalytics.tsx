import { useEffect } from 'react'
import {
  Clock,
  DollarSign,
  Package,
  Percent,
  TrendingUp,
} from 'lucide-react'
import {
  BarTrendChart,
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import {
  useGetLostAndFoundAnalyticsCategoryDistributionQuery,
  useGetLostAndFoundAnalyticsCityReportsQuery,
  useGetLostAndFoundAnalyticsMostLostItemsQuery,
  useGetLostAndFoundAnalyticsOverviewQuery,
  useGetLostAndFoundAnalyticsReportsTrendQuery,
  type LostFoundAnalyticsOverview,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { socketService } from '@/services/socket'
import { formatCurrency, formatNumber } from '@/utils/format'

const kpiConfig: {
  key: keyof LostFoundAnalyticsOverview
  label: string
  icon: typeof Package
  format: 'number' | 'percent' | 'hours' | 'currency'
}[] = [
  { key: 'reportsThisMonth', label: 'Reports This Month', icon: Package, format: 'number' },
  { key: 'foundRate', label: 'Found Rate', icon: Percent, format: 'percent' },
  { key: 'returnSuccessRate', label: 'Return Success Rate', icon: TrendingUp, format: 'percent' },
  {
    key: 'averageResolutionHours',
    label: 'Average Resolution Time',
    icon: Clock,
    format: 'hours',
  },
  {
    key: 'driverCompensationPaid',
    label: 'Driver Compensation Paid',
    icon: DollarSign,
    format: 'currency',
  },
]

function formatKpi(value: number, format: (typeof kpiConfig)[number]['format']) {
  switch (format) {
    case 'currency':
      return formatCurrency(value)
    case 'percent':
      return `${value}%`
    case 'hours':
      return `${value} hrs`
    default:
      return formatNumber(value)
  }
}

export function LostFoundAnalytics() {
  const overviewQuery = useGetLostAndFoundAnalyticsOverviewQuery()
  const trendQuery = useGetLostAndFoundAnalyticsReportsTrendQuery()
  const mostLostQuery = useGetLostAndFoundAnalyticsMostLostItemsQuery()
  const cityQuery = useGetLostAndFoundAnalyticsCityReportsQuery()
  const categoryQuery = useGetLostAndFoundAnalyticsCategoryDistributionQuery()

  useEffect(() => {
    const handleUpdate = () => {
      void overviewQuery.refetch()
      void trendQuery.refetch()
      void mostLostQuery.refetch()
      void cityQuery.refetch()
      void categoryQuery.refetch()
    }
    socketService.on('lost-found:stats-update', handleUpdate)
    return () => {
      socketService.off('lost-found:stats-update', handleUpdate)
    }
  }, [overviewQuery, trendQuery, mostLostQuery, cityQuery, categoryQuery])

  const isLoading =
    overviewQuery.isLoading ||
    trendQuery.isLoading ||
    mostLostQuery.isLoading ||
    cityQuery.isLoading ||
    categoryQuery.isLoading

  if (isLoading || !overviewQuery.data) {
    return (
      <div className="glass-card p-8 text-center text-alygo-text-muted">
        Loading analytics...
      </div>
    )
  }

  const overview = overviewQuery.data
  const trend = trendQuery.data ?? []
  const mostLostItems = mostLostQuery.data ?? []
  const cityReports = cityQuery.data ?? []
  const categoryDistribution = categoryQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {kpiConfig.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-2.5">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatKpi(overview[key], format)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Lost Item Trends" subtitle="Monthly lost item reports">
          <LineTrendChart data={trend} />
        </ChartCard>
        <ChartCard title="Most Lost Items" subtitle="Top reported item types">
          <BarTrendChart data={mostLostItems} />
        </ChartCard>
        <ChartCard title="City Based Reports" subtitle="Reports by city">
          <BarTrendChart data={cityReports} />
        </ChartCard>
        <ChartCard title="Category Distribution" subtitle="Item category breakdown">
          <CategoryPieChart data={categoryDistribution} />
        </ChartCard>
      </div>
    </div>
  )
}
