import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type {
  DriverRewardsAuditFields,
  DriverRewardsEntityStatus,
  PointsRuleCategory,
} from '@/types/driverRewards'
import { formatDateTime } from '@/utils/format'

export const REWARDS_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

export const REWARD_CATEGORY_OPTIONS: { label: string; value: PointsRuleCategory }[] = [
  { label: 'Ride Completion', value: 'ride_completion' },
  { label: 'Rating', value: 'rating' },
  { label: 'Airport', value: 'airport' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Peak Hour', value: 'peak_hour' },
  { label: 'Bonus', value: 'bonus' },
  { label: 'Other', value: 'other' },
]

export const REWARD_CATEGORY_LABELS: Record<PointsRuleCategory, string> = {
  ride_completion: 'Ride Completion',
  rating: 'Rating',
  airport: 'Airport',
  scheduled: 'Scheduled',
  peak_hour: 'Peak Hour',
  performance: 'Performance',
  penalty: 'Penalty',
  bonus: 'Bonus',
  other: 'Other',
}

export function getRewardsConfigActionItems(
  status: DriverRewardsEntityStatus,
): ActionMenuItem[] {
  const items: ActionMenuItem[] = [{ key: 'edit', label: 'Edit', icon: Pencil, group: 1 }]
  if (status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, group: 2 })
  } else {
    items.push({ key: 'enable', label: 'Enable', icon: Power, group: 2 })
  }
  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 3 })
  return items
}

export function buildAuditDetailFields(record: DriverRewardsAuditFields): DetailField[] {
  return [
    { label: 'Created By', value: record.createdBy ?? '—' },
    { label: 'Updated By', value: record.updatedBy ?? '—' },
    { label: 'Created At', value: record.createdAt ? formatDateTime(record.createdAt) : '—' },
    { label: 'Updated At', value: record.updatedAt ? formatDateTime(record.updatedAt) : '—' },
  ]
}
