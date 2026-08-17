import { Ban, Eye, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import {
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
} from '@/features/communication/communicationHelpers'
import type {
  BroadcastItem,
  BroadcastStatus,
  BroadcastTargetAudience,
  BroadcastType,
} from '@/redux/api/broadcastsApi'

export const BROADCAST_TYPE_OPTIONS = [
  { label: 'Platform Update', value: 'platform_update' },
  { label: 'Emergency Alert', value: 'emergency_alert' },
  { label: 'Airport Notice', value: 'airport_notice' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Surge Opportunity', value: 'surge_opportunity' },
  { label: 'Weather Alert', value: 'weather_alert' },
  { label: 'Service Alert', value: 'service_alert' },
] as const

export const BROADCAST_TYPE_LABELS: Record<BroadcastType, string> = {
  platform_update: 'Platform Update',
  emergency_alert: 'Emergency Alert',
  airport_notice: 'Airport Notice',
  maintenance: 'Maintenance',
  surge_opportunity: 'Surge Opportunity',
  weather_alert: 'Weather Alert',
  service_alert: 'Service Alert',
}

export const BROADCAST_AUDIENCE_OPTIONS = [
  { label: 'All Drivers', value: 'all_drivers' },
  { label: 'All Passengers', value: 'all_passengers' },
  { label: 'By City', value: 'by_city' },
  { label: 'By State', value: 'by_state' },
  { label: 'By Tier', value: 'by_tier' },
] as const

export const BROADCAST_AUDIENCE_LABELS: Record<BroadcastTargetAudience, string> = {
  all_drivers: 'All Drivers',
  all_passengers: 'All Passengers',
  by_city: 'By City',
  by_state: 'By State',
  by_tier: 'By Tier',
}

export const BROADCAST_STATUS_OPTIONS = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Sent', value: 'sent' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
]

export const BROADCAST_DELIVERY_OPTIONS = [
  { label: 'Send Immediately', value: 'immediate' },
  { label: 'Schedule Broadcast', value: 'scheduled' },
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

export function getBroadcastStatusLabel(status?: string) {
  const value = (status ?? '').toLowerCase()
  if (value === 'scheduled') return 'Scheduled'
  if (value === 'sent') return 'Sent'
  if (value === 'failed') return 'Failed'
  if (value === 'cancelled') return 'Cancelled'
  return status || '—'
}

export function getBroadcastStatusColor(status?: string) {
  const value = (status ?? '').toLowerCase()
  if (value === 'sent') return 'success'
  if (value === 'failed') return 'error'
  if (value === 'cancelled') return 'default'
  if (value === 'scheduled') return 'processing'
  return 'default'
}

export function getBroadcastActionItems(status?: string): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
  if ((status ?? '').toLowerCase() === 'scheduled') {
    items.unshift({ key: 'cancel', label: 'Cancel', icon: Ban, group: 1 })
  }
  return items
}

export function formatBroadcastAudience(record: BroadcastItem) {
  return (
    BROADCAST_AUDIENCE_LABELS[record.targetAudience as BroadcastTargetAudience] ??
    record.targetAudience
  )
}

export function getCreatedByName(record: BroadcastItem) {
  if (!record.createdBy) return '—'
  if (typeof record.createdBy === 'string') return record.createdBy
  return record.createdBy.name || record.createdBy.email || '—'
}

export function isScheduledBroadcast(status?: BroadcastStatus | string) {
  return (status ?? '').toLowerCase() === 'scheduled'
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
