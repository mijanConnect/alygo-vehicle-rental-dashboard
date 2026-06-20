export type DrivingHoursDriverStatus = 'active' | 'near_limit' | 'over_limit' | 'on_reset'

export type RuleInheritanceSource = 'custom' | 'state' | 'global'

export interface ViolationPenaltySettings {
  firstOffense: string
  secondOffense: string
  thirdOffense: string
  autoSuspendAfter: number
}

export interface DriverLevelRuleOverride {
  level: string
  maxDrivingHours?: number
  dailyDrivingLimit?: number
  weeklyDrivingLimit?: number
}

export interface DrivingHoursGlobalPolicy {
  id: string
  maxDrivingHours: number
  requiredResetHours: number
  warningThresholdHours: number
  dailyDrivingLimit: number
  weeklyDrivingLimit: number
  mandatoryBreakDuration: number
  breakTriggerThreshold: number
  status: 'active' | 'inactive'
}

export interface StateDrivingRule {
  id: string
  state: string
  maxDrivingHours: number
  requiredResetHours: number
  warningThresholdHours: number
  dailyDrivingLimit: number
  weeklyDrivingLimit: number
  mandatoryBreakDuration: number
  breakTriggerThreshold: number
  violationPenaltySettings: ViolationPenaltySettings
  driverLevelExceptions: DriverLevelRuleOverride[]
  status: 'active' | 'inactive'
  violations: number
}

export interface CityDrivingRule {
  id: string
  city: string
  state: string
  maxDrivingHours: number
  requiredResetHours: number
  warningThresholdHours: number
  dailyDrivingLimit: number
  weeklyDrivingLimit: number
  mandatoryBreakDuration: number
  breakTriggerThreshold: number
  driverLevelOverrides: DriverLevelRuleOverride[]
  status: 'active' | 'inactive'
  inheritanceSource: RuleInheritanceSource
  violations: number
}

export interface StateRulesSummary {
  totalStates: number
  activeStates: number
  customStates: number
  violations: number
}

export interface CityRulesSummary {
  totalCities: number
  activeCities: number
  customCities: number
  violations: number
}

export interface DriverHoursRecord {
  id: string
  driverId: string
  driverName: string
  city: string
  state: string
  hoursDrivenToday: number
  hoursDrivenThisWeek: number
  maxAllowedHours: number
  resetHoursRemaining: number
  status: DrivingHoursDriverStatus
  lastTripEndedAt: string
  violations: number
}

export interface DrivingHoursOverview {
  driversNearLimit: number
  driversOverLimit: number
  activeDrivers: number
  drivingHourViolations: number
}

export interface DrivingHoursAnalytics {
  violationTrend: Array<{ label: string; value: number }>
  hoursByCity: Array<{ label: string; value: number }>
  complianceRate: Array<{ label: string; value: number }>
}
