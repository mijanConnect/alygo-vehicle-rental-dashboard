import {
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetRulesEngineAnalyticsQuery } from '@/services/driverRewardsApi'
import { formatNumber, formatPercent } from '@/utils/format'

export function RulesEngineAnalyticsPanel() {
  const { data, isLoading } = useGetRulesEngineAnalyticsQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading rules analytics...</div>
  }

  const summaryCards = [
    { label: 'Promotion Rate', value: formatPercent(data.promotionRatePercent / 100) },
    { label: 'Demotion Rate', value: formatPercent(data.demotionRatePercent / 100) },
    { label: 'Top Driver Points', value: formatNumber(data.topDriversByPoints[0]?.value ?? 0) },
    { label: 'Most Triggered Rule', value: data.mostTriggeredRules[0]?.label ?? '—' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, value }) => (
          <div key={label} className="glass-card p-5">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Most Triggered Rules" subtitle="Rule activation frequency">
          <CategoryPieChart data={data.mostTriggeredRules} />
        </ChartCard>
        <ChartCard title="Most Earned Rewards" subtitle="Points by reward category">
          <LineTrendChart data={data.mostEarnedRewards} color="#10b981" />
        </ChartCard>
        <ChartCard title="Most Used Bonus Campaigns" subtitle="Campaign participation">
          <CategoryPieChart data={data.mostUsedBonusCampaigns} />
        </ChartCard>
        <ChartCard title="Top Drivers By Points" subtitle="Current point leaders">
          <LineTrendChart data={data.topDriversByPoints} color="#6366f1" />
        </ChartCard>
        <ChartCard title="Points Earned By Ride Category" subtitle="Category breakdown">
          <LineTrendChart data={data.pointsByRideCategory} color="#22d3ee" />
        </ChartCard>
        <ChartCard title="Points Earned By Tier" subtitle="Tier distribution">
          <CategoryPieChart data={data.pointsByTier} />
        </ChartCard>
      </div>
    </div>
  )
}
