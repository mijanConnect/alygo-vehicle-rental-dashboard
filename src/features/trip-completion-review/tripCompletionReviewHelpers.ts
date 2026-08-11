import { Eye, Pencil } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { useAdminActions } from '@/hooks/useAdminActions'
import type { TripComplaintRow } from '@/redux/api/tripReportApi'
import { formatCurrency } from '@/utils/format'

type AdminActions = ReturnType<typeof useAdminActions>

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  investigating: 'Investigating',
  resolved: 'Resolved',
  // legacy mock statuses
  pending_review: 'Pending Review',
  under_investigation: 'Under Investigation',
  approved_refund: 'Approved Refund',
  partial_refund: 'Partial Refund',
  rejected: 'Rejected',
  fare_adjusted: 'Fare Adjusted',
}

export function getComplaintActionItems(record: TripComplaintRow): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View Details', icon: Eye },
    { key: 'update-status', label: 'Update Status', icon: Pencil, group: 1 },
  ]

  if (record.status === 'resolved') {
    return items.filter((item) => item.key === 'view')
  }

  return items
}

export function buildComplaintSummaryFields(record: TripComplaintRow): DetailField[] {
  return [
    { label: 'Complaint ID', value: record.complaintId },
    { label: 'Ride ID', value: record.rideId },
    { label: 'Passenger', value: record.passengerName },
    { label: 'Driver', value: record.driverName },
    { label: 'Type', value: record.complaintType },
    { label: 'Status', value: COMPLAINT_STATUS_LABELS[record.status] ?? record.status },
    { label: 'Fare', value: formatCurrency(record.fare) },
    { label: 'Distance Delta', value: `${record.distanceDeltaMeters}m` },
  ]
}

export function openComplaintDrawer(
  title: string,
  fields: DetailField[],
  adminActions: AdminActions,
) {
  adminActions.openDrawer(title, fields)
}
