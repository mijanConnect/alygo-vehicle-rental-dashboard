import { Eye, Pencil, Power, PowerOff } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { StateActivationRecord } from '@/types/stateActivation'
import { STATUS_LABELS } from '@/services/stateActivationApi'
import { formatNumber } from '@/utils/format'

function boolLabel(value: boolean) {
  return value ? 'Enabled' : 'Disabled'
}

export function getStateActivationActionItems(record: StateActivationRecord): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
  ]
  if (record.status !== 'active') {
    items.push({ key: 'enable', label: 'Enable', icon: Power, group: 2 })
  }
  if (record.status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, danger: true, group: 2 })
  }
  return items
}

export function buildStateDetailFields(record: StateActivationRecord): DetailField[] {
  return [
    { label: 'State', value: `${record.stateName} (${record.stateCode})` },
    { label: 'Status', value: STATUS_LABELS[record.status] ?? record.status },
    { label: 'Active Drivers', value: formatNumber(record.activeDrivers) },
    { label: 'Active Passengers', value: formatNumber(record.activePassengers) },
    { label: 'Cities', value: record.citiesCount },
    { label: 'Regions', value: record.regionsCount },
    { label: 'Platform Active', value: boolLabel(record.platformActive) },
    { label: 'Driver Registration', value: boolLabel(record.driverRegistrationEnabled) },
    { label: 'Passenger Registration', value: boolLabel(record.passengerRegistrationEnabled) },
    { label: 'Reservations', value: boolLabel(record.reservationsEnabled) },
    { label: 'Airport Queue', value: boolLabel(record.airportQueueEnabled) },
    { label: 'Dynamic Pricing', value: boolLabel(record.dynamicPricingEnabled) },
    { label: 'Black Category', value: boolLabel(record.blackCategoryEnabled) },
    { label: 'Black SUV Category', value: boolLabel(record.blackSuvCategoryEnabled) },
    { label: 'Last Updated', value: new Date(record.lastUpdated).toLocaleString() },
    { label: 'Updated By', value: record.updatedBy },
  ]
}

export function statusTagColor(status: string) {
  if (status === 'active') return 'success'
  if (status === 'pending_launch') return 'processing'
  return 'default'
}
