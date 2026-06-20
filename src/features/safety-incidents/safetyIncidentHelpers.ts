import { CheckCircle, Eye, MessageSquare, RefreshCw, RotateCcw, XCircle } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { SafetyIncident } from '@/types/safetyIncident'
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from '@/services/safetyIncidentApi'

export function getIncidentActionItems(record: SafetyIncident): ActionMenuItem[] {
  if (record.status === 'closed') {
    return [
      { key: 'view', label: 'View Case', icon: Eye },
      { key: 'reopen', label: 'Reopen Case', icon: RotateCcw, group: 1 },
    ]
  }

  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View Case', icon: Eye },
    { key: 'note', label: 'Add Notes', icon: MessageSquare, group: 1 },
    { key: 'status', label: 'Change Status', icon: RefreshCw, group: 1 },
  ]

  if (record.status !== 'resolved') {
    items.push({ key: 'resolve', label: 'Resolve Case', icon: CheckCircle, group: 2 })
  }

  if (record.status === 'resolved') {
    items.push({ key: 'close', label: 'Close Case', icon: XCircle, group: 2 })
  }

  return items
}

export function priorityColor(priority: string) {
  if (priority === 'critical') return 'error'
  if (priority === 'high') return 'warning'
  if (priority === 'medium') return 'processing'
  return 'default'
}

export function statusColor(status: string) {
  if (status === 'resolved' || status === 'closed') return 'success'
  if (status === 'in_review') return 'warning'
  return 'default'
}

export function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status
}

export function priorityLabel(priority: string) {
  return PRIORITY_LABELS[priority] ?? priority
}

export function severityLabel(level: string) {
  return PRIORITY_LABELS[level] ?? level
}
