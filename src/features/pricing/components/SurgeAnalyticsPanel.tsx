import { Table, Tag } from 'antd'
import { BarTrendChart, ChartCard, LineTrendChart } from '@/components/charts/AnalyticsCharts'
import {
  computeSurgeAnalytics,
  MULTIPLIER_TREND_DATA,
  REVENUE_IMPACT_DATA,
  SURGE_FREQUENCY_DATA,
} from '@/features/pricing/pricingData'
import { useGetSurgeZonesQuery } from '@/services/api'
import { formatCurrency } from '@/utils/format'

export function SurgeAnalyticsPanel() {
  const { data: zones = [] } = useGetSurgeZonesQuery()
  const analytics = computeSurgeAnalytics(zones)

  const metrics = [
    { label: 'Average Surge Multiplier', value: `${analytics.averageSurgeMultiplier.toFixed(1)}x` },
    { label: 'Revenue Impact (7d)', value: formatCurrency(analytics.revenueImpact) },
    { label: 'Surge Events (7d)', value: analytics.surgeEvents.toLocaleString() },
    { label: 'Active Surge Zones', value: zones.filter((z) => z.active).length.toString() },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-alygo-text-muted">
        Historical surge performance, multiplier trends, and revenue impact across platform zones.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="glass-card p-5">
            <p className="text-sm text-alygo-text-muted">{m.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Surge Frequency" subtitle="Surge activations per day (7d)">
          <BarTrendChart data={SURGE_FREQUENCY_DATA} />
        </ChartCard>
        <ChartCard title="Multiplier Trend" subtitle="Average surge multiplier (7d)">
          <LineTrendChart data={MULTIPLIER_TREND_DATA} color="#f59e0b" />
        </ChartCard>
        <ChartCard title="Revenue Impact" subtitle="Incremental surge revenue (7d)">
          <BarTrendChart data={REVENUE_IMPACT_DATA} />
        </ChartCard>
      </div>

      <div className="glass-card p-4">
        <h3 className="mb-4 text-base font-semibold text-white">Most Active Surge Zones</h3>
        <Table
          rowKey="id"
          pagination={false}
          dataSource={analytics.mostActiveZones}
          columns={[
            { title: 'Zone', dataIndex: 'name' },
            { title: 'City', dataIndex: 'city' },
            {
              title: 'Multiplier',
              dataIndex: 'multiplier',
              render: (m: number) => <Tag color="orange">{m}x</Tag>,
            },
            { title: 'Demand', dataIndex: 'demand' },
            { title: 'Supply', dataIndex: 'supply' },
            {
              title: 'Demand vs Supply',
              render: (_, record) => {
                const ratio = record.supply > 0 ? (record.demand / record.supply).toFixed(2) : '—'
                return `${ratio}:1`
              },
            },
          ]}
        />
      </div>
    </div>
  )
}
