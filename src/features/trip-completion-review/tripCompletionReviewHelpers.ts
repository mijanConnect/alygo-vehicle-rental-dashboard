import { AlertTriangle, Ban, CheckCircle, DollarSign, Eye, Pencil, XCircle } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { useAdminActions } from '@/hooks/useAdminActions'
import type { TripCompletionComplaint } from '@/types/tripCompletionReview'
import { formatCurrency } from '@/utils/format'

type AdminActions = ReturnType<typeof useAdminActions>

export const COMPLAINT_STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  under_investigation: 'Under Investigation',
  approved_refund: 'Approved Refund',
  partial_refund: 'Partial Refund',
  rejected: 'Rejected',
  fare_adjusted: 'Fare Adjusted',
}

export function getComplaintActionItems(record: TripCompletionComplaint): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View Profile', icon: Eye },
    { key: 'approve-refund', label: 'Approve Refund', icon: CheckCircle, group: 1 },
    { key: 'partial-refund', label: 'Partial Refund', icon: DollarSign, group: 1 },
    { key: 'reject', label: 'Reject Complaint', icon: XCircle, group: 2 },
    { key: 'adjust-fare', label: 'Adjust Fare', icon: Pencil, group: 2 },
    { key: 'driver-warning', label: 'Add Driver Warning', icon: AlertTriangle, group: 3 },
    { key: 'suspend-driver', label: 'Suspend Driver', icon: Ban, danger: true, group: 3 },
  ]
  if (record.status === 'approved_refund' || record.status === 'rejected') {
    return items.filter((i) => i.key === 'view')
  }
  return items
}

export function buildComplaintSummaryFields(record: TripCompletionComplaint): DetailField[] {
  return [
    { label: 'Complaint ID', value: record.id },
    { label: 'Trip ID', value: record.tripId },
    { label: 'Passenger', value: record.passengerName },
    { label: 'Driver', value: record.driverName },
    { label: 'Type', value: record.complaintType },
    { label: 'Status', value: COMPLAINT_STATUS_LABELS[record.status] ?? record.status },
    { label: 'Fare Total', value: formatCurrency(record.fareTotal) },
    { label: 'Distance Delta', value: `${record.distanceDeltaMeters}m` },
  ]
}

export function openComplaintDrawer(title: string, fields: DetailField[], adminActions: AdminActions) {
  adminActions.openDrawer(title, fields)
}
