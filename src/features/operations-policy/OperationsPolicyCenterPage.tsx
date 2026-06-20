import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { OperationsPolicyOverviewCards } from '@/features/operations-policy/components/OperationsPolicyOverviewCards'
import { PolicyRulesTable } from '@/features/operations-policy/components/PolicyRulesTable'
import { useOperationsPolicyRealtime } from '@/features/operations-policy/hooks/useOperationsPolicyRealtime'
import {
  DEFAULT_OPERATIONS_POLICY_TAB,
  OPERATIONS_POLICY_TAB_LABELS,
  resolveOperationsPolicyTab,
  type OperationsPolicyTabKey,
} from '@/features/operations-policy/operationsPolicyNavigation'

function renderTabContent(tab: OperationsPolicyTabKey) {
  return <PolicyRulesTable category={tab} />
}

export default function OperationsPolicyCenterPage() {
  useDocumentTitle('Operations Policy Center')
  useOperationsPolicyRealtime()
  const [searchParams, setSearchParams] = useSearchParams()
  const validTab = resolveOperationsPolicyTab(searchParams.get('tab'))

  const tabs = (Object.keys(OPERATIONS_POLICY_TAB_LABELS) as OperationsPolicyTabKey[]).map((key) => ({
    key,
    label: OPERATIONS_POLICY_TAB_LABELS[key],
    children: renderTabContent(key),
  }))

  return (
    <PageShell
      title="Operations Policy Center"
      description="Platform-wide operational policies for fare adjustments, refunds, and driver penalties. Driving hours and destination filters are configured in their dedicated modules."
    >
      <OperationsPolicyOverviewCards />

      <div className="glass-card mt-6 p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          defaultActiveKey={DEFAULT_OPERATIONS_POLICY_TAB}
          items={tabs}
        />
      </div>
    </PageShell>
  )
}
