import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CancellationAnalytics } from '@/features/cancellations/components/CancellationAnalytics'
import { CancellationFeeTable } from '@/features/cancellations/components/CancellationFeeTable'
import { CancellationReasonTable } from '@/features/cancellations/components/CancellationReasonTable'
import { CityPolicyTable } from '@/features/cancellations/components/CityPolicyTable'
import { NoShowPolicyTable } from '@/features/cancellations/components/NoShowPolicyTable'

const CANCELLATION_TABS = [
  'reasons',
  'fees',
  'no-show',
  'city-policies',
  'analytics',
] as const

type CancellationTabKey = (typeof CANCELLATION_TABS)[number]

function resolveCancellationTab(tab: string | null): CancellationTabKey {
  if (tab && (CANCELLATION_TABS as readonly string[]).includes(tab)) {
    return tab as CancellationTabKey
  }
  return 'reasons'
}

export default function CancellationManagementPage() {
  useDocumentTitle('Cancellation Management')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveCancellationTab(searchParams.get('tab'))

  return (
    <PageShell
      title="Cancellation Management"
      description="Manage cancellation reasons, review ride category cancellation rules, location overrides, and analytics."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[
            {
              key: 'reasons',
              label: 'Cancellation Reasons',
              children: <CancellationReasonTable />,
            },
            {
              key: 'fees',
              label: 'Cancellation Fees',
              children: <CancellationFeeTable />,
            },
            {
              key: 'no-show',
              label: 'No Show Policies',
              children: <NoShowPolicyTable />,
            },
            {
              key: 'city-policies',
              label: 'City / State Policies',
              children: <CityPolicyTable />,
            },
            {
              key: 'analytics',
              label: 'Analytics',
              children: <CancellationAnalytics />,
            },
          ]}
        />
      </div>
    </PageShell>
  )
}
