import { PageShell } from '@/components/common/PageShell'
import { IncidentTable } from '@/features/safety-incidents/components/IncidentTable'
import { SafetyOverviewCards } from '@/features/safety-incidents/components/SafetyOverviewCards'
import { useSafetyIncidentRealtime } from '@/features/safety-incidents/hooks/useSafetyIncidentRealtime'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function SafetyIncidentPage() {
  useDocumentTitle('Safety & Incident Management')
  useSafetyIncidentRealtime()

  return (
    <PageShell
      title="Safety & Incident Management"
      description="Handle active safety cases directly — review incidents, add notes, update status, and resolve emergencies."
    >
      <SafetyOverviewCards />
      <div className="glass-card mt-6 p-4">
        <IncidentTable />
      </div>
    </PageShell>
  )
}
