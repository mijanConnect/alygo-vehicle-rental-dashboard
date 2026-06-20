import { Button, Tabs } from 'antd'
import { Download } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { AnalyticsOverviewPanel } from '@/features/analytics/components/AnalyticsOverviewPanel'
import {
  ComplianceAnalyticsPanel,
  DemandAnalyticsPanel,
  DriverAnalyticsPanel,
  PassengerAnalyticsPanel,
  RevenueAnalyticsPanel,
} from '@/features/analytics/components/AnalyticsTabPanels'
import {
  ANALYTICS_TAB_KEYS,
  ANALYTICS_TAB_LABELS,
  DEFAULT_ANALYTICS_TAB,
  type AnalyticsTabKey,
} from '@/features/analytics/analyticsNavigation'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const ANALYTICS_TABS = [
  { key: 'overview', label: ANALYTICS_TAB_LABELS.overview, children: <AnalyticsOverviewPanel /> },
  { key: 'drivers', label: ANALYTICS_TAB_LABELS.drivers, children: <DriverAnalyticsPanel /> },
  { key: 'passengers', label: ANALYTICS_TAB_LABELS.passengers, children: <PassengerAnalyticsPanel /> },
  { key: 'revenue', label: ANALYTICS_TAB_LABELS.revenue, children: <RevenueAnalyticsPanel /> },
  { key: 'demand', label: ANALYTICS_TAB_LABELS.demand, children: <DemandAnalyticsPanel /> },
  { key: 'compliance', label: ANALYTICS_TAB_LABELS.compliance, children: <ComplianceAnalyticsPanel /> },
] as const

export default function ReportsAnalyticsPage() {
  useDocumentTitle('Analytics Center')
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as AnalyticsTabKey | null) ?? DEFAULT_ANALYTICS_TAB
  const validTab = ANALYTICS_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_ANALYTICS_TAB

  return (
    <PageShell
      title="Analytics Center"
      description="Unified reporting hub for platform KPIs, driver and passenger metrics, revenue, demand, and compliance."
      actions={
        <>
          <Button icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported as CSV')}>
            Export CSV
          </Button>
          <Button icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported as PDF')}>
            Export PDF
          </Button>
          <Button type="primary" icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported as Excel')}>
            Export Excel
          </Button>
        </>
      }
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...ANALYTICS_TABS]}
        />
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
