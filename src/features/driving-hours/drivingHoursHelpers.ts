import { Copy, Eye, Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { CityDrivingRule, RuleInheritanceSource, StateDrivingRule } from '@/types/drivingHours'

export function getStateRuleActionItems(record: StateDrivingRule): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    { key: 'duplicate', label: 'Duplicate', icon: Copy, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, danger: true, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 })
  return items
}

export function getCityRuleActionItems(record: CityDrivingRule): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
  ]
  if (record.inheritanceSource !== 'custom') {
    items.push({ key: 'customize', label: 'Customize Rule', icon: Pencil, group: 1 })
  } else {
    items.push({ key: 'edit', label: 'Edit', icon: Pencil, group: 1 })
  }
  if (record.status === 'active') {
    items.push({ key: 'deactivate', label: 'Deactivate', icon: PowerOff, danger: true, group: 2 })
  } else {
    items.push({ key: 'activate', label: 'Activate', icon: Power, group: 2 })
  }
  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 })
  return items
}

export const DRIVER_HOURS_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  near_limit: 'Near Limit',
  over_limit: 'Over Limit',
  on_reset: 'On Reset',
}

export const INHERITANCE_LABELS: Record<RuleInheritanceSource, string> = {
  custom: 'Custom Rule',
  state: 'Inherited From State',
  global: 'Inherited From Global',
}

export function inheritanceBadgeColor(source: RuleInheritanceSource) {
  if (source === 'custom') return 'purple'
  if (source === 'state') return 'blue'
  return 'default'
}

function formatLevelOverrides(overrides: { level: string; maxDrivingHours?: number }[]) {
  if (!overrides.length) return 'None'
  return overrides.map((o) => `${o.level}${o.maxDrivingHours ? ` (${o.maxDrivingHours}h)` : ''}`).join(', ')
}

function formatPenalties(p: StateDrivingRule['violationPenaltySettings']) {
  return `1st: ${p.firstOffense} · 2nd: ${p.secondOffense} · 3rd: ${p.thirdOffense} · Auto-suspend after ${p.autoSuspendAfter}`
}

export function buildStateRuleFields(record: StateDrivingRule): DetailField[] {
  return [
    { label: 'State', value: record.state },
    { label: 'Inheritance', value: 'Overrides Global Policy' },
    { label: 'Max Driving Hours', value: record.maxDrivingHours },
    { label: 'Required Reset Hours', value: record.requiredResetHours },
    { label: 'Warning Threshold', value: record.warningThresholdHours },
    { label: 'Daily Driving Limit', value: record.dailyDrivingLimit },
    { label: 'Weekly Driving Limit', value: record.weeklyDrivingLimit },
    { label: 'Mandatory Break Duration', value: `${record.mandatoryBreakDuration} min` },
    { label: 'Break Trigger Threshold', value: `${record.breakTriggerThreshold} hours` },
    { label: 'Violation Penalties', value: formatPenalties(record.violationPenaltySettings) },
    { label: 'Driver Level Exceptions', value: formatLevelOverrides(record.driverLevelExceptions) },
    { label: 'Violations', value: record.violations },
    { label: 'Status', value: record.status },
  ]
}

export function buildCityRuleFields(record: CityDrivingRule): DetailField[] {
  return [
    { label: 'City', value: record.city },
    { label: 'State', value: record.state },
    { label: 'Inheritance', value: INHERITANCE_LABELS[record.inheritanceSource] },
    { label: 'Max Driving Hours', value: record.maxDrivingHours },
    { label: 'Required Reset Hours', value: record.requiredResetHours },
    { label: 'Warning Threshold', value: record.warningThresholdHours },
    { label: 'Daily Driving Limit', value: record.dailyDrivingLimit },
    { label: 'Weekly Driving Limit', value: record.weeklyDrivingLimit },
    { label: 'Mandatory Break Duration', value: `${record.mandatoryBreakDuration} min` },
    { label: 'Break Trigger Threshold', value: `${record.breakTriggerThreshold} hours` },
    { label: 'Driver Level Overrides', value: formatLevelOverrides(record.driverLevelOverrides) },
    { label: 'Violations', value: record.violations },
    { label: 'Status', value: record.status },
  ]
}

export function exportRulesJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
