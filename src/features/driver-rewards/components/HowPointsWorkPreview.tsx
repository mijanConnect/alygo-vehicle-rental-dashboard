import { Smartphone } from 'lucide-react'
import { useGetDriverRewardsPublicConfigQuery } from '@/services/driverRewardsApi'
import { HowPointsWorkSection } from '@/features/driver-rewards/components/HowPointsWorkSection'

export function HowPointsWorkPreview() {
  const { data, isLoading } = useGetDriverRewardsPublicConfigQuery()

  if (isLoading || !data) {
    return null
  }

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="border-b border-white/5 bg-indigo-500/10 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-300">
          <Smartphone className="h-4 w-4" />
          Driver App Preview — How Points Work (loaded from configuration)
        </div>
      </div>

      <div className="p-5">
        <HowPointsWorkSection config={data} />
      </div>
    </div>
  )
}
