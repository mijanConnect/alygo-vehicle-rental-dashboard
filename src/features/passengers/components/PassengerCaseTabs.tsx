import { ComplaintQueueTable } from '@/features/trip-completion-review/components/ComplaintQueueTable'
import type { TripCompletionComplaint } from '@/types/tripCompletionReview'

const OPEN_COMPLAINT_STATUSES = new Set([
  'pending_review',
  'under_investigation',
  'rejected',
])

export function PassengerComplaintsTab() {
  return (
    <ComplaintQueueTable
      description="Passenger trip completion complaints requiring review or follow-up."
      filter={(c: TripCompletionComplaint) => OPEN_COMPLAINT_STATUSES.has(c.status)}
    />
  )
}

export function PassengerRefundsTab() {
  return (
    <ComplaintQueueTable
      description="Passenger complaints with approved refunds, partial refunds, or fare adjustments."
      filter={(c: TripCompletionComplaint) =>
        c.status === 'approved_refund' ||
        c.status === 'partial_refund' ||
        c.status === 'fare_adjusted'
      }
    />
  )
}
