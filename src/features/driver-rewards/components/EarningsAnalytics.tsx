import { useState } from 'react'
import { Segmented } from 'antd'
import {
  DollarSign,
  Gift,
  Megaphone,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  BarTrendChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetEarningsAnalyticsQuery } from '@/services/driverRewardsApi'
import type { EarningsPeriod } from '@/types/driverRewards'
import { formatCurrency } from '@/utils/format'

const cardConfig = [
  { key: 'totalDriverEarnings', label: 'Total Driver Earnings', icon: DollarSign },
  { key: 'totalBonusesPaid', label: 'Total Bonuses Paid', icon: Gift },
  { key: 'totalTipsEarned', label: 'Total Tips Earned', icon: Wallet },
  { key: 'totalPromotionsPaid', label: 'Total Promotions Paid', icon: Megaphone },
  { key: 'weeklyEarnings', label: 'Average Weekly Earnings', icon: TrendingUp },
]

export function EarningsAnalytics() {
  const [period, setPeriod] = useState<EarningsPeriod>('monthly')
  const { data, isLoading } = useGetEarningsAnalyticsQuery(period)

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      <Segmented
        value={period}
        onChange={(v) => setPeriod(v as EarningsPeriod)}
        options={[
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cardConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="glass-card p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatCurrency(data[key as keyof typeof data] as number)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Earnings Trend" subtitle={`${period} driver earnings`}>
          <LineTrendChart data={data.earningsTrend} />
        </ChartCard>
        <ChartCard title="Bonus Trend" subtitle={`${period} bonus payouts`}>
          <LineTrendChart data={data.bonusTrend} color="#10b981" />
        </ChartCard>
        <ChartCard title="Tips Trend" subtitle={`${period} tips earned`}>
          <LineTrendChart data={data.tipsTrend} color="#22d3ee" />
        </ChartCard>
        <ChartCard title="Promotion Trend" subtitle={`${period} promotion payouts`}>
          <LineTrendChart data={data.promotionTrend} color="#a78bfa" />
        </ChartCard>
        <ChartCard title="Top Earning Drivers" subtitle="Highest earners" className="lg:col-span-2">
          <BarTrendChart data={data.topEarningDrivers} />
        </ChartCard>
      </div>
    </div>
  )
}
