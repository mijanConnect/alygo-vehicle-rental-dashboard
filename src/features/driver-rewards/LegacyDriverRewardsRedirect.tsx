import { Navigate, useSearchParams } from 'react-router-dom'
import { resolveRewardsTab } from '@/features/driver-rewards/rewardsNavigation'

export function LegacyDriverRewardsRedirect() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const target = tab ? `/driver-rewards?tab=${resolveRewardsTab(tab)}` : '/driver-rewards'
  return <Navigate to={target} replace />
}
