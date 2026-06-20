import { Eye, Pencil, Trash2 } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { DriverLevel, LevelBenefit } from '@/types/driverRewards'
import { LEVEL_LABELS } from '@/services/driverRewardsApi'
import { countActiveBenefitRules, parseBenefitRules } from '@/features/driver-rewards/utils/tierConfigHelpers'

export function getTierManagementActionItems(): ActionMenuItem[] {
  return [
    { key: 'view', label: 'View', icon: Eye, group: 1 },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function getTierBenefitActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]
}

export function buildTierDetailFields(record: DriverLevel): DetailField[] {
  const rules = parseBenefitRules(record.benefits)
  return [
    { label: 'Tier Name', value: record.label },
    { label: 'Level', value: record.level },
    { label: 'Trips Required', value: record.requiredTrips },
    { label: 'Rating Required', value: record.requiredRating },
    { label: 'Acceptance Rate', value: `${record.requiredAcceptanceRate}%` },
    { label: 'Completion Rate', value: `${record.requiredCompletionRate}%` },
    { label: 'Safety Score', value: record.requirements.safetyScore },
    { label: 'Active Benefits', value: countActiveBenefitRules(rules) },
    { label: 'Driver Count', value: record.driverCount },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
    { label: 'Notes', value: record.description || '—' },
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
