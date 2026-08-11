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
  maxDrivingHoursPerDay?: number | null
  maxContinuousDrivingHours?: number | null
  breakAfterHours?: number | null
  breakDurationMinutes?: number | null
  maxTripsPerDay?: number | null
  minimumRestHours?: number | null
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
  _scopeType: DutyPolicyScopeType,
): DutyPolicyFormValues {
  return {
    name: '',
    maxDrivingHoursPerDay: null,
    maxContinuousDrivingHours: null,
    breakAfterHours: null,
    breakDurationMinutes: null,
    maxTripsPerDay: null,
    minimumRestHours: null,
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
    maxDrivingHoursPerDay: Number(values.maxDrivingHoursPerDay ?? 0),
    maxContinuousDrivingHours: Number(values.maxContinuousDrivingHours ?? 0),
    breakAfterHours: Number(values.breakAfterHours ?? 0),
    breakDurationMinutes: Number(values.breakDurationMinutes ?? 0),
    maxTripsPerDay: Number(values.maxTripsPerDay ?? 0),
    minimumRestHours: Number(values.minimumRestHours ?? 0),
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
