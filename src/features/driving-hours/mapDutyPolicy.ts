import type {
  DutyPolicyItem,
  DutyPolicyLocationField,
  DutyPolicyScopeType,
  DutyPolicyWritePayload,
} from '@/redux/api/drivingHoursApi'

export interface DutyPolicyFormValues {
  name: string
  countryId?: string
  stateId?: string
  cityId?: string
  zoneId?: string
  airportId?: string
  maxDrivingHoursPerDay: number
  maxContinuousDrivingHours: number
  breakAfterHours: number
  breakDurationMinutes: number
  maxTripsPerDay: number
  minimumRestHours: number
}

export function resolveLocationId(value: DutyPolicyLocationField): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value._id ?? ''
}

export function resolveLocationName(value: DutyPolicyLocationField): string {
  if (!value) return '—'
  if (typeof value === 'string') return value
  return (
    value.airport ||
    value.zone ||
    value.city ||
    value.state ||
    value.country ||
    value._id ||
    '—'
  )
}

export function defaultDutyPolicyFormValues(
  scopeType: DutyPolicyScopeType,
): DutyPolicyFormValues {
  return {
    name: '',
    maxDrivingHoursPerDay: 8,
    maxContinuousDrivingHours: 4,
    breakAfterHours: 4,
    breakDurationMinutes: 30,
    maxTripsPerDay: 20,
    minimumRestHours: 8,
    ...(scopeType === 'state' ? { stateId: undefined } : {}),
    ...(scopeType === 'city' ? { cityId: undefined } : {}),
    ...(scopeType === 'zone' ? { zoneId: undefined } : {}),
    ...(scopeType === 'airport' ? { airportId: undefined } : {}),
  }
}

export function dutyPolicyToFormValues(item: DutyPolicyItem): DutyPolicyFormValues {
  return {
    name: item.name,
    countryId: resolveLocationId(item.countryId) || undefined,
    stateId: resolveLocationId(item.stateId) || undefined,
    cityId: resolveLocationId(item.cityId) || undefined,
    zoneId: resolveLocationId(item.zoneId) || undefined,
    airportId: resolveLocationId(item.airportId) || undefined,
    maxDrivingHoursPerDay: item.maxDrivingHoursPerDay,
    maxContinuousDrivingHours: item.maxContinuousDrivingHours,
    breakAfterHours: item.breakAfterHours,
    breakDurationMinutes: item.breakDurationMinutes,
    maxTripsPerDay: item.maxTripsPerDay,
    minimumRestHours: item.minimumRestHours,
  }
}

export function buildDutyPolicyWritePayload(
  values: DutyPolicyFormValues,
  scopeType: DutyPolicyScopeType,
): DutyPolicyWritePayload {
  const payload: DutyPolicyWritePayload = {
    name: values.name.trim(),
    scopeType,
    maxDrivingHoursPerDay: values.maxDrivingHoursPerDay,
    maxContinuousDrivingHours: values.maxContinuousDrivingHours,
    breakAfterHours: values.breakAfterHours,
    breakDurationMinutes: values.breakDurationMinutes,
    maxTripsPerDay: values.maxTripsPerDay,
    minimumRestHours: values.minimumRestHours,
  }

  if (scopeType === 'state' && values.stateId) payload.stateId = values.stateId
  if (scopeType === 'city' && values.cityId) payload.cityId = values.cityId
  if (scopeType === 'zone' && values.zoneId) payload.zoneId = values.zoneId
  if (scopeType === 'airport' && values.airportId) payload.airportId = values.airportId

  return payload
}

export function formatDutyPolicyScopeLabel(item: DutyPolicyItem): string {
  switch (item.scopeType) {
    case 'global':
      return 'Global'
    case 'state':
      return resolveLocationName(item.stateId)
    case 'city':
      return resolveLocationName(item.cityId)
    case 'zone':
      return resolveLocationName(item.zoneId)
    case 'airport':
      return resolveLocationName(item.airportId)
    default:
      return '—'
  }
}
