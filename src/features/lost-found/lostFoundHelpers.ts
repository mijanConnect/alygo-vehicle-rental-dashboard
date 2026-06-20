import {
  AlertTriangle,
  Eye,
  MessageSquare,
  Pencil,
  Trash2,
  UserCheck,
  XCircle,
} from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type {
  DeliveryFeeSetting,
  LostItemReport,
  ReturnRecord,
} from '@/types/lostFound'

import type { useAdminActions } from '@/hooks/useAdminActions'
import type { DetailField } from '@/components/admin/types'

type AdminActions = ReturnType<typeof useAdminActions>

export function openLostFoundDrawer(title: string, fields: DetailField[], adminActions: AdminActions) {
  adminActions.openDrawer(title, fields)
}

export const REPORT_STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  found: 'Found',
  not_found: 'Not Found',
  pickup_scheduled: 'Pickup Scheduled',
  delivery_scheduled: 'Delivery Scheduled',
  completed: 'Completed',
  closed: 'Closed',
}

export const RETURN_METHOD_LABELS: Record<string, string> = {
  passenger_pickup: 'Passenger Pickup',
  driver_delivery: 'Driver Delivery',
}

export const RETURN_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  returned: 'Returned',
  cancelled: 'Cancelled',
}

export const DISPUTE_TYPE_LABELS: Record<string, string> = {
  passenger_item_missing: 'Passenger claims item missing',
  driver_item_not_found: 'Driver claims item not found',
  return_not_completed: 'Return not completed',
  ownership_dispute: 'Ownership dispute',
}

export function getLostItemReportActionItems(record: LostItemReport): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View Details', icon: Eye },
    { key: 'assign', label: 'Assign Case', icon: UserCheck, group: 1 },
    { key: 'contact-passenger', label: 'Contact Passenger', icon: MessageSquare, group: 1 },
    { key: 'contact-driver', label: 'Contact Driver', icon: MessageSquare, group: 1 },
    { key: 'dispute', label: 'Open Dispute', icon: AlertTriangle, group: 2 },
  ]
  if (record.status !== 'closed') {
    items.push({ key: 'close', label: 'Close Case', icon: XCircle, danger: true, group: 3 })
  }
  return items
}

export function getReturnActionItems(record: ReturnRecord): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'update-status', label: 'Update Status', icon: Pencil, group: 1 },
  ]
  if (record.returnStatus !== 'returned' && record.returnStatus !== 'cancelled') {
    items.push({ key: 'complete', label: 'Complete Return', icon: UserCheck, group: 2 })
  }
  return items
}

export function getDeliveryFeeActionItems(record: DeliveryFeeSetting): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: XCircle, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: UserCheck, group: 2 })
  }
  return items
}

export function getCategoryActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Category', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete Category', icon: Trash2, danger: true, group: 2 },
  ]
}

export function getDisputeActionItems(): ActionMenuItem[] {
  return [
    { key: 'view', label: 'View Evidence', icon: Eye },
    { key: 'contact-driver', label: 'Contact Driver', icon: MessageSquare, group: 1 },
    { key: 'contact-passenger', label: 'Contact Passenger', icon: MessageSquare, group: 1 },
    { key: 'resolve', label: 'Resolve', icon: UserCheck, group: 2 },
    { key: 'escalate', label: 'Escalate', icon: AlertTriangle, danger: true, group: 3 },
  ]
}
