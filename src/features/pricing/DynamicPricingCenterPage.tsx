import { PageShell } from '@/components/common/PageShell'
import { PricingRulesPanel } from '@/features/pricing/components/PricingRulesPanel'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function DynamicPricingCenterPage() {
  useDocumentTitle('Dynamic Pricing Center')

  return (
    <PageShell
      title="Dynamic Pricing Center"
      description="Configure demand/supply thresholds and multiplier bounds for surge pricing rules."
    >
      <div className="glass-card p-4">
        <PricingRulesPanel />
      </div>
    </PageShell>
  )
}
