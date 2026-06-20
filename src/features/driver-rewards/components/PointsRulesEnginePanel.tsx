import { PointsRulesOverviewCards } from '@/features/driver-rewards/components/PointsRulesOverviewCards'
import { PointsRulesTable } from '@/features/driver-rewards/components/PointsRulesTable'
import { HowPointsWorkPreview } from '@/features/driver-rewards/components/HowPointsWorkPreview'

export function PointsRulesEnginePanel() {
  return (
    <div className="space-y-6">
      <PointsRulesOverviewCards />
      <PointsRulesTable />
      <HowPointsWorkPreview />
    </div>
  )
}
