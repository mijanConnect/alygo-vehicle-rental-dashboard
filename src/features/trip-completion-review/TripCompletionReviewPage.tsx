import { Tabs } from 'antd'
import { PageShell } from '@/components/common/PageShell'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ComplaintQueueTable } from '@/features/trip-completion-review/components/ComplaintQueueTable'
import { TripCompletionAnalytics } from '@/features/trip-completion-review/components/TripCompletionAnalytics'
import { TripCompletionOverviewCards } from '@/features/trip-completion-review/components/TripCompletionOverviewCards'
import { useTripCompletionRealtime } from '@/features/trip-completion-review/hooks/useTripCompletionRealtime'

export default function TripCompletionReviewPage() {
  useDocumentTitle('Trip Completion Review')
  useTripCompletionRealtime()

  return (
    <PageShell
      title="Trip Completion Complaints"
      description="Review passenger trip completion complaints, analyze GPS routes, fare breakdowns, and process refunds or adjustments."
    >
      <TripCompletionOverviewCards />

      <div className="glass-card mt-6 p-4">
        <Tabs
          defaultActiveKey="queue"
          items={[
            { key: 'queue', label: 'Complaint Queue', children: <ComplaintQueueTable /> },
            { key: 'analytics', label: 'Analytics', children: <TripCompletionAnalytics /> },
          ]}
        />
      </div>
    </PageShell>
  )
}
