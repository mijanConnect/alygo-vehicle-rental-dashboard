import { Ban, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem } from '@/components/admin/types'
import type {
  PeakHourDay,
  PeakHourItem,
  PeakHourStatus,
} from '@/redux/api/pickHoursApi'

export const PEAK_HOUR_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const PEAK_HOUR_DAY_OPTIONS: { label: string; value: PeakHourDay }[] = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

const DAY_LABELS: Record<PeakHourDay, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export function formatApplicableDays(days: PeakHourDay[] | undefined) {
  if (!days?.length) return '—'
  return days.map((day) => DAY_LABELS[day] ?? day).join(', ')
}

export function getPeakHourActionItems(record: PeakHourItem): ActionMenuItem[] {
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

export function getPeakHourStatusColor(status: PeakHourStatus): string {
  return status === 'active' ? 'success' : 'default'
}

export function getPeakHourStatusLabel(status: PeakHourStatus): string {
  return status === 'active' ? 'Active' : 'Inactive'
}
