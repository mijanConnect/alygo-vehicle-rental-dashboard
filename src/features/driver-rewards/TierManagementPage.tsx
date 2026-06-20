import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { TierConfigurationTab, TierOverviewTab } from '@/features/driver-rewards/components/TierTabPanels'
import {
  resolveTierTab,
  TIER_TAB_LABELS,
} from '@/features/driver-rewards/tierNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const TIER_TABS = [
  { key: 'overview', label: TIER_TAB_LABELS.overview, children: <TierOverviewTab /> },
  { key: 'configuration', label: TIER_TAB_LABELS.configuration, children: <TierConfigurationTab /> },
] as const

export default function TierManagementPage() {
  useDocumentTitle('Tier Management')
  const [searchParams, setSearchParams] = useSearchParams()
  const validTab = resolveTierTab(searchParams.get('tab'))

  return (
    <PageShell
      title="Tier Management"
      description="Manage driver tiers, qualification requirements, and tier-owned operational benefits."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...TIER_TABS]}
        />
      </div>
    </PageShell>
  )
}
