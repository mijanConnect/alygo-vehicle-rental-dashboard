import { useEffect } from 'react'
import {
  Ban,
  Car,
  DollarSign,
  UserMinus,
  Users,
  Wallet,
} from 'lucide-react'
import {
  BarTrendChart,
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetCancellationAnalyticsQuery } from '@/services/cancellationApi'
import { socketService } from '@/services/socket'
import { formatCurrency, formatNumber } from '@/utils/format'

const kpiConfig = [
  { key: 'totalToday', label: 'Total Cancellations Today', icon: Ban, format: 'number' as const },
  { key: 'passengerCancellations', label: 'Passenger Cancellations', icon: Users, format: 'number' as const },
  { key: 'driverCancellations', label: 'Driver Cancellations', icon: Car, format: 'number' as const },
  { key: 'noShowCases', label: 'No Show Cases', icon: UserMinus, format: 'number' as const },
  { key: 'feesCollected', label: 'Fees Collected', icon: DollarSign, format: 'currency' as const },
  { key: 'driverCompensationPaid', label: 'Driver Compensation Paid', icon: Wallet, format: 'currency' as const },
]

export function CancellationAnalytics() {
  const { data, isLoading, refetch } = useGetCancellationAnalyticsQuery()

  useEffect(() => {
    const handleUpdate = () => {
      refetch()
    }
    socketService.on('cancellation:stats-update', handleUpdate)
    return () => {
      socketService.off('cancellation:stats-update', handleUpdate)
    }
  }, [refetch])

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  const { summary, trend, topReasons, byCity, byCategory } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiConfig.map(({ key, label, icon: Icon, format }) => {
          const value = summary[key as keyof typeof summary]
          const formatted = format === 'currency' ? formatCurrency(value) : formatNumber(value)
          return (
            <div key={key} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-xl bg-indigo-500/10 p-2.5">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-alygo-text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{formatted}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Cancellation Trends" subtitle="Daily cancellations vs completed rides">
          <LineTrendChart data={trend} />
        </ChartCard>
        <ChartCard title="Most Common Cancellation Reasons" subtitle="Top passenger cancellation reasons">
          <BarTrendChart data={topReasons} />
        </ChartCard>
        <ChartCard title="Cancellation Rate by City" subtitle="Cancellations per city today">
          <BarTrendChart data={byCity} />
        </ChartCard>
        <ChartCard title="Cancellation Rate by Ride Category" subtitle="Distribution by ride type">
          <CategoryPieChart data={byCategory} />
        </ChartCard>
      </div>
    </div>
  )
}
