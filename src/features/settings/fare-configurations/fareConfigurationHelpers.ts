import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type {
  FareConfigurationItem,
  FareConfigurationStatus,
  FareRideCategoryRef,
  FareServiceAreaRef,
} from '@/redux/api/fareConfigurationsApi'

export const FARE_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function getRefId(
  value: string | { _id?: string } | null | undefined,
): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  return value._id
}

export function getServiceAreaLabel(
  value: string | FareServiceAreaRef | null | undefined,
): string {
  if (!value) return '—'
  if (typeof value === 'string') return value.slice(-8)

  const name =
    value.airport?.trim() ||
    value.zone?.trim() ||
    value.city?.trim() ||
    value.state?.trim() ||
    value.country?.trim() ||
    '—'
  const type = value.type ? ` (${value.type})` : ''
  return `${name}${type}`
}

export function getRideCategoryLabel(
  value: string | FareRideCategoryRef | null | undefined,
): string {
  if (!value) return '—'
  if (typeof value === 'string') return value.slice(-8)
  return value.name?.trim() || '—'
}

export function getFareActionItems(record: FareConfigurationItem): ActionMenuItem[] {
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

export function getFareStatusColor(status: FareConfigurationStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getFareStatusLabel(status: FareConfigurationStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
