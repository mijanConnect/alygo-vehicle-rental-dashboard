import {
  Award,
  Crown,
  DollarSign,
  Gem,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import {
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetRewardsOverviewQuery } from '@/services/driverRewardsApi'
import { formatCurrency, formatNumber } from '@/utils/format'

const kpiConfig = [
  { key: 'totalDriversEnrolled', label: 'Total Drivers Enrolled', icon: Users, format: 'number' as const },
  { key: 'totalActiveDrivers', label: 'Total Active Drivers', icon: Zap, format: 'number' as const },
  { key: 'totalPointsIssued', label: 'Total Points Issued', icon: Award, format: 'number' as const },
  { key: 'totalBonusesPaid', label: 'Total Bonuses Paid', icon: Wallet, format: 'currency' as const },
  { key: 'driversNearPromotion', label: 'Drivers Near Promotion', icon: TrendingUp, format: 'number' as const },
  { key: 'driversAtRiskOfDemotion', label: 'Drivers At Risk Of Demotion', icon: Trophy, format: 'number' as const },
  { key: 'averageDriverRating', label: 'Average Driver Rating', icon: Star, format: 'rating' as const },
  { key: 'averageWeeklyEarnings', label: 'Average Weekly Earnings', icon: DollarSign, format: 'currency' as const },
]

const levelConfig = [
  { key: 'journeyDrivers', label: 'Journey Drivers', icon: Users },
  { key: 'proDrivers', label: 'Pro Drivers', icon: Award },
  { key: 'eliteDrivers', label: 'Elite Drivers', icon: Trophy },
  { key: 'platinumDrivers', label: 'Platinum Drivers', icon: Gem },
  { key: 'diamondDrivers', label: 'Diamond Drivers', icon: Crown },
]

export function RewardsOverviewSection() {
  const { data, isLoading } = useGetRewardsOverviewQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading overview...</div>
  }

  const { overview, charts } = data

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') return formatCurrency(value)
    if (format === 'rating') return value.toFixed(2)
    return formatNumber(value)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiConfig.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="glass-card p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatValue(overview[key as keyof typeof overview] as number, format)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {levelConfig.map(({ key, label, icon: Icon }) => (
          <div key={key} className="glass-card p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatNumber(overview[key as keyof typeof overview] as number)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Driver Level Distribution" subtitle="Drivers by reward tier">
          <CategoryPieChart data={charts.levelDistribution} />
        </ChartCard>
        <ChartCard title="Monthly Points Issued" subtitle="Total points awarded per month">
          <LineTrendChart data={charts.monthlyPointsIssued} />
        </ChartCard>
        <ChartCard title="Driver Progress Trend" subtitle="Average progress score by week">
          <LineTrendChart data={charts.driverProgressTrend} color="#10b981" />
        </ChartCard>
        <ChartCard title="Weekly Earnings Trend" subtitle="Platform-wide driver earnings">
          <LineTrendChart data={charts.weeklyEarningsTrend} color="#22d3ee" />
        </ChartCard>
      </div>
    </div>
  )
}
