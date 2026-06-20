import { AlertTriangle, ArrowUp, CheckCircle, Eye, MessageSquare, Shield, UserPlus } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { Conversation, SafetyCommunication } from '@/types/communication'
import { PRIORITY_LABELS, STATUS_LABELS } from '@/services/communicationApi'

export function priorityColor(priority: string) {
  if (priority === 'critical') return 'error'
  if (priority === 'high') return 'warning'
  if (priority === 'medium') return 'processing'
  return 'default'
}

export function statusColor(status: string) {
  if (status === 'resolved' || status === 'closed') return 'success'
  if (status === 'escalated') return 'error'
  if (status === 'in_progress' || status === 'investigating') return 'processing'
  if (status === 'waiting_user') return 'warning'
  return 'default'
}

export function priorityLabel(priority: string) {
  return PRIORITY_LABELS[priority] ?? priority
}

export function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, ' ')
}

export function userTypeLabel(userType: string) {
  if (userType === 'driver') return 'Driver'
  if (userType === 'passenger') return 'Passenger'
  return userType
}

export function avatarUrl(name: string) {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=312e81,4338ca,6366f1`
}

export function formatRelativeActivity(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'NOW'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export const INBOX_CATEGORIES = [
  { key: 'all', label: 'All Conversations' },
  { key: 'driver', label: 'Drivers', userType: 'driver' as const },
  { key: 'passenger', label: 'Passengers', userType: 'passenger' as const },
  { key: 'active_trip', label: 'Active Trips', category: 'active_trip' as const },
  { key: 'safety', label: 'Safety Cases', category: 'safety' as const },
  { key: 'lost_found', label: 'Lost & Found', category: 'lost_found' as const },
  { key: 'escalation', label: 'Escalations', category: 'escalation' as const },
] as const

export type InboxCategoryKey = (typeof INBOX_CATEGORIES)[number]['key']

export const CURRENT_SUPPORT_AGENT = 'Sarah Kim'

export const OPEN_STATUSES = ['open', 'in_progress', 'waiting_user', 'escalated'] as const

export function getConversationActionItems(record: Conversation): ActionMenuItem[] {
  if (['resolved', 'closed'].includes(record.status)) {
    return [{ key: 'view', label: 'View', icon: Eye }]
  }
  return [
    { key: 'view', label: 'Open Chat', icon: MessageSquare },
    { key: 'assign', label: 'Assign Agent', icon: UserPlus, group: 1 },
    { key: 'resolve', label: 'Resolve', icon: CheckCircle, group: 1 },
    { key: 'escalate', label: 'Escalate', icon: ArrowUp, danger: true, group: 2 },
  ]
}

export function getSafetyActionItems(): ActionMenuItem[] {
  return [
    { key: 'contact-driver', label: 'Contact Driver', icon: MessageSquare, group: 1 },
    { key: 'contact-passenger', label: 'Contact Passenger', icon: MessageSquare, group: 1 },
    { key: 'escalate', label: 'Escalate Incident', icon: ArrowUp, group: 2 },
    { key: 'investigate', label: 'Create Investigation', icon: Shield, group: 2 },
    { key: 'suspend', label: 'Suspend Account', icon: AlertTriangle, danger: true, group: 3 },
    { key: 'report', label: 'Generate Report', icon: Eye, group: 3 },
  ]
}

export function getSafetyRecordActionItems(_record: SafetyCommunication): ActionMenuItem[] {
  return getSafetyActionItems()
}
