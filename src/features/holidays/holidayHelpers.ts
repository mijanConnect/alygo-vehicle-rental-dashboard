import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type { HolidayItem, HolidayStatus } from '@/redux/api/holidayManageApi'

export const HOLIDAY_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export function getHolidayActionItems(record: HolidayItem): ActionMenuItem[] {
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

export function getHolidayStatusColor(status: HolidayStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getHolidayStatusLabel(status: HolidayStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
