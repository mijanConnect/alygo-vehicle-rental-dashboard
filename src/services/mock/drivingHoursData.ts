import type {
  CityDrivingRule,
  CityRulesSummary,
  DriverHoursRecord,
  DrivingHoursAnalytics,
  DrivingHoursGlobalPolicy,
  DrivingHoursOverview,
  StateDrivingRule,
  StateRulesSummary,
  ViolationPenaltySettings,
} from '@/types/drivingHours'

const defaultPenalties: ViolationPenaltySettings = {
  firstOffense: 'Warning notification',
  secondOffense: 'Temporary suspension (24h)',
  thirdOffense: 'Account review and restriction',
  autoSuspendAfter: 3,
}

export let mockDrivingHoursPolicy: DrivingHoursGlobalPolicy = {
  id: 'dhp-global',
  maxDrivingHours: 12,
  requiredResetHours: 8,
  warningThresholdHours: 10,
  dailyDrivingLimit: 12,
  weeklyDrivingLimit: 60,
  mandatoryBreakDuration: 30,
  breakTriggerThreshold: 6,
  status: 'active',
}

function stateRule(
  id: string,
  state: string,
  overrides: Partial<StateDrivingRule> = {},
): StateDrivingRule {
  return {
    id,
    state,
    maxDrivingHours: 12,
    requiredResetHours: 8,
    warningThresholdHours: 10,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 60,
    mandatoryBreakDuration: 30,
    breakTriggerThreshold: 6,
    violationPenaltySettings: { ...defaultPenalties },
    driverLevelExceptions: [],
    status: 'active',
    violations: 0,
    ...overrides,
  }
}

export let mockStateDrivingRules: StateDrivingRule[] = [
  stateRule('sd-ca', 'California', {
    maxDrivingHours: 12,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 58,
    driverLevelExceptions: [
      { level: 'platinum', maxDrivingHours: 14, dailyDrivingLimit: 14 },
      { level: 'diamond', maxDrivingHours: 14, dailyDrivingLimit: 14, weeklyDrivingLimit: 65 },
    ],
    violations: 4,
  }),
  stateRule('sd-ny', 'New York', {
    maxDrivingHours: 10,
    requiredResetHours: 10,
    warningThresholdHours: 8,
    dailyDrivingLimit: 10,
    weeklyDrivingLimit: 50,
    mandatoryBreakDuration: 45,
    breakTriggerThreshold: 5,
    violations: 6,
  }),
  stateRule('sd-tx', 'Texas', {
    maxDrivingHours: 14,
    requiredResetHours: 6,
    warningThresholdHours: 12,
    dailyDrivingLimit: 14,
    weeklyDrivingLimit: 70,
    violations: 2,
  }),
  stateRule('sd-fl', 'Florida', {
    maxDrivingHours: 12,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 55,
    violations: 1,
  }),
]

function cityRule(
  id: string,
  city: string,
  state: string,
  overrides: Partial<CityDrivingRule> = {},
): CityDrivingRule {
  return {
    id,
    city,
    state,
    maxDrivingHours: 12,
    requiredResetHours: 8,
    warningThresholdHours: 10,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 60,
    mandatoryBreakDuration: 30,
    breakTriggerThreshold: 6,
    driverLevelOverrides: [],
    status: 'active',
    inheritanceSource: 'custom',
    violations: 0,
    ...overrides,
  }
}

function inheritedFromState(stateName: string): Partial<CityDrivingRule> {
  const parent = mockStateDrivingRules.find((r) => r.state === stateName)
  if (!parent) return inheritedFromGlobal()
  return {
    maxDrivingHours: parent.maxDrivingHours,
    requiredResetHours: parent.requiredResetHours,
    warningThresholdHours: parent.warningThresholdHours,
    dailyDrivingLimit: parent.dailyDrivingLimit,
    weeklyDrivingLimit: parent.weeklyDrivingLimit,
    mandatoryBreakDuration: parent.mandatoryBreakDuration,
    breakTriggerThreshold: parent.breakTriggerThreshold,
    driverLevelOverrides: parent.driverLevelExceptions,
    inheritanceSource: 'state',
  }
}

