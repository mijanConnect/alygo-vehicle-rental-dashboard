import { PageShell } from '@/components/common/PageShell'
import { TierConfigurationTab } from '@/features/driver-rewards/components/TierTabPanels'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function TierManagementPage() {
  useDocumentTitle('Tier Management')

  return (
    <PageShell
      title="Tier Management"
      description="Manage driver tiers, qualification requirements, and tier-owned operational benefits."
    >
      <div className="glass-card p-4">
        <TierConfigurationTab />
      </div>
    </PageShell>
  )
}
