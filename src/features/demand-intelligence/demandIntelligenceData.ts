import type { DemandZoneStatus } from '@/types'

export const MAP_LAYER_OPTIONS = ['Drivers', 'Reservations', 'Airports', 'Surge Zones'] as const
export type MapLayer = (typeof MAP_LAYER_OPTIONS)[number]

export const DEMAND_ZONE_STATUS_LABELS: Record<DemandZoneStatus, string> = {
  normal: 'Normal',
  medium_demand: 'Medium Demand',
  high_demand: 'High Demand',
}

export const DEMAND_ZONE_STATUS_COLORS: Record<DemandZoneStatus, string> = {
  normal: 'default',
  medium_demand: 'orange',
  high_demand: 'red',
}

export function formatAverageEta(minutes: number): string {
  return `${minutes.toFixed(1)} min`
}

export function computeAverageEta(zones: { averageEtaMinutes: number }[]): string {
  if (zones.length === 0) return '—'
  const avg = zones.reduce((sum, z) => sum + z.averageEtaMinutes, 0) / zones.length
  return formatAverageEta(avg)
}
