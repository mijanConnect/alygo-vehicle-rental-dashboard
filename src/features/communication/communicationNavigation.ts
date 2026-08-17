export const COMMUNICATION_TAB_KEYS = ['broadcasts'] as const

export type CommunicationTabKey = (typeof COMMUNICATION_TAB_KEYS)[number]

export const COMMUNICATION_TAB_LABELS: Record<CommunicationTabKey, string> = {
  broadcasts: 'Broadcasts',
}

export const DEFAULT_COMMUNICATION_TAB: CommunicationTabKey = 'broadcasts'

/** Legacy inbox filters — kept so unused inbox modules still typecheck. */
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
  'all-messages': 'broadcasts',
  inbox: 'broadcasts',
  drivers: 'broadcasts',
  passengers: 'broadcasts',
  support: 'broadcasts',
  safety: 'broadcasts',
  'support-tickets': 'broadcasts',
  conversations: 'broadcasts',
  'active-trip-chats': 'broadcasts',
  'driver-support': 'broadcasts',
  'passenger-support': 'broadcasts',
  'safety-comms': 'broadcasts',
  analytics: 'broadcasts',
  'comm-analytics': 'broadcasts',
  'internal-notes': 'broadcasts',
  'broadcast-messages': 'broadcasts',
  broadcast: 'broadcasts',
  broadcasts: 'broadcasts',
  'notification-templates': 'broadcasts',
  templates: 'broadcasts',
}

export function resolveCommunicationTab(tab: string | null): CommunicationTabKey {
  if (!tab) return DEFAULT_COMMUNICATION_TAB
  if (COMMUNICATION_TAB_KEYS.includes(tab as CommunicationTabKey)) {
    return tab as CommunicationTabKey
  }
  return LEGACY_TAB_MAP[tab] ?? DEFAULT_COMMUNICATION_TAB
}

/** Kept for legacy action presets — Communication Center is broadcasts-only. */
export function buildCommunicationInboxPath(_type?: string) {
  return '/communication'
}
