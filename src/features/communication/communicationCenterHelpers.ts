import { Eye, Pencil, Send, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { BroadcastRecord } from '@/types/communication'
import { BROADCAST_TARGET_LABELS } from '@/services/communicationApi'
import { priorityColor, priorityLabel, statusColor, statusLabel } from '@/features/communication/communicationHelpers'

export const BROADCAST_AUDIENCE_OPTIONS = [
  { value: 'all_drivers', label: 'All Drivers' },
  { value: 'all_passengers', label: 'All Passengers' },
  { value: 'city', label: 'City Based' },
  { value: 'state', label: 'State Based' },
  { value: 'tier_based', label: 'Tier Based' },
]

export const TIER_OPTIONS = [
  { value: 'Journey', label: 'Journey' },
  { value: 'Pro', label: 'Pro' },
  { value: 'Elite', label: 'Elite' },
  { value: 'Platinum', label: 'Platinum' },
  { value: 'Diamond', label: 'Diamond' },
]

export const SUPPORT_AGENT_OPTIONS = [
  { value: 'Sarah Kim', label: 'Sarah Kim' },
  { value: 'Mike Torres', label: 'Mike Torres' },
  { value: 'Lisa Park', label: 'Lisa Park' },
  { value: 'Safety Team Alpha', label: 'Safety Team Alpha' },
  { value: 'Safety Team Beta', label: 'Safety Team Beta' },
  { value: 'Compliance Admin', label: 'Compliance Admin' },
]

export function getInboxActionItems(): ActionMenuItem[] {
  return [{ key: 'view', label: 'View', icon: Eye }]
}

export function getBroadcastActionItems(status: BroadcastRecord['status']): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
  if (status === 'scheduled') {
    items.unshift({ key: 'send', label: 'Send Now', icon: Send, group: 1 })
  }
  return items
}

export function formatBroadcastAudience(record: BroadcastRecord) {
  const base = BROADCAST_TARGET_LABELS[record.target] ?? record.target
  return record.targetValue ? `${base} — ${record.targetValue}` : base
}

export function typeColor(type: string) {
  if (type === 'safety') return 'error'
  if (type === 'support') return 'processing'
  if (type === 'driver') return 'blue'
  if (type === 'passenger') return 'purple'
  if (type === 'system') return 'default'
  return 'default'
}

export { priorityColor, priorityLabel, statusColor, statusLabel }
