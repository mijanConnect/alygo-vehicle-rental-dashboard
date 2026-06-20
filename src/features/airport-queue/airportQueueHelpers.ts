import { Eye, Pencil, PowerOff } from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { AirportRecord } from '@/types/airportQueue'
import { AIRPORT_STATUS_LABELS } from '@/services/airportQueueApi'
import { formatNumber } from '@/utils/format'

export function getAirportActionItems(record: AirportRecord): ActionMenuItem[] {
  const items: ActionMenuItem[] = [
    { key: 'view', label: 'View', icon: Eye },
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
  ]
  if (record.status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, danger: true, group: 2 })
  }
  return items
}

export function buildAirportDetailFields(record: AirportRecord): DetailField[] {
  return [
    { label: 'Airport', value: `${record.name} (${record.code})` },
    { label: 'State', value: record.state },
    { label: 'Queue Size', value: formatNumber(record.queueSize) },
    { label: 'Status', value: AIRPORT_STATUS_LABELS[record.status] },
    { label: 'Average Wait', value: `${record.averageWaitMinutes} min` },
    { label: 'Completed Trips Today', value: formatNumber(record.completedTripsToday) },
  ]
}
