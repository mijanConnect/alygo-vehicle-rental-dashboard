import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CancellationAnalytics } from '@/features/cancellations/components/CancellationAnalytics'
import { CancellationPolicyPanel } from '@/features/cancellations/components/CancellationPolicyPanel'
import { CancellationReasonTable } from '@/features/cancellations/components/CancellationReasonTable'

const CANCELLATION_TABS = ['reasons', 'policy', 'analytics'] as const

type CancellationTabKey = (typeof CANCELLATION_TABS)[number]

function resolveCancellationTab(tab: string | null): CancellationTabKey {
  if (tab && (CANCELLATION_TABS as readonly string[]).includes(tab)) {
    return tab as CancellationTabKey
  }
  // Legacy tab URLs → policy
  if (tab === 'fees' || tab === 'no-show' || tab === 'city-policies') {
    return 'policy'
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
      description="Manage cancellation reasons, platform cancellation policy, and analytics."
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
              key: 'policy',
              label: 'Cancellation Policy',
              children: <CancellationPolicyPanel />,
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