function inheritedFromGlobal(): Partial<CityDrivingRule> {
  return {
    maxDrivingHours: mockDrivingHoursPolicy.maxDrivingHours,
    requiredResetHours: mockDrivingHoursPolicy.requiredResetHours,
    warningThresholdHours: mockDrivingHoursPolicy.warningThresholdHours,
    dailyDrivingLimit: mockDrivingHoursPolicy.dailyDrivingLimit,
    weeklyDrivingLimit: mockDrivingHoursPolicy.weeklyDrivingLimit,
    mandatoryBreakDuration: mockDrivingHoursPolicy.mandatoryBreakDuration,
    breakTriggerThreshold: mockDrivingHoursPolicy.breakTriggerThreshold,
    driverLevelOverrides: [],
    inheritanceSource: 'global',
  }
}

export let mockCityDrivingRules: CityDrivingRule[] = [
  cityRule('cd-sf', 'San Francisco', 'California', {
    maxDrivingHours: 10,
    warningThresholdHours: 8,
    dailyDrivingLimit: 10,
    weeklyDrivingLimit: 48,
    mandatoryBreakDuration: 45,
    breakTriggerThreshold: 5,
    driverLevelOverrides: [{ level: 'diamond', maxDrivingHours: 12, dailyDrivingLimit: 12 }],
    violations: 2,
  }),
  cityRule('cd-la', 'Los Angeles', 'California', {
    maxDrivingHours: 12,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 55,
    violations: 1,
  }),
  cityRule('cd-nyc', 'New York City', 'New York', {
    maxDrivingHours: 10,
    requiredResetHours: 10,
    warningThresholdHours: 8,
    dailyDrivingLimit: 10,
    weeklyDrivingLimit: 50,
    mandatoryBreakDuration: 45,
    violations: 3,
  }),
  cityRule('cd-mia', 'Miami', 'Florida', {
    maxDrivingHours: 12,
    dailyDrivingLimit: 12,
    weeklyDrivingLimit: 52,
    violations: 0,
  }),
  cityRule('cd-sd', 'San Diego', 'California', {
    ...inheritedFromState('California'),
    violations: 1,
  }),
  cityRule('cd-dal', 'Dallas', 'Texas', {
    ...inheritedFromState('Texas'),
    violations: 0,
  }),
  cityRule('cd-chi', 'Chicago', 'Illinois', {
    ...inheritedFromGlobal(),
    violations: 2,
  }),
]

export let mockDriverHoursRecords: DriverHoursRecord[] = [
  { id: 'dh-1', driverId: 'd-204', driverName: 'Marcus Johnson', city: 'San Francisco', state: 'California', hoursDrivenToday: 9.5, hoursDrivenThisWeek: 42, maxAllowedHours: 10, resetHoursRemaining: 0, status: 'near_limit', lastTripEndedAt: '2026-06-12T14:30:00Z', violations: 0 },
  { id: 'dh-2', driverId: 'd-089', driverName: 'Lisa Martinez', city: 'San Francisco', state: 'California', hoursDrivenToday: 6.2, hoursDrivenThisWeek: 38, maxAllowedHours: 10, resetHoursRemaining: 0, status: 'active', lastTripEndedAt: '2026-06-12T13:45:00Z', violations: 0 },
  { id: 'dh-3', driverId: 'd-118', driverName: 'David Kim', city: 'Los Angeles', state: 'California', hoursDrivenToday: 11.8, hoursDrivenThisWeek: 52, maxAllowedHours: 12, resetHoursRemaining: 0, status: 'near_limit', lastTripEndedAt: '2026-06-12T15:00:00Z', violations: 1 },
  { id: 'dh-4', driverId: 'd-302', driverName: 'Elena Rodriguez', city: 'New York City', state: 'New York', hoursDrivenToday: 10.5, hoursDrivenThisWeek: 48, maxAllowedHours: 10, resetHoursRemaining: 0, status: 'over_limit', lastTripEndedAt: '2026-06-12T14:55:00Z', violations: 2 },
  { id: 'dh-5', driverId: 'd-441', driverName: 'James Wilson', city: 'Miami', state: 'Florida', hoursDrivenToday: 4.0, hoursDrivenThisWeek: 28, maxAllowedHours: 12, resetHoursRemaining: 0, status: 'active', lastTripEndedAt: '2026-06-12T12:00:00Z', violations: 0 },
  { id: 'dh-6', driverId: 'd-512', driverName: 'Jennifer Park', city: 'San Francisco', state: 'California', hoursDrivenToday: 0, hoursDrivenThisWeek: 22, maxAllowedHours: 10, resetHoursRemaining: 6.5, status: 'on_reset', lastTripEndedAt: '2026-06-12T06:00:00Z', violations: 0 },
]

