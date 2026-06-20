import { Tabs } from 'antd'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CancellationAnalytics } from '@/features/cancellations/components/CancellationAnalytics'
import { CancellationFeeTable } from '@/features/cancellations/components/CancellationFeeTable'
import { CancellationReasonTable } from '@/features/cancellations/components/CancellationReasonTable'
import { CityPolicyTable } from '@/features/cancellations/components/CityPolicyTable'
import { NoShowPolicyTable } from '@/features/cancellations/components/NoShowPolicyTable'

export default function CancellationManagementPage() {
  useDocumentTitle('Cancellation Management')

  return (
    <PageShell
      title="Cancellation Management"
      description="Manage cancellation reasons, review ride category cancellation rules, location overrides, and analytics."
    >
      <div className="glass-card p-4">
        <Tabs
          defaultActiveKey="reasons"
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
