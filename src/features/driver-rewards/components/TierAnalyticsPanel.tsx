import {
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetLevelAnalyticsQuery } from '@/services/driverRewardsApi'
import { formatNumber, formatPercent } from '@/utils/format'

export function TierAnalyticsPanel() {
  const { data, isLoading } = useGetLevelAnalyticsQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading tier analytics...</div>
  }

  const summaryCards = [
    { label: 'Promotion Rate', value: formatPercent(data.promotionRatePercent / 100) },
    { label: 'Demotion Rate', value: formatPercent(data.demotionRatePercent / 100) },
    { label: 'Retention Rate', value: formatPercent(data.retentionRatePercent / 100) },
    { label: 'Drivers Promoted (Month)', value: formatNumber(data.driversPromotedThisMonth) },
    { label: 'Drivers Demoted (Month)', value: formatNumber(data.driversDemotedThisMonth) },
    { label: 'Near Promotion', value: formatNumber(data.driversNearNextLevel) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ label, value }) => (
          <div key={label} className="glass-card p-5">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Drivers Per Tier" subtitle="Tier distribution across platform">
          <CategoryPieChart data={data.levelDistribution} />
        </ChartCard>
        <ChartCard title="Average Revenue Per Tier" subtitle="Weekly earnings by tier">
          <LineTrendChart data={data.averageRevenuePerTier} color="#22d3ee" />
        </ChartCard>
        <ChartCard title="Acceptance Rate By Tier" subtitle="Service quality by tier">
          <LineTrendChart data={data.acceptanceRateByTier} color="#10b981" />
        </ChartCard>
        <ChartCard title="Destination Filter Usage" subtitle="Filter utilization by tier">
          <LineTrendChart data={data.destinationFilterUsage} color="#a855f7" />
        </ChartCard>
        <ChartCard title="Bonus Usage" subtitle="Bonus program participation">
          <CategoryPieChart data={data.bonusUsage} />
        </ChartCard>
        <ChartCard title="Driver Retention" subtitle="Monthly retention trend">
          <LineTrendChart data={data.driverRetention} color="#6366f1" />
        </ChartCard>
      </div>
    </div>
  )
}
