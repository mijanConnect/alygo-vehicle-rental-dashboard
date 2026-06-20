import { Ban, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { RideCategoryDefinition } from '@/types/rideCategoryManagement'

export const RIDE_CATEGORY_STATUS_OPTIONS = [
  { label: 'Enabled', value: 'enabled' },
  { label: 'Disabled', value: 'disabled' },
]

export function getRideCategoryActionItems(record: RideCategoryDefinition): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 0 },
    {
      key: 'toggle',
      label: record.status === 'enabled' ? 'Disable' : 'Enable',
      icon: record.status === 'enabled' ? Ban : CheckCircle,
      group: 1,
    },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function getRideCategoryStatusColor(status: RideCategoryDefinition['status']): string {
  return status === 'enabled' ? 'success' : 'default'
}

export function getRideCategoryStatusLabel(status: RideCategoryDefinition['status']): string {
  return status === 'enabled' ? 'Enabled' : 'Disabled'
}
