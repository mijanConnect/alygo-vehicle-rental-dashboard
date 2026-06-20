import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { PricingRulesPanel } from '@/features/pricing/components/PricingRulesPanel'
import { SurgeAnalyticsPanel } from '@/features/pricing/components/SurgeAnalyticsPanel'
import { ZonePricingPanel } from '@/features/pricing/components/ZonePricingPanel'
import {
  DEFAULT_PRICING_TAB,
  PRICING_TAB_KEYS,
  PRICING_TAB_LABELS,
  type PricingTabKey,
} from '@/features/pricing/pricingNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const PRICING_TABS = [
  { key: 'rules', label: PRICING_TAB_LABELS.rules, children: <PricingRulesPanel /> },
  { key: 'zones', label: PRICING_TAB_LABELS.zones, children: <ZonePricingPanel /> },
  { key: 'analytics', label: PRICING_TAB_LABELS.analytics, children: <SurgeAnalyticsPanel /> },
] as const

export default function DynamicPricingCenterPage() {
  useDocumentTitle('Dynamic Pricing Center')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as PricingTabKey | null) ?? DEFAULT_PRICING_TAB
  const validTab = PRICING_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_PRICING_TAB

  return (
    <PageShell
      title="Dynamic Pricing Center"
      description="Unified surge pricing command center for rules, zone multipliers, and analytics. Geographic zones are managed in Location Management."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...PRICING_TABS]}
        />
      </div>
    </PageShell>
  )
}