export function computeDrivingHoursOverview(): DrivingHoursOverview {
  return {
    driversNearLimit: mockDriverHoursRecords.filter((d) => d.status === 'near_limit').length,
    driversOverLimit: mockDriverHoursRecords.filter((d) => d.status === 'over_limit').length,
    activeDrivers: mockDriverHoursRecords.filter((d) => d.status === 'active').length,
    drivingHourViolations: mockDriverHoursRecords.reduce((sum, d) => sum + d.violations, 0),
  }
}

export function computeStateRulesSummary(): StateRulesSummary {
  return {
    totalStates: mockStateDrivingRules.length,
    activeStates: mockStateDrivingRules.filter((r) => r.status === 'active').length,
    customStates: mockStateDrivingRules.length,
    violations: mockStateDrivingRules.reduce((sum, r) => sum + r.violations, 0),
  }
}

export function computeCityRulesSummary(): CityRulesSummary {
  return {
    totalCities: mockCityDrivingRules.length,
    activeCities: mockCityDrivingRules.filter((r) => r.status === 'active').length,
    customCities: mockCityDrivingRules.filter((r) => r.inheritanceSource === 'custom').length,
    violations: mockCityDrivingRules.reduce((sum, r) => sum + r.violations, 0),
  }
}

export const US_STATE_OPTIONS = [
  'Alabama', 'Alaska', 'Arizona', 'California', 'Colorado', 'Connecticut', 'Florida',
  'Georgia', 'Illinois', 'Massachusetts', 'Michigan', 'Nevada', 'New York', 'Ohio',
  'Oregon', 'Pennsylvania', 'Tennessee', 'Texas', 'Virginia', 'Washington',
].map((s) => ({ value: s, label: s }))

export const DRIVER_LEVEL_OPTIONS = [
  { value: 'journey', label: 'Journey' },
  { value: 'pro_go', label: 'Pro Go' },
  { value: 'elite', label: 'Elite' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'diamond', label: 'Diamond' },
]

export const mockDrivingHoursAnalytics: DrivingHoursAnalytics = {
  violationTrend: [
    { label: 'Jan', value: 12 },
    { label: 'Feb', value: 10 },
    { label: 'Mar', value: 14 },
    { label: 'Apr', value: 8 },
    { label: 'May', value: 11 },
    { label: 'Jun', value: 9 },
  ],
  hoursByCity: [
    { label: 'San Francisco', value: 420 },
    { label: 'Los Angeles', value: 580 },
    { label: 'New York City', value: 510 },
    { label: 'Miami', value: 320 },
  ],
  complianceRate: [
    { label: 'Jan', value: 94 },
    { label: 'Feb', value: 95 },
    { label: 'Mar', value: 93 },
    { label: 'Apr', value: 96 },
    { label: 'May', value: 97 },
    { label: 'Jun', value: 96 },
  ],
}
