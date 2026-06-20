import { Table, Tag } from 'antd'
import { useGetTierManagementOverviewQuery } from '@/services/driverRewardsApi'
import { formatDateTime, formatNumber } from '@/utils/format'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-alygo-text-muted">{children}</h3>
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-card p-4">
      <p className="text-xs text-alygo-text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-white">{value}</p>
    </div>
  )
}

export function TierOverviewPanel() {
  const { data, isLoading } = useGetTierManagementOverviewQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-6 text-center text-sm text-alygo-text-muted">Loading overview...</div>
  }

  const kpis = [
    { label: 'Total Drivers', value: formatNumber(data.totalDrivers) },
    { label: 'Active Tiers', value: data.activeTiers },
    { label: 'Promotion Candidates', value: formatNumber(data.promotionCandidates) },
    { label: 'Demotion Candidates', value: formatNumber(data.demotionCandidates) },
  ]

  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>KPI Overview</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-card p-4">
          <SectionTitle>Recent Tier Changes</SectionTitle>
          <Table
            size="small"
            rowKey="id"
            pagination={false}
            dataSource={data.recentTierChanges}
            scroll={{ x: 520 }}
            columns={[
              { title: 'Driver', dataIndex: 'driverName', ellipsis: true },
              { title: 'Previous Tier', dataIndex: 'previousTier', width: 110 },
              { title: 'New Tier', dataIndex: 'newTier', width: 100 },
              { title: 'Change Type', dataIndex: 'changeType', width: 130 },
              {
                title: 'Date',
                dataIndex: 'date',
                width: 150,
                render: (d: string) => formatDateTime(d),
              },
            ]}
          />
        </section>

        <section className="glass-card p-4">
          <SectionTitle>Tier Distribution</SectionTitle>
          <Table
            size="small"
            rowKey="label"
            pagination={false}
            dataSource={data.tierDistribution}
            columns={[
              { title: 'Tier', dataIndex: 'label' },
              {
                title: 'Driver Count',
                dataIndex: 'count',
                render: (count: number) => formatNumber(count),
              },
              {
                title: 'Percentage',
                dataIndex: 'percent',
                render: (percent: number) => `${percent}%`,
              },
            ]}
          />
        </section>
      </div>

      <section className="glass-card p-4">
        <SectionTitle>Benefits Summary</SectionTitle>
        <div className="mb-3 flex flex-wrap gap-4 text-sm">
          <p className="text-alygo-text-muted">
            Total Benefits: <span className="font-medium text-white">{data.benefitsSummary.totalBenefits}</span>
          </p>
          <p className="text-alygo-text-muted">
            Assigned Across Tiers:{' '}
            <span className="font-medium text-white">{data.benefitsSummary.assignedAcrossTiers}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.benefitsSummary.benefitLabels.map((label) => (
            <Tag key={label} className="!m-0 !rounded-lg !border-indigo-500/30 !bg-indigo-500/10 !px-2.5 !py-0.5 !text-indigo-200">
              {label}
            </Tag>
          ))}
        </div>
      </section>
    </div>
  )
}
