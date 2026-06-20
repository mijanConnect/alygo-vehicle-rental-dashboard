import { PageShell } from '@/components/common/PageShell'
import {
  DemandKpiOverview,
  DemandZonesTable,
  UpcomingEventsTable,
} from '@/features/demand-intelligence/components/DemandIntelligenceSections'
import { LiveOperationsMap } from '@/features/demand-intelligence/components/LiveOperationsMap'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function DemandIntelligenceCenterPage() {
  useDocumentTitle('Demand Intelligence Center')

  return (
    <PageShell
      title="Demand Intelligence Center"
      description="Demand monitoring for zones, events, and live map visibility — dispatch and supply decisions only."
    >
      <div className="space-y-6">
        <DemandKpiOverview />
        <LiveOperationsMap />
        <DemandZonesTable />
        <UpcomingEventsTable />
      </div>
    </PageShell>
  )
}
