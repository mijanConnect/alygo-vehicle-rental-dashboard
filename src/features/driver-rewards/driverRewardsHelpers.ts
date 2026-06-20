import {
  Ban,
  Copy,
  Eye,
  Pencil,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { useAdminActions } from '@/hooks/useAdminActions'
import type {
  DriverLevel,
  DriverPerformanceRecord,
  LevelBenefit,
  PointsRule,
  Promotion,
} from '@/types/driverRewards'
import { LEVEL_LABELS } from '@/services/driverRewardsApi'
import { formatReservationAccess } from '@/features/driver-rewards/utils/tierConfigHelpers'
import { formatCurrency } from '@/utils/format'

type AdminActions = ReturnType<typeof useAdminActions>

export function openRewardsDrawer(title: string, fields: DetailField[], adminActions: AdminActions) {
  adminActions.openDrawer(title, fields)
}

export function getTierActionItems(record: DriverLevel): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'duplicate', label: 'Duplicate', icon: Copy, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  return items
}

export const getLevelActionItems = getTierActionItems

export function getPointsRuleActionItems(record: PointsRule): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'duplicate', label: 'Duplicate', icon: Copy, group: 1 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, group: 3 })
  } else {
    items.push({ key: 'enable', label: 'Enable', icon: Power, group: 3 })
  }
  return items
}

export function getBenefitActionItems(record: LevelBenefit): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'edit', label: 'Edit Benefit', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Remove Benefit', icon: Trash2, danger: true, group: 2 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, group: 3 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 3 })
  }
  return items
}

export function getDriverControlActionItems(record: DriverPerformanceRecord): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View Profile', icon: Eye },
    { key: 'adjust-points', label: 'Adjust Points', icon: Pencil, group: 1 },
    { key: 'promote', label: 'Promote Tier', icon: TrendingUp, group: 2 },
    { key: 'demote', label: 'Demote Tier', icon: TrendingDown, group: 2 },
    { key: 'reset', label: 'Reset Tier', icon: RefreshCw, group: 3 },
    { key: 'suspend', label: record.rewardsSuspended ? 'Resume Rewards' : 'Suspend Rewards', icon: Ban, group: 3 },
    { key: 'history', label: 'View History', icon: Eye, group: 4 },
  ]
  if (record.currentLevel === 'diamond') return items.filter((i) => i.key !== 'promote')
  if (record.currentLevel === 'journey') return items.filter((i) => i.key !== 'demote')
  return items
}

export const getDriverPerformanceActionItems = getDriverControlActionItems

export function getPromotionActionItems(record: Promotion): ActionMenuItem[] {
  const items: ActionMenuItem[] = [{ key: 'edit', label: 'Edit Promotion', icon: Pencil, group: 1 }]
  if (record.status === 'active') {
    items.push({ key: 'pause', label: 'Pause Promotion', icon: PowerOff, group: 2 })
  } else if (record.status === 'paused') {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  items.push({ key: 'delete', label: 'Delete Promotion', icon: Trash2, danger: true, group: 3 })
  return items
}

export function getAchievementActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function buildLevelDetailFields(record: DriverLevel): DetailField[] {
  const b = record.benefits
  return [
    { label: 'Tier Name', value: record.label },
    { label: 'Required Points', value: record.requiredPoints },
    { label: 'Tier Level', value: record.level },
    { label: 'Description', value: record.description },
    { label: 'Destination Filters', value: b.destinationFilters },
    { label: 'Reservation Access', value: formatReservationAccess(b.reservationAccess) },
    { label: 'Bonus Multiplier', value: `${b.bonusMultiplier}x` },
    { label: 'Peak Hour Multiplier', value: `${b.peakHourMultiplier}x` },
    { label: 'Dispatch Priority', value: b.dispatchPriorityLevel },
    { label: 'Min Acceptance Rate', value: `${b.minimumAcceptanceRate}%` },
    { label: 'Min Completion Rate', value: `${b.minimumCompletionRate}%` },
    { label: 'Min Driver Rating', value: b.minimumDriverRating },
    { label: 'Driver Count', value: record.driverCount },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
  ]
}

export function summarizeTierRequirements(record: DriverLevel) {
  const r = record.requirements
  return `${r.completedTrips}+ trips · ${r.driverRating}+ rating · ${r.acceptanceRate}% acceptance`
}

export function summarizeTierBenefits(record: DriverLevel) {
  const b = record.benefits
  const parts = [
    `${b.destinationFilters} filters`,
    formatReservationAccess(b.reservationAccess),
    b.bonusMultiplier > 1 ? `${b.bonusMultiplier}x bonus` : null,
  ].filter(Boolean)
  return parts.join(' · ')
}

export function buildPromotionDetailFields(record: Promotion): DetailField[] {
  return [
    { label: 'Promotion Name', value: record.name },
    { label: 'Type', value: record.type.replace(/_/g, ' ') },
    { label: 'Bonus Amount', value: formatCurrency(record.amount) },
    { label: 'Start Date', value: new Date(record.startDate).toLocaleString() },
    { label: 'End Date', value: new Date(record.endDate).toLocaleString() },
    { label: 'Status', value: record.status },
  ]
}

export function levelLabel(level: string) {
  return LEVEL_LABELS[level as keyof typeof LEVEL_LABELS] ?? level
}
