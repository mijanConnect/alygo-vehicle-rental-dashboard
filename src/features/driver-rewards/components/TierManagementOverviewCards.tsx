import { Award, Crown, Gem, Trophy, Users } from 'lucide-react'
import { useGetRewardsOverviewQuery } from '@/services/driverRewardsApi'
import { formatNumber } from '@/utils/format'

const cards = [
  { key: 'totalDrivers', label: 'Total Drivers', icon: Users },
  { key: 'journeyDrivers', label: 'Journey Drivers', icon: Users },
  { key: 'proDrivers', label: 'Pro Drivers', icon: Award },
  { key: 'eliteDrivers', label: 'Elite Drivers', icon: Trophy },
  { key: 'platinumDrivers', label: 'Platinum Drivers', icon: Gem },
  { key: 'diamondDrivers', label: 'Diamond Drivers', icon: Crown },
] as const

export function TierManagementOverviewCards() {
  const { data, isLoading } = useGetRewardsOverviewQuery()

  if (isLoading || !data) {
    return <div className="glass-card p-6 text-center text-alygo-text-muted">Loading tier metrics...</div>
  }

  const { overview } = data

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="w-fit rounded-xl bg-indigo-500/10 p-2.5">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(overview[key] as number)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
