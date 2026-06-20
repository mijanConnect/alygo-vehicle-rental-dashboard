import { Tabs } from 'antd'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CategoryManagementTable } from '@/features/lost-found/components/CategoryManagementTable'
import { CompensationSettings } from '@/features/lost-found/components/CompensationSettings'
import { DeliveryFeeSettingsTable } from '@/features/lost-found/components/DeliveryFeeSettingsTable'
import { DisputeManagementTable } from '@/features/lost-found/components/DisputeManagementTable'
import { LostFoundAnalytics } from '@/features/lost-found/components/LostFoundAnalytics'
import { LostFoundOverviewCards } from '@/features/lost-found/components/LostFoundOverviewCards'
import { LostItemTable } from '@/features/lost-found/components/LostItemTable'
import { ReturnManagementTable } from '@/features/lost-found/components/ReturnManagementTable'
import { useLostFoundRealtime } from '@/features/lost-found/hooks/useLostFoundRealtime'

export default function LostFoundManagementPage() {
  useDocumentTitle('Lost & Found')
  useLostFoundRealtime()

  return (
    <PageShell
      title="Lost & Found"
      description="Monitor lost item reports, manage returns, configure fees and compensation, resolve disputes, and track recovery analytics."
    >
      <LostFoundOverviewCards />

      <div className="glass-card p-4">
        <Tabs
          defaultActiveKey="reports"
          items={[
            {
              key: 'reports',
              label: 'Lost Item Reports',
              children: <LostItemTable />,
            },
            {
              key: 'returns',
              label: 'Return Management',
              children: <ReturnManagementTable />,
            },
            {
              key: 'delivery-fees',
              label: 'Delivery Fee Settings',
              children: <DeliveryFeeSettingsTable />,
            },
            {
              key: 'categories',
              label: 'Item Categories',
              children: <CategoryManagementTable />,
            },
            {
              key: 'compensation',
              label: 'Driver Compensation',
              children: <CompensationSettings />,
            },
            {
              key: 'disputes',
              label: 'Dispute Management',
              children: <DisputeManagementTable />,
            },
            {
              key: 'analytics',
              label: 'Analytics',
              children: <LostFoundAnalytics />,
            },
          ]}
        />
      </div>
    </PageShell>
  )
}
