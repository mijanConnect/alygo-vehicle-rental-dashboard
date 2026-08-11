import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { EventItem, EventStatus } from '@/redux/api/eventsManageApi'

export const EVENT_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const DEFAULT_EVENT_CENTER = {
  lat: 23.8103,
  lng: 90.4125,
}

export function getEventCoordinates(item?: EventItem | null) {
  const [lng, lat] = item?.location?.coordinates ?? []
  if (typeof lat === 'number' && typeof lng === 'number') {
    return { lat, lng }
  }
  return DEFAULT_EVENT_CENTER
}

export function getEventActionItems(record: EventItem): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 0 },
    {
      key: 'toggle',
      label: record.status === 'active' ? 'Deactivate' : 'Activate',
      icon: record.status === 'active' ? Ban : CheckCircle2,
      group: 1,
    },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function getEventStatusColor(status: EventStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getEventStatusLabel(status: EventStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
