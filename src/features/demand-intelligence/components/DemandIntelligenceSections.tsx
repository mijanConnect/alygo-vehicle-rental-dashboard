import { useMemo } from 'react'
import { Table, Tag } from 'antd'
import { StatusBadge } from '@/components/common/StatusBadge'
import {
  computeAverageEta,
  DEMAND_ZONE_STATUS_COLORS,
  DEMAND_ZONE_STATUS_LABELS,
  formatAverageEta,
} from '@/features/demand-intelligence/demandIntelligenceData'
import {
  useGetDemandZonesQuery,
  useGetOperationalEventsQuery,
  useGetReservationsQuery,
  useGetSurgeZonesQuery,
} from '@/services/api'
import type { OperationalEvent, Reservation } from '@/types'
import { formatDateTime } from '@/utils/format'

function countRelatedReservations(event: OperationalEvent, reservations: Reservation[]): number {
  return reservations.filter(
    (r) =>
      r.type === 'event' &&
      (r.eventName === event.eventName ||
        r.venue === event.location ||
        r.pickup.includes(event.location) ||
        r.dropoff.includes(event.location)),
  ).length
}

export function DemandKpiOverview() {
  const { data: zones = [] } = useGetDemandZonesQuery()
  const { data: surgeZones = [] } = useGetSurgeZonesQuery()
  const { data: events = [] } = useGetOperationalEventsQuery()

  const metrics = useMemo(() => {
    const activeRequests = zones.reduce((sum, z) => sum + z.activeRequests, 0)
    const availableDrivers = zones.reduce((sum, z) => sum + z.availableDrivers, 0)
    const highDemandZones = zones.filter((z) => z.status === 'high_demand').length
    const activeSurgeCount = surgeZones.filter((z) => z.active).length
    const upcomingEvents = events.filter((e) => e.status === 'upcoming').length

    return [
      { label: 'Active Requests', value: activeRequests.toLocaleString() },
      { label: 'Available Drivers', value: availableDrivers.toLocaleString() },
      { label: 'High Demand Zones', value: highDemandZones.toLocaleString() },
      { label: 'Active Surge Zones', value: activeSurgeCount.toLocaleString() },
      { label: 'Upcoming Events', value: upcomingEvents.toLocaleString() },
      { label: 'Average ETA', value: computeAverageEta(zones) },
    ]
  }, [zones, surgeZones, events])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">{m.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
        </div>
      ))}
    </div>
  )
}

export function DemandZonesTable() {
  const { data: zones = [], isLoading } = useGetDemandZonesQuery()

  return (
    <div className="glass-card p-5">
      <h3 className="mb-1 text-base font-semibold text-white">Demand Zones</h3>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Zone-level request volume, driver supply, and wait times for dispatch decisions.
      </p>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={zones}
        pagination={false}
        scroll={{ x: 900 }}
        columns={[
          { title: 'Zone', dataIndex: 'zone' },
          {
            title: 'Active Requests',
            dataIndex: 'activeRequests',
            render: (n: number) => n.toLocaleString(),
          },
          {
            title: 'Available Drivers',
            dataIndex: 'availableDrivers',
            render: (n: number) => n.toLocaleString(),
          },
          {
            title: 'Demand Ratio',
            dataIndex: 'demandRatio',
            render: (r: number) => (
              <Tag color={r >= 3 ? 'red' : r >= 2 ? 'orange' : 'default'}>{r.toFixed(2)}:1</Tag>
            ),
          },
          {
            title: 'Average ETA',
            dataIndex: 'averageEtaMinutes',
            render: (m: number) => formatAverageEta(m),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (status: keyof typeof DEMAND_ZONE_STATUS_LABELS) => (
              <Tag color={DEMAND_ZONE_STATUS_COLORS[status]}>
                {DEMAND_ZONE_STATUS_LABELS[status]}
              </Tag>
            ),
          },
        ]}
      />
    </div>
  )
}

export function UpcomingEventsTable() {
  const { data: events = [], isLoading } = useGetOperationalEventsQuery()
  const { data: reservations = [] } = useGetReservationsQuery()

  const dataSource = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        relatedReservations: countRelatedReservations(event, reservations),
      })),
    [events, reservations],
  )

  return (
    <div className="glass-card p-5">
      <h3 className="mb-1 text-base font-semibold text-white">Upcoming Events</h3>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Scheduled events with linked reservation volume — no demand predictions.
      </p>
      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={dataSource}
        pagination={false}
        scroll={{ x: 800 }}
        columns={[
          { title: 'Event Name', dataIndex: 'eventName' },
          { title: 'Location', dataIndex: 'location' },
          {
            title: 'Date',
            dataIndex: 'date',
            render: (d: string) => formatDateTime(d),
          },
          {
            title: 'Related Reservations',
            dataIndex: 'relatedReservations',
            render: (n: number) => n.toLocaleString(),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
        ]}
      />
    </div>
  )
}
