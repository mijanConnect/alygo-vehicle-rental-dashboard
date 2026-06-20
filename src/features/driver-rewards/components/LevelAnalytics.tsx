import { useState } from 'react'
import { Segmented, Table } from 'antd'
import {
  Award,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetLevelAnalyticsQuery } from '@/services/driverRewardsApi'
import { formatNumber } from '@/utils/format'

const cardConfig = [
  { key: 'driversPromotedThisMonth', label: 'Drivers Promoted This Month', icon: TrendingUp, format: 'number' as const },
  { key: 'driversDemotedThisMonth', label: 'Drivers Demoted This Month', icon: TrendingDown, format: 'number' as const },
  { key: 'driversNearNextLevel', label: 'Drivers Near Promotion', icon: Users, format: 'number' as const },
  { key: 'driversNearDemotion', label: 'Drivers Near Demotion', icon: TrendingDown, format: 'number' as const },
  { key: 'averagePointsPerDriver', label: 'Average Driver Points', icon: Award, format: 'number' as const },
  { key: 'averageDriverRating', label: 'Average Driver Rating', icon: Star, format: 'rating' as const },
]

type LeaderboardKey = 'leaderboardPoints' | 'leaderboardTrips' | 'leaderboardEarnings' | 'leaderboardRating'

const leaderboardOptions = [
  { label: 'Points', value: 'leaderboardPoints' as LeaderboardKey },
  { label: 'Trips', value: 'leaderboardTrips' as LeaderboardKey },
  { label: 'Earnings', value: 'leaderboardEarnings' as LeaderboardKey },
  { label: 'Rating', value: 'leaderboardRating' as LeaderboardKey },
]

export function LevelAnalytics() {
  const { data, isLoading } = useGetLevelAnalyticsQuery()
  const [leaderboard, setLeaderboard] = useState<LeaderboardKey>('leaderboardPoints')

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  const leaderboardData = data[leaderboard].map((item, index) => ({
    rank: index + 1,
    driver: item.label,
    value: leaderboard === 'leaderboardRating' ? (item.value / 100).toFixed(2) : item.value,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cardConfig.map(({ key, label, icon: Icon, format }) => {
          const raw = data[key as keyof typeof data] as number
          const display = format === 'rating' ? raw.toFixed(2) : formatNumber(raw)
          return (
            <div key={key} className="glass-card p-5">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-alygo-text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{display}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Tier Distribution" subtitle="Drivers by reward tier">
          <CategoryPieChart data={data.levelDistribution} />
        </ChartCard>
        <ChartCard title="Promotion Trend" subtitle="Monthly promotions">
          <LineTrendChart data={data.promotionRate} color="#10b981" />
        </ChartCard>
        <ChartCard title="Demotion Trend" subtitle="Monthly demotions">
          <LineTrendChart data={data.demotionRate} color="#ef4444" />
        </ChartCard>
        <ChartCard title="Points Growth" subtitle="Platform points growth">
          <LineTrendChart data={data.pointsGrowthTrend} />
        </ChartCard>
        <ChartCard title="Driver Retention" subtitle="Monthly retention rate (%)" className="lg:col-span-2">
          <LineTrendChart data={data.driverRetention} color="#22d3ee" />
        </ChartCard>
      </div>

      <div className="glass-card p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Driver Leaderboard</h3>
            <p className="text-xs text-alygo-text-muted">Top drivers by performance metric</p>
          </div>
          <Segmented
            value={leaderboard}
            onChange={(v) => setLeaderboard(v as LeaderboardKey)}
            options={leaderboardOptions}
          />
        </div>
        <Table
          rowKey="rank"
          pagination={false}
          dataSource={leaderboardData}
          columns={[
            { title: 'Rank', dataIndex: 'rank', width: 80 },
            { title: 'Driver', dataIndex: 'driver' },
            { title: 'Value', dataIndex: 'value' },
          ]}
        />
      </div>
    </div>
  )
}
