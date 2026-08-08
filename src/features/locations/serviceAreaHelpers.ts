import { Eye } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { useAdminActions } from '@/hooks/useAdminActions'
import type { ServiceAreaRow, ServiceAreaType } from '@/redux/api/areaServiceApi'
import { formatNumber } from '@/utils/format'

type AdminActions = ReturnType<typeof useAdminActions>

export const SERVICE_AREA_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  disabled: 'Disabled',
  pending_launch: 'Pending Launch',
  inactive: 'Inactive',
}

export const SERVICE_AREA_STATUS_COLORS: Record<string, string> = {
  active: 'success',
  disabled: 'default',
  pending_launch: 'processing',
  inactive: 'default',
}

export function getServiceAreaActionItems(): ActionMenuItem[] {
  return [{ key: 'view', label: 'View Details', icon: Eye }]
}

export function buildServiceAreaDetailFields(record: ServiceAreaRow): DetailField[] {
  const fields: DetailField[] = [
    { label: 'Name', value: record.name },
    { label: 'Type', value: record.type },
  ]

  if (record.countryName) {
    fields.push({ label: 'Country', value: record.countryName })
  }
  if (record.stateName) {
    fields.push({ label: 'State', value: record.stateName })
  }
  if (record.cityName) {
    fields.push({ label: 'City', value: record.cityName })
  }

  fields.push(
    {
      label: 'Status',
      value: SERVICE_AREA_STATUS_LABELS[record.status] ?? record.status,
    },
    { label: 'Max Drivers', value: formatNumber(record.maxDrivers) },
    { label: 'Coverage Radius', value: `${record.coverageRadiusKm} km` },
    { label: 'Timezone', value: record.timezone },
    { label: 'Longitude', value: String(record.lng) },
    { label: 'Latitude', value: String(record.lat) },
  )

  return fields
}

export function openServiceAreaDrawer(
  record: ServiceAreaRow,
  adminActions: AdminActions,
) {
  adminActions.openDrawer(record.name, buildServiceAreaDetailFields(record))
}

export function serviceAreaTypeLabel(type: ServiceAreaType): string {
  switch (type) {
    case 'country':
      return 'Country'
    case 'state':
      return 'State'
    case 'city':
      return 'City'
    case 'zone':
      return 'Zone'
    case 'airport':
      return 'Airport'
    case 'global':
      return 'Global'
    default:
      return type
  }
}
