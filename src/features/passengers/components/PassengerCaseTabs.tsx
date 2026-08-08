import { ComplaintQueueTable } from '@/features/trip-completion-review/components/ComplaintQueueTable'
import type { TripComplaintRow } from '@/redux/api/tripReportApi'

const OPEN_COMPLAINT_STATUSES = new Set(['open', 'investigating'])

export function PassengerComplaintsTab() {
  return (
    <ComplaintQueueTable
      description="Passenger trip completion complaints requiring review or follow-up."
      filter={(c: TripComplaintRow) => OPEN_COMPLAINT_STATUSES.has(c.status)}
    />
  )
}

export function PassengerRefundsTab() {
  return (
    <ComplaintQueueTable
      description="Resolved passenger trip completion complaints."
      filter={(c: TripComplaintRow) => c.status === 'resolved'}
    />
  )
}
