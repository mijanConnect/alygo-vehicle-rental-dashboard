import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { RideCategoryRow } from '@/features/ride-categories/mapRideCategory'
import type { RideCategoryStatus } from '@/redux/api/rideCategoriesApi'

export const RIDE_CATEGORY_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function getRideCategoryActionItems(record: RideCategoryRow): ActionMenuItem[] {
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

export function getRideCategoryStatusColor(status: RideCategoryStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getRideCategoryStatusLabel(status: RideCategoryStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
