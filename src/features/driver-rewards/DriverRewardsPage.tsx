import { Tabs } from 'antd'
import { Navigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import {
  BonusProgramsTab,
  PenaltyRulesTab,
  RewardRulesTab,
} from '@/features/driver-rewards/components/DriverRewardsTabPanels'
import {
  isLegacyTierRewardsTab,
  REWARDS_TAB_LABELS,
  resolveRewardsTab,
} from '@/features/driver-rewards/rewardsNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const REWARDS_TABS = [
  { key: 'reward-rules', label: REWARDS_TAB_LABELS['reward-rules'], children: <RewardRulesTab /> },
  { key: 'bonus-programs', label: REWARDS_TAB_LABELS['bonus-programs'], children: <BonusProgramsTab /> },
  { key: 'penalty-rules', label: REWARDS_TAB_LABELS['penalty-rules'], children: <PenaltyRulesTab /> },
] as const

export default function DriverRewardsPage() {
  useDocumentTitle('Driver Rewards Management')
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')

  if (isLegacyTierRewardsTab(tabParam)) {
    return <Navigate to="/drivers/tiers" replace />
  }

  const validTab = resolveRewardsTab(tabParam)

  return (
    <PageShell
      title="Driver Rewards Management"
      description="Manage reward rules, bonus programs, and penalty deductions for driver points."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...REWARDS_TABS]}
        />
      </div>
    </PageShell>
  )
}
