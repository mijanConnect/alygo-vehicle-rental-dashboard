import { PageShell } from '@/components/common/PageShell'
import { BroadcastsTab } from '@/features/communication/components/CommunicationTabPanels'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function CommunicationCenterPage() {
  useDocumentTitle('Broadcasts')

  return (
    <PageShell
      title="Broadcasts"
      description="Send platform announcements to drivers and passengers by audience, location, or tier."
    >
      <div className="glass-card p-4">
        <BroadcastsTab />
      </div>
    </PageShell>
  )
}
