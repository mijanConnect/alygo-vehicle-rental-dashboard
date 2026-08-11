import type { DutyPolicyScopeType } from '@/redux/api/drivingHoursApi'

export const DRIVING_HOURS_POLICY_TAB_KEYS = [
  'global',
  'state',
  'city',
  'zone',
  'airport',
] as const satisfies readonly DutyPolicyScopeType[]

export const DRIVING_HOURS_TAB_KEYS = [
  ...DRIVING_HOURS_POLICY_TAB_KEYS,
  'monitoring',
  'analytics',
] as const

export type DrivingHoursTabKey = (typeof DRIVING_HOURS_TAB_KEYS)[number]

export const DRIVING_HOURS_TAB_LABELS: Record<DrivingHoursTabKey, string> = {
  global: 'Global',
  state: 'State',
  city: 'City',
  zone: 'Zone',
  airport: 'Airport',
  monitoring: 'Driver Monitoring',
  analytics: 'Analytics',
}

export const DEFAULT_DRIVING_HOURS_TAB: DrivingHoursTabKey = 'global'

export function resolveDrivingHoursTab(tab: string | null): DrivingHoursTabKey {
  if (!tab) return DEFAULT_DRIVING_HOURS_TAB
  if (DRIVING_HOURS_TAB_KEYS.includes(tab as DrivingHoursTabKey)) {
    return tab as DrivingHoursTabKey
  }
  if (tab === 'policy' || tab === 'global-policy') return 'global'
  if (tab === 'state-rules') return 'state'
  if (tab === 'city-rules') return 'city'
  return DEFAULT_DRIVING_HOURS_TAB
}
