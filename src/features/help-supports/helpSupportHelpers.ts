import { CheckCircle2, Eye, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type {
  HelpAndSupportsItem,
  SupportPriority,
  SupportStatus,
} from '@/redux/api/heplAndSupportsApi'

export const SUPPORT_PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
]

export const SUPPORT_STATUS_OPTIONS = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Resolved', value: 'RESOLVED' },
]

export function normalizeSupportStatus(status?: SupportStatus | null) {
  const value = (status ?? 'PENDING').toString().toUpperCase()
  return value === 'RESOLVED' ? 'RESOLVED' : value === 'OPEN' ? 'OPEN' : 'PENDING'
}

export function isSupportResolved(status?: SupportStatus | null) {
  return normalizeSupportStatus(status) === 'RESOLVED'
}

export function getSupportPriorityColor(priority: SupportPriority): string {
  const value = priority?.toString().toLowerCase()
  if (value === 'high') return 'error'
  if (value === 'medium') return 'warning'
  return 'default'
}

export function getSupportStatusColor(status?: SupportStatus | null): string {
  return isSupportResolved(status) ? 'success' : 'processing'
}

export function getSupportStatusLabel(status?: SupportStatus | null): string {
  const normalized = normalizeSupportStatus(status)
  if (normalized === 'RESOLVED') return 'Resolved'
  if (normalized === 'OPEN') return 'Open'
  return 'Pending'
}

export function getSupportActionItems(record: HelpAndSupportsItem): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'details', label: 'Details', icon: Eye, group: 0 },
  ]

  if (!isSupportResolved(record.status)) {
    items.push({
      key: 'resolve',
      label: 'Mark Resolved',
      icon: CheckCircle2,
      group: 1,
    })
  }

  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 })
  return items
}
