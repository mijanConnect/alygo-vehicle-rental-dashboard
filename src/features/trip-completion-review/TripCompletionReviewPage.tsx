import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ComplaintQueueTable } from '@/features/trip-completion-review/components/ComplaintQueueTable'
import { TripCompletionAnalytics } from '@/features/trip-completion-review/components/TripCompletionAnalytics'
import { TripCompletionOverviewCards } from '@/features/trip-completion-review/components/TripCompletionOverviewCards'
import { useTripCompletionRealtime } from '@/features/trip-completion-review/hooks/useTripCompletionRealtime'

const REVIEW_TABS = ['queue', 'analytics'] as const
type ReviewTabKey = (typeof REVIEW_TABS)[number]

function resolveTab(tab: string | null): ReviewTabKey {
  if (tab && (REVIEW_TABS as readonly string[]).includes(tab)) {
    return tab as ReviewTabKey
  }
  return 'queue'
}

export default function TripCompletionReviewPage() {
  useDocumentTitle('Trip Completion Review')
  useTripCompletionRealtime()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveTab(searchParams.get('tab'))

  return (
    <PageShell
      title="Trip Completion Complaints"
      description="Review passenger trip completion complaints, analyze GPS routes, fare breakdowns, and process refunds or adjustments."
    >
      <TripCompletionOverviewCards />

      <div className="glass-card mt-6 p-4">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[
            { key: 'queue', label: 'Complaint Queue', children: <ComplaintQueueTable /> },
            { key: 'analytics', label: 'Analytics', children: <TripCompletionAnalytics /> },
          ]}
        />
      </div>
    </PageShell>
  )
}
