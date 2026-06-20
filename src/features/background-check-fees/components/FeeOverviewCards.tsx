import { AlertCircle, Clock, DollarSign, RotateCcw } from 'lucide-react'
import { useGetBackgroundCheckFeeOverviewQuery } from '@/services/backgroundCheckFeeApi'
import { formatCurrency, formatNumber } from '@/utils/format'

const overviewConfig: Array<{
  key: keyof import('@/types/backgroundCheckFee').BackgroundCheckFeeOverview
  label: string
  icon: typeof DollarSign
  format: 'currency' | 'number'
}> = [
  { key: 'totalFeesCollected', label: 'Total Fees Collected', icon: DollarSign, format: 'currency' },
  { key: 'pendingPayments', label: 'Pending Payments', icon: Clock, format: 'number' },
  { key: 'failedPayments', label: 'Failed Payments', icon: AlertCircle, format: 'number' },
  { key: 'refundRequests', label: 'Refund Requests', icon: RotateCcw, format: 'number' },
]

export function FeeOverviewCards() {
  const { data, isLoading } = useGetBackgroundCheckFeeOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewConfig.map(({ key, label, icon: Icon, format }) => (
        <div key={key} className="glass-card p-5">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {format === 'currency' ? formatCurrency(data[key]) : formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
