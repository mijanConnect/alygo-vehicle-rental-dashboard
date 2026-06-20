import { Tabs } from 'antd'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { CityRulesTable } from '@/features/driving-hours/components/CityRulesTable'
import { DriverHoursMonitoringTable } from '@/features/driving-hours/components/DriverHoursMonitoringTable'
import { DrivingHoursAnalytics } from '@/features/driving-hours/components/DrivingHoursAnalytics'
import { DrivingHoursOverviewCards } from '@/features/driving-hours/components/DrivingHoursOverviewCards'
import { GlobalPolicySettings } from '@/features/driving-hours/components/GlobalPolicySettings'
import { StateRulesTable } from '@/features/driving-hours/components/StateRulesTable'
import { useDrivingHoursRealtime } from '@/features/driving-hours/hooks/useDrivingHoursRealtime'

export default function DrivingHoursManagementPage() {
  useDocumentTitle('Driving Hours Management')
  useDrivingHoursRealtime()

  return (
    <PageShell
      title="Driving Hours Management"
      description="Configure maximum driving hours, reset requirements, warning thresholds, and monitor driver compliance."
    >
      <DrivingHoursOverviewCards />

      <div className="glass-card mt-6 p-4">
        <Tabs
          defaultActiveKey="policy"
          items={[
            { key: 'policy', label: 'Global Policy', children: <GlobalPolicySettings /> },
            { key: 'state-rules', label: 'State Rules', children: <StateRulesTable /> },
            { key: 'city-rules', label: 'City Rules', children: <CityRulesTable /> },
            { key: 'monitoring', label: 'Driver Monitoring', children: <DriverHoursMonitoringTable /> },
            { key: 'analytics', label: 'Analytics', children: <DrivingHoursAnalytics /> },
          ]}
        />
      </div>
    </PageShell>
  )
}
