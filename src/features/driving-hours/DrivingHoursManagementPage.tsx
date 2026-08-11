import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { DriverHoursMonitoringTable } from '@/features/driving-hours/components/DriverHoursMonitoringTable'
import { DrivingHoursAnalytics } from '@/features/driving-hours/components/DrivingHoursAnalytics'
import { DutyPolicyPanel } from '@/features/driving-hours/components/DutyPolicyPanel'
import {
  DRIVING_HOURS_TAB_LABELS,
  resolveDrivingHoursTab,
} from '@/features/driving-hours/drivingHoursNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const DRIVING_HOURS_TABS = [
  { key: 'global', label: DRIVING_HOURS_TAB_LABELS.global, children: <DutyPolicyPanel scopeType="global" /> },
  { key: 'state', label: DRIVING_HOURS_TAB_LABELS.state, children: <DutyPolicyPanel scopeType="state" /> },
  { key: 'city', label: DRIVING_HOURS_TAB_LABELS.city, children: <DutyPolicyPanel scopeType="city" /> },
  { key: 'zone', label: DRIVING_HOURS_TAB_LABELS.zone, children: <DutyPolicyPanel scopeType="zone" /> },
  { key: 'airport', label: DRIVING_HOURS_TAB_LABELS.airport, children: <DutyPolicyPanel scopeType="airport" /> },
  {
    key: 'monitoring',
    label: DRIVING_HOURS_TAB_LABELS.monitoring,
    children: <DriverHoursMonitoringTable />,
  },
  {
    key: 'analytics',
    label: DRIVING_HOURS_TAB_LABELS.analytics,
    children: <DrivingHoursAnalytics />,
  },
] as const

export default function DrivingHoursManagementPage() {
  useDocumentTitle('Driving Hours Management')
  const [searchParams, setSearchParams] = useSearchParams()
  const validTab = resolveDrivingHoursTab(searchParams.get('tab'))

  return (
    <PageShell
      title="Driving Hours Management"
      description="Configure driver duty policies by scope, and monitor compliance and analytics."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...DRIVING_HOURS_TABS]}
        />
      </div>
    </PageShell>
  )
}
