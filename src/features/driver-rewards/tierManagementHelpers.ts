import { Ban, CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import { apiBenefitsToRules, countApiBenefitRules } from '@/features/driver-rewards/mapTierManagement'
import type { TierItem } from '@/redux/api/tiersManagementsApi'
import type { LevelBenefit } from '@/types/driverRewards'
import { LEVEL_LABELS } from '@/services/driverRewardsApi'

export function getTierManagementActionItems(record?: TierItem): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye, group: 1 },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
  ]

  if (record?.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: Ban, group: 2 })
  } else if (record) {
    items.push({ key: 'activate', label: 'Activate', icon: CheckCircle2, group: 2 })
  }

  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 })
  return items
}

export function getTierBenefitActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function buildTierDetailFields(record: TierItem): DetailField[] {
  return [
    { label: 'Tier Name', value: record.name },
    { label: 'Code', value: record.code },
    { label: 'Level', value: record.level },
    { label: 'Points Required', value: record.requirements.pointsRequired },
    { label: 'Trips Required', value: record.requirements.tripsRequired },
    { label: 'Rating Required', value: record.requirements.ratingRequired },
    { label: 'Acceptance Rate', value: `${record.requirements.acceptanceRateRequired}%` },
    { label: 'Active Benefits', value: countApiBenefitRules(apiBenefitsToRules(record.benefits)) },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
  ]
}

export function formatAssignedTiers(tiers: string[]) {
  return tiers.map((tier) => LEVEL_LABELS[tier] ?? tier).join(', ')
}

export function buildBenefitDetailFields(record: LevelBenefit): DetailField[] {
  return [
    { label: 'Benefit Name', value: record.name },
    { label: 'Description', value: record.description },
    { label: 'Assigned Tiers', value: formatAssignedTiers(record.assignedTiers) },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
  ]
}
