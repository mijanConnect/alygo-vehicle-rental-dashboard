import { Drawer, Progress, Table, Tag, Timeline } from 'antd'
import { Star } from 'lucide-react'
import type { DriverPerformanceRecord } from '@/types/driverRewards'
import { levelLabel } from '@/features/driver-rewards/driverRewardsHelpers'
import { formatCurrency, formatNumber } from '@/utils/format'

interface DriverProgressDrawerProps {
  open: boolean
  driver: DriverPerformanceRecord | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">{title}</h4>
      {children}
    </div>
  )
}

export function DriverProgressDrawer({ open, driver, onClose }: DriverProgressDrawerProps) {
  if (!driver) return null

  const statusLabel =
    driver.rewardsSuspended ? 'Suspended' : driver.status === 'at_risk' ? 'At Risk' : 'Active'

  return (
    <Drawer title={driver.driverName} open={open} onClose={onClose} width={640} destroyOnClose>
      <Tag className="mb-4">{levelLabel(driver.currentLevel)}</Tag>
      <Tag
        color={driver.rewardsSuspended ? 'error' : driver.status === 'at_risk' ? 'warning' : 'success'}
        className="mb-4 ml-2"
      >
        {statusLabel}
      </Tag>

      <Section title="Profile Information">
        <div className="space-y-2 text-sm">
          <p><span className="text-alygo-text-muted">Driver ID:</span> {driver.driverId}</p>
          <p><span className="text-alygo-text-muted">Current Tier:</span> {levelLabel(driver.currentLevel)}</p>
          <p><span className="text-alygo-text-muted">Current Points:</span> {formatNumber(driver.currentPoints)}</p>
          <div>
            <p className="mb-1 text-alygo-text-muted">Next Tier Progress</p>
            <Progress percent={driver.nextTierProgress} strokeColor="#6366f1" />
          </div>
          <p className="inline-flex items-center gap-1">
            <span className="text-alygo-text-muted">Rating:</span>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {driver.driverRating.toFixed(2)}
          </p>
          <p><span className="text-alygo-text-muted">Trips:</span> {formatNumber(driver.totalTrips)}</p>
          <p><span className="text-alygo-text-muted">Mileage:</span> {formatNumber(driver.totalMileage)} mi</p>
          <p><span className="text-alygo-text-muted">Online Hours:</span> {formatNumber(driver.onlineHours)}</p>
          <p><span className="text-alygo-text-muted">Acceptance Rate:</span> {driver.acceptanceRate}%</p>
          <p><span className="text-alygo-text-muted">Completion Rate:</span> {driver.completionRate}%</p>
        </div>
      </Section>

      <Section title="Level History">
        <Timeline
          items={driver.levelHistory.map((entry) => ({
            children: (
              <div>
                <p className="font-medium text-white">{levelLabel(entry.level)}</p>
                <p className="text-xs text-alygo-text-muted">{new Date(entry.date).toLocaleDateString()}</p>
              </div>
            ),
          }))}
        />
      </Section>

      <Section title="Points History">
        <Table
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={driver.pointsHistory}
          columns={[
            { title: 'Action', dataIndex: 'action' },
            {
              title: 'Points',
              dataIndex: 'points',
              render: (p: number) => (
                <span className={p >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {p > 0 ? `+${p}` : p}
                </span>
              ),
            },
            {
              title: 'Date',
              dataIndex: 'date',
              render: (d: string) => new Date(d).toLocaleString(),
            },
          ]}
        />
      </Section>

      <Section title="Bonus History">
        <Table
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={driver.bonusHistory}
          columns={[
            { title: 'Bonus', dataIndex: 'name' },
            { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
            { title: 'Date', dataIndex: 'date', render: (d: string) => new Date(d).toLocaleDateString() },
          ]}
        />
      </Section>

      <Section title="Achievement History">
        <Table
          size="small"
          pagination={false}
          rowKey={(_, i) => String(i)}
          dataSource={driver.achievementHistory}
          columns={[
            { title: 'Achievement', dataIndex: 'name' },
            { title: 'Date', dataIndex: 'date', render: (d: string) => new Date(d).toLocaleDateString() },
          ]}
        />
      </Section>

      <Section title="Earnings Statistics">
        <Table
          size="small"
          pagination={false}
          rowKey="period"
          dataSource={driver.earningsHistory}
          columns={[
            { title: 'Period', dataIndex: 'period' },
            { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          ]}
        />
      </Section>

      <Section title="Rating History">
        <Table
          size="small"
          pagination={false}
          rowKey="period"
          dataSource={driver.ratingHistory}
          columns={[
            { title: 'Period', dataIndex: 'period' },
            { title: 'Rating', dataIndex: 'rating', render: (r: number) => r.toFixed(2) },
          ]}
        />
      </Section>
    </Drawer>
  )
}
