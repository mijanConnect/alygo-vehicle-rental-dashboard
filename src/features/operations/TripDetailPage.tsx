import { Button, Descriptions, Empty, Spin, Table, Tag, Timeline } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TripLiveMap } from '@/features/operations/components/TripLiveMap'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetSingleLiveTripQuery,
  type LiveTripDetail,
} from '@/redux/api/liveTripApi'
import type { TripLiveMapData } from '@/types/tripOperations'
import { formatCurrency, formatDateTime } from '@/utils/format'

function formatCoordLocation(
  point?: { latitude?: number; longitude?: number } | null,
): string {
  if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
    return 'Unavailable'
  }
  return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`
}

function toPoint(
  point?: { latitude?: number; longitude?: number; address?: string } | null,
) {
  if (!point || typeof point.latitude !== 'number' || typeof point.longitude !== 'number') {
    return null
  }
  return {
    lat: point.latitude,
    lng: point.longitude,
    label: point.address,
  }
}

function toLiveMapData(detail: LiveTripDetail): TripLiveMapData {
  const map = detail.mapInformation
  const tracking = detail.liveTracking
  const driverPoint =
    toPoint(map?.driverLocation) ?? toPoint(tracking?.currentDriverLocation)
  const hasDriver = Boolean(driverPoint)

  return {
    driverLocation: formatCoordLocation(
      map?.driverLocation ?? tracking?.currentDriverLocation,
    ),
    pickupLabel: detail.pickup?.address || map?.pickup?.address || '—',
    dropoffLabel: detail.dropoff?.address || map?.dropoff?.address || '—',
    routeSummary: `${detail.pickup?.address || 'Pickup'} → ${detail.dropoff?.address || 'Dropoff'}`,
    etaMinutes: map?.ETA ?? tracking?.ETA ?? 0,
    routeProgressPercent: map?.routeProgress ?? tracking?.routeProgressPercentage ?? 0,
    isLive: hasDriver && !detail.cancellation?.cancelled,
    pickup: toPoint(detail.pickup) ?? toPoint(map?.pickup),
    dropoff: toPoint(detail.dropoff) ?? toPoint(map?.dropoff),
    driver: driverPoint,
    stops: (detail.stops ?? []).map((stop) => ({
      lat: stop.latitude,
      lng: stop.longitude,
      label: stop.address,
    })),
    polyline: map?.polyline || tracking?.routePolyline || undefined,
  }
}

export default function TripDetailPage() {
  const { id = '' } = useParams()
  const adminActions = useAdminActions()
  const { data: trip, isLoading, isError } = useGetSingleLiveTripQuery(id, {
    skip: !id,
  })

  const ride = trip?.ride
  const titleId = ride?.bookingReference || ride?.rideId || id

  useDocumentTitle(ride ? `Trip ${titleId}` : 'Trip Details')

  if (isLoading) {
    return (
      <PageShell title="Trip Details">
        <div className="flex justify-center py-16">
          <Spin size="large" />
        </div>
      </PageShell>
    )
  }

  if (isError || !trip || !ride) {
    return (
      <PageShell title="Trip Not Found">
        <Link to="/operations/live-trips">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Live Trips</Button>
        </Link>
      </PageShell>
    )
  }

  const cancellationRows =
    trip.cancellation?.cancelled
      ? [
          {
            id: 'cancellation-1',
            actor: trip.cancellation.cancelledBy || 'system',
            reason: trip.cancellation.reason || '—',
            description: trip.cancellation.description,
            timestamp: trip.cancellation.cancelledAt,
          },
        ]
      : []

  const safetyRows = (trip.safetyEvents ?? []).map((event, index) => ({
    id: event.id ?? `safety-${index}`,
    type: event.type ?? 'alert',
    description: event.description ?? '—',
    status: event.status ?? 'open',
    timestamp: event.timestamp ?? ride.createdAt,
  }))

  return (
    <PageShell
      title={`Trip ${titleId}`}
      description={`${trip.driver?.fullName?.trim() || 'Unassigned'} → ${trip.passenger?.fullName?.trim() || '—'} · ${ride.city?.trim() || '—'}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/operations/live-trips">
            <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Live Trips</Button>
          </Link>
        </div>
      }
    >
      <TripLiveMap data={toLiveMapData(trip)} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Trip Information">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Trip ID">{ride.rideId}</Descriptions.Item>
            <Descriptions.Item label="Booking Ref">{ride.bookingReference}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <StatusBadge status={ride.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Ride Category">
              <Tag>{ride.rideCategory || '—'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="City">{ride.city?.trim() || '—'}</Descriptions.Item>
            <Descriptions.Item label="Distance">
              {ride.estimatedDistance != null ? `${ride.estimatedDistance} km` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Duration">
              {ride.estimatedDuration != null ? `${ride.estimatedDuration} min` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {ride.createdAt ? formatDateTime(ride.createdAt) : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Started">
              {ride.startedAt ? formatDateTime(ride.startedAt) : '—'}
            </Descriptions.Item>
          </Descriptions>
        </SectionCard>

        <SectionCard title="Fare Details">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Base Fare">
              {formatCurrency(trip.fareSummary.baseFare)}
            </Descriptions.Item>
            <Descriptions.Item label="Distance">
              {formatCurrency(trip.fareSummary.distanceFare)}
            </Descriptions.Item>
            <Descriptions.Item label="Time">
              {formatCurrency(trip.fareSummary.durationFare)}
            </Descriptions.Item>
            <Descriptions.Item label="Surge">
              {formatCurrency(trip.fareSummary.surgeFare)}
            </Descriptions.Item>
            <Descriptions.Item label="Waiting">
              {formatCurrency(trip.fareSummary.waitingCharge)}
            </Descriptions.Item>
            <Descriptions.Item label="Toll">
              {formatCurrency(trip.fareSummary.tollCharge)}
            </Descriptions.Item>
            <Descriptions.Item label="Platform Fee">
              {formatCurrency(trip.fareSummary.platformFee)}
            </Descriptions.Item>
            <Descriptions.Item label="Discount">
              {formatCurrency(trip.fareSummary.discount)}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              {formatCurrency(trip.fareSummary.totalFare)}
            </Descriptions.Item>
            <Descriptions.Item label="Payment">
              {trip.fareSummary.paymentMethod || trip.fareSummary.paymentStatus || '—'}
            </Descriptions.Item>
          </Descriptions>
        </SectionCard>

        <SectionCard title="Driver Information">
          {trip.driver ? (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{trip.driver.fullName}</Descriptions.Item>
              <Descriptions.Item label="Driver ID">{trip.driver.id}</Descriptions.Item>
              <Descriptions.Item label="Phone">{trip.driver.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{trip.driver.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Vehicle">{trip.driver.vehicle || '—'}</Descriptions.Item>
              <Descriptions.Item label="Rating">
                {trip.driver.overallRating != null ? `${trip.driver.overallRating} ★` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={trip.driver.driverStatus || 'unknown'} />
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="Driver not assigned" />
          )}
        </SectionCard>

        <SectionCard title="Passenger Information">
          {trip.passenger ? (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{trip.passenger.fullName}</Descriptions.Item>
              <Descriptions.Item label="Passenger ID">{trip.passenger.id}</Descriptions.Item>
              <Descriptions.Item label="Phone">{trip.passenger.phone || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email">{trip.passenger.email || '—'}</Descriptions.Item>
              <Descriptions.Item label="Rating">
                {trip.passenger.overallRating != null
                  ? `${trip.passenger.overallRating} ★`
                  : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={trip.passenger.passengerStatus || 'unknown'} />
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="Passenger record unavailable" />
          )}
        </SectionCard>

        <SectionCard title="Pickup Location">
          <p className="text-sm text-white">{trip.pickup?.address || '—'}</p>
        </SectionCard>

        <SectionCard title="Dropoff Location">
          <p className="text-sm text-white">{trip.dropoff?.address || '—'}</p>
        </SectionCard>
      </div>

      {trip.stops?.length ? (
        <div className="mt-4">
          <SectionCard title="Stops">
            <Table
              size="small"
              pagination={false}
              rowKey={(row) => `${row.sequence}-${row.address}`}
              dataSource={[...trip.stops].sort((a, b) => a.sequence - b.sequence)}
              columns={[
                { title: '#', dataIndex: 'sequence', width: 60 },
                { title: 'Address', dataIndex: 'address' },
                {
                  title: 'Coordinates',
                  render: (_: unknown, row: { latitude: number; longitude: number }) =>
                    `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`,
                },
              ]}
            />
          </SectionCard>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Status Timeline">
          {trip.timeline?.length ? (
            <Timeline
              items={trip.timeline.map((event) => ({
                color:
                  event.status === 'completed'
                    ? 'green'
                    : event.status === 'cancelled'
                      ? 'red'
                      : 'blue',
                children: (
                  <div>
                    <p className="text-sm font-medium text-white">{event.title}</p>
                    <p className="text-xs text-alygo-text-muted">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                ),
              }))}
            />
          ) : (
            <Empty description="No timeline events" />
          )}
        </SectionCard>

        <SectionCard title="Cancellation History">
          {cancellationRows.length > 0 ? (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={cancellationRows}
              columns={[
                {
                  title: 'Actor',
                  dataIndex: 'actor',
                  render: (v: string) => v.replaceAll('_', ' '),
                },
                { title: 'Reason', dataIndex: 'reason' },
                {
                  title: 'Time',
                  dataIndex: 'timestamp',
                  render: (value: string) => formatDateTime(value),
                },
              ]}
            />
          ) : (
            <Empty description="No cancellation events for this trip" />
          )}
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Safety Events / SOS Logs">
          {safetyRows.length > 0 ? (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={safetyRows}
              columns={[
                {
                  title: 'Type',
                  dataIndex: 'type',
                  render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
                },
                { title: 'Description', dataIndex: 'description', ellipsis: true },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (s: string) => <StatusBadge status={s} />,
                },
                {
                  title: 'Time',
                  dataIndex: 'timestamp',
                  render: (value: string) => formatDateTime(value),
                },
              ]}
            />
          ) : (
            <Empty description="No safety events or SOS logs for this trip" />
          )}
        </SectionCard>
      </div>

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}
