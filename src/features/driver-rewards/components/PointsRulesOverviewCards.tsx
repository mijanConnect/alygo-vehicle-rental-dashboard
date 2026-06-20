import { Award, Gift, MinusCircle, Settings } from 'lucide-react'
import { useGetPointsRulesOverviewQuery } from '@/services/driverRewardsApi'
import { formatNumber } from '@/utils/format'

const cards = [
  { key: 'totalActiveRules', label: 'Total Active Rules', icon: Settings },
  { key: 'pointsAwardedToday', label: 'Points Awarded Today', icon: Award },
  { key: 'pointsDeductedToday', label: 'Points Deducted Today', icon: MinusCircle },
  { key: 'activeBonusCampaigns', label: 'Active Bonus Campaigns', icon: Gift },
] as const

export function PointsRulesOverviewCards() {
  const { data, isLoading } = useGetPointsRulesOverviewQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-6 text-center text-alygo-text-muted">Loading rules overview...</div>
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="w-fit rounded-xl bg-indigo-500/10 p-2.5">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
