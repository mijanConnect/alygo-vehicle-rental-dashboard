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
import { useGetLostFoundAnalyticsQuery } from '@/services/lostFoundApi'
import { socketService } from '@/services/socket'
import { formatCurrency, formatNumber } from '@/utils/format'

const analyticsConfig = [
  { key: 'reportsThisMonth', label: 'Reports This Month', icon: Package, format: 'number' as const },
  { key: 'foundRate', label: 'Found Rate', icon: Percent, format: 'percent' as const },
  { key: 'returnSuccessRate', label: 'Return Success Rate', icon: TrendingUp, format: 'percent' as const },
  { key: 'avgResolutionTimeHours', label: 'Average Resolution Time', icon: Clock, format: 'hours' as const },
  { key: 'driverCompensationPaid', label: 'Driver Compensation Paid', icon: DollarSign, format: 'currency' as const },
]

export function LostFoundAnalytics() {
  const { data, isLoading, refetch } = useGetLostFoundAnalyticsQuery()

  useEffect(() => {
    const handleUpdate = () => refetch()
    socketService.on('lost-found:stats-update', handleUpdate)
    return () => {
      socketService.off('lost-found:stats-update', handleUpdate)
    }
  }, [refetch])

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  const formatValue = (key: string, value: number) => {
    const config = analyticsConfig.find((c) => c.key === key)
    if (!config) return formatNumber(value)
    switch (config.format) {
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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {analyticsConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="glass-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-xl bg-indigo-500/10 p-2.5">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatValue(key, data[key as keyof typeof data] as number)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Lost Item Trends" subtitle="Monthly lost item reports">
          <LineTrendChart data={data.trend} />
        </ChartCard>
        <ChartCard title="Most Lost Items" subtitle="Top reported item types">
          <BarTrendChart data={data.mostLostItems} />
        </ChartCard>
        <ChartCard title="City Based Reports" subtitle="Reports by city">
          <BarTrendChart data={data.cityReports} />
        </ChartCard>
        <ChartCard title="Category Distribution" subtitle="Item category breakdown">
          <CategoryPieChart data={data.categoryDistribution} />
        </ChartCard>
        <ChartCard title="Monthly Return Rate" subtitle="Successful return percentage" className="lg:col-span-2">
          <LineTrendChart data={data.monthlyReturnRate} color="#10b981" />
        </ChartCard>
      </div>
    </div>
  )
}
