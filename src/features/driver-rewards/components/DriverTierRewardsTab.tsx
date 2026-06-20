import { Progress, Table, Tag } from 'antd'
import { Award, Crown, Gift, History, Shield, Star, Trophy, Wallet } from 'lucide-react'
import { useGetDriverMyTierSnapshotQuery } from '@/services/driverRewardsApi'
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format'

interface DriverTierRewardsTabProps {
  driverId: string
  driverName: string
}

export function DriverTierRewardsTab({ driverId, driverName }: DriverTierRewardsTabProps) {
  const { data, isLoading } = useGetDriverMyTierSnapshotQuery(driverId)

  if (isLoading) {
    return <div className="py-8 text-center text-alygo-text-muted">Loading tier & rewards data...</div>
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-alygo-text-muted">
        No tier profile found for {driverName}. Enroll this driver in the rewards program from Tier Management.
      </div>
    )
  }

  const {
    currentTier,
    nextTier,
    progressPercent,
    metrics,
    activeBenefits,
    achievements,
    tierHistory,
    rewardsEarned,
    wallet,
    pointsHistory,
  } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
              style={{ backgroundColor: currentTier.tierColor }}
            >
              {currentTier.tierBadge}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-alygo-text-muted">Current Tier</p>
              <h3 className="text-2xl font-semibold text-white">{currentTier.label}</h3>
              {nextTier && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-alygo-text-muted">Progress to {nextTier.label}</span>
                    <span className="text-white">{progressPercent}%</span>
                  </div>
                  <Progress percent={progressPercent} showInfo={false} strokeColor={currentTier.tierColor} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={Trophy} label="Trips" value={String(metrics.trips)} />
            <MetricCard icon={Star} label="Rating" value={`${metrics.rating} ★`} />
            <MetricCard icon={Award} label="Acceptance Rate" value={`${metrics.acceptanceRate}%`} />
            <MetricCard icon={Shield} label="Safety Score" value={String(metrics.safetyScore)} />
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Gift className="h-4 w-4 text-indigo-400" />
            <h4 className="font-semibold text-white">Rewards Earned</h4>
          </div>
          <p className="text-3xl font-semibold text-white">{formatCurrency(rewardsEarned)}</p>
          <div className="mt-4 space-y-2">
            {activeBenefits.slice(0, 5).map((benefit) => (
              <Tag key={benefit} className="!mr-1 !mb-1">{benefit}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h4 className="mb-3 font-semibold text-white">Active Benefits</h4>
          <ul className="space-y-2 text-sm text-alygo-text-muted">
            <li>Destination Filters: {currentTier.benefits.destinationFilters}</li>
            <li>Daily Limit: {currentTier.benefits.dailyUsageLimit}</li>
            <li>Weekly Limit: {currentTier.benefits.weeklyUsageLimit}</li>
            <li>Bonus Multiplier: {currentTier.benefits.flags.bonusMultiplier}x</li>
            <li>Priority Dispatch: {currentTier.benefits.flags.priorityDispatch ? 'Enabled' : 'Disabled'}</li>
          </ul>
        </div>

        <div className="glass-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-400" />
            <h4 className="font-semibold text-white">Achievements</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <Tag key={a.id}>{a.name}</Tag>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-indigo-400" />
          <h4 className="font-semibold text-white">Tier History</h4>
        </div>
        <Table
          size="small"
          pagination={false}
          rowKey="id"
          dataSource={tierHistory}
          locale={{ emptyText: 'No tier changes recorded yet.' }}
          columns={[
            { title: 'Previous', dataIndex: 'previousTierLabel' },
            { title: 'New', dataIndex: 'newTierLabel' },
            { title: 'Reason', dataIndex: 'reason', render: (r: string) => r.replace(/_/g, ' ') },
            { title: 'Date', dataIndex: 'createdAt', render: (d: string) => formatDateTime(d) },
          ]}
        />
      </div>

      {wallet && (
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-indigo-400" />
            <h4 className="font-semibold text-white">Rewards Wallet</h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <WalletMetric label="Lifetime Points" value={formatNumber(wallet.lifetimePoints)} />
            <WalletMetric label="Current Points" value={formatNumber(wallet.currentPoints)} />
            <WalletMetric label="Points Earned" value={`+${formatNumber(wallet.pointsEarned)}`} positive />
            <WalletMetric label="Points Lost" value={`-${formatNumber(wallet.pointsLost)}`} negative />
          </div>
        </div>
      )}

      {pointsHistory.length > 0 && (
        <div className="glass-card p-5">
          <h4 className="mb-3 font-semibold text-white">Points History</h4>
          <Table
            size="small"
            pagination={{ pageSize: 6 }}
            rowKey="id"
            dataSource={pointsHistory}
            columns={[
              { title: 'Date', dataIndex: 'createdAt', render: (d: string) => formatDateTime(d) },
              { title: 'Rule', dataIndex: 'ruleName' },
              {
                title: 'Points',
                dataIndex: 'points',
                render: (p: number) => (
                  <span className={p >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {p > 0 ? `+${p}` : p}
                  </span>
                ),
              },
              { title: 'Reason', dataIndex: 'reason', ellipsis: true },
            ]}
          />
        </div>
      )}

    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <div className="mb-1 flex items-center gap-2 text-alygo-text-muted">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function WalletMetric({
  label,
  value,
  positive,
  negative,
}: {
  label: string
  value: string
  positive?: boolean
  negative?: boolean
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
      <p className="text-sm text-alygo-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
