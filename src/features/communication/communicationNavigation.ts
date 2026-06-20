export const COMMUNICATION_TAB_KEYS = ['inbox', 'broadcasts'] as const

export type CommunicationTabKey = (typeof COMMUNICATION_TAB_KEYS)[number]

export const COMMUNICATION_TAB_LABELS: Record<CommunicationTabKey, string> = {
  inbox: 'Inbox',
  broadcasts: 'Broadcasts',
}

export const DEFAULT_COMMUNICATION_TAB: CommunicationTabKey = 'inbox'

export const INBOX_TYPE_FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Driver', value: 'driver' },
  { label: 'Passenger', value: 'passenger' },
  { label: 'Support', value: 'support' },
  { label: 'Safety', value: 'safety' },
] as const

export const INBOX_STATUS_FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
] as const

export const INBOX_PRIORITY_FILTER_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
] as const

const LEGACY_TAB_MAP: Record<string, CommunicationTabKey> = {
  'all-messages': 'inbox',
  inbox: 'inbox',
  drivers: 'inbox',
  passengers: 'inbox',
  support: 'inbox',
  safety: 'inbox',
  'support-tickets': 'inbox',
  conversations: 'inbox',
  'active-trip-chats': 'inbox',
  'driver-support': 'inbox',
  'passenger-support': 'inbox',
  'safety-comms': 'inbox',
  analytics: 'inbox',
  'comm-analytics': 'inbox',
  'internal-notes': 'inbox',
  'broadcast-messages': 'broadcasts',
  broadcast: 'broadcasts',
  'notification-templates': 'inbox',
  templates: 'inbox',
}

/** Legacy inbox tabs map to inbox type filter query param */
export const LEGACY_INBOX_TYPE_MAP: Record<string, string> = {
  drivers: 'driver',
  passengers: 'passenger',
  support: 'support',
  safety: 'safety',
  'driver-support': 'driver',
  'passenger-support': 'passenger',
  'safety-comms': 'safety',
}

export function resolveCommunicationTab(tab: string | null): CommunicationTabKey {
  if (!tab) return DEFAULT_COMMUNICATION_TAB
  if (COMMUNICATION_TAB_KEYS.includes(tab as CommunicationTabKey)) return tab as CommunicationTabKey
  return LEGACY_TAB_MAP[tab] ?? DEFAULT_COMMUNICATION_TAB
}

export function resolveLegacyInboxType(tab: string | null): string {
  if (!tab) return ''
  return LEGACY_INBOX_TYPE_MAP[tab] ?? ''
}

export function buildCommunicationInboxPath(type?: string) {
  const params = new URLSearchParams({ tab: 'inbox' })
  if (type) params.set('type', type)
  return `/communication?${params.toString()}`
}
