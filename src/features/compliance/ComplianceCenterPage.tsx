import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { ComplianceOverviewCards } from '@/features/compliance/components/ComplianceOverviewCards'
import {
  BackgroundCheckFeesTab,
  BackgroundChecksTab,
  DocumentMonitoringTab,
  DriverRestrictionsTab,
} from '@/features/compliance/components/ComplianceTabPanels'
import {
  COMPLIANCE_TAB_KEYS,
  COMPLIANCE_TAB_LABELS,
  DEFAULT_COMPLIANCE_TAB,
  type ComplianceTabKey,
} from '@/features/compliance/complianceNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const COMPLIANCE_TABS = [
  { key: 'overview', label: COMPLIANCE_TAB_LABELS.overview, children: <ComplianceOverviewCards /> },
  {
    key: 'background-checks',
    label: COMPLIANCE_TAB_LABELS['background-checks'],
    children: <BackgroundChecksTab />,
  },
  { key: 'fees', label: COMPLIANCE_TAB_LABELS.fees, children: <BackgroundCheckFeesTab /> },
  { key: 'documents', label: COMPLIANCE_TAB_LABELS.documents, children: <DocumentMonitoringTab /> },
  {
    key: 'restrictions',
    label: COMPLIANCE_TAB_LABELS.restrictions,
    children: <DriverRestrictionsTab />,
  },
] as const

export default function ComplianceCenterPage() {
  useDocumentTitle('Compliance Center')
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab = (rawTab as ComplianceTabKey | null) ?? DEFAULT_COMPLIANCE_TAB
  const validTab = COMPLIANCE_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_COMPLIANCE_TAB

  return (
    <PageShell
      title="Compliance Center"
      description="Manage driver compliance, background checks, document monitoring, fees, and restrictions from one centralized workspace."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...COMPLIANCE_TABS]}
        />
      </div>
    </PageShell>
  )
}
