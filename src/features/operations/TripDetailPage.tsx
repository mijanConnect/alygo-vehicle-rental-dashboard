import { Button, Descriptions, Empty, Table, Tag, Timeline } from 'antd'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TripLiveMap } from '@/features/operations/components/TripLiveMap'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetTripByIdQuery } from '@/services/api'
import { formatCurrency, formatDateTime } from '@/utils/format'

export default function TripDetailPage() {
  const { id = '' } = useParams()
  const adminActions = useAdminActions()
  const { data: trip, isLoading } = useGetTripByIdQuery(id, { skip: !id })

  useDocumentTitle(trip ? `Trip ${trip.id}` : 'Trip Details')

  if (isLoading) return null

  if (!trip) {
    return (
      <PageShell title="Trip Not Found">
        <Link to="/operations/live-trips">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Live Trips</Button>
        </Link>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={`Trip ${trip.id}`}
      description={`${trip.driverName} → ${trip.passengerName} · ${trip.city}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/operations/live-trips">
            <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Live Trips</Button>
          </Link>
        </div>
      }
    >
      <TripLiveMap data={trip.liveMap} />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Trip Information">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Trip ID">{trip.id}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <StatusBadge status={trip.status} />
            </Descriptions.Item>
            <Descriptions.Item label="Ride Category">
              <Tag>{RIDE_CATEGORY_LABELS[trip.category]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="City">{trip.city}</Descriptions.Item>
            <Descriptions.Item label="Distance">{trip.distanceMiles} mi</Descriptions.Item>
            <Descriptions.Item label="Duration">{trip.durationMinutes} min</Descriptions.Item>
            <Descriptions.Item label="Started">{formatDateTime(trip.startedAt)}</Descriptions.Item>
          </Descriptions>
        </SectionCard>

        <SectionCard title="Fare Details">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Base Fare">{formatCurrency(trip.fareBreakdown.baseFare)}</Descriptions.Item>
            <Descriptions.Item label="Distance">{formatCurrency(trip.fareBreakdown.distanceFee)}</Descriptions.Item>
            <Descriptions.Item label="Time">{formatCurrency(trip.fareBreakdown.timeFee)}</Descriptions.Item>
            <Descriptions.Item label="Surge">{formatCurrency(trip.fareBreakdown.surgeFee)}</Descriptions.Item>
            <Descriptions.Item label="Platform Fee">{formatCurrency(trip.fareBreakdown.platformFee)}</Descriptions.Item>
            <Descriptions.Item label="Total">{formatCurrency(trip.fareBreakdown.total)}</Descriptions.Item>
            <Descriptions.Item label="Payment">{trip.fareBreakdown.paymentMethod}</Descriptions.Item>
          </Descriptions>
        </SectionCard>

        <SectionCard title="Driver Information">
          {trip.driver ? (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{trip.driver.name}</Descriptions.Item>
              <Descriptions.Item label="Driver ID">{trip.driver.id}</Descriptions.Item>
              <Descriptions.Item label="Phone">{trip.driver.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{trip.driver.email}</Descriptions.Item>
              <Descriptions.Item label="Vehicle">{trip.driver.vehicle}</Descriptions.Item>
              <Descriptions.Item label="Rating">{trip.driver.rating} ★</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={trip.driver.status} />
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="Driver record unavailable" />
          )}
        </SectionCard>

        <SectionCard title="Passenger Information">
          {trip.passenger ? (
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{trip.passenger.name}</Descriptions.Item>
              <Descriptions.Item label="Passenger ID">{trip.passenger.id}</Descriptions.Item>
              <Descriptions.Item label="Phone">{trip.passenger.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{trip.passenger.email}</Descriptions.Item>
              <Descriptions.Item label="Rating">{trip.passenger.rating} ★</Descriptions.Item>
              <Descriptions.Item label="Wallet">{formatCurrency(trip.passenger.walletBalance)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusBadge status={trip.passenger.status} />
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Empty description="Passenger record unavailable" />
          )}
        </SectionCard>

        <SectionCard title="Pickup Location">
          <p className="text-sm text-white">{trip.pickup}</p>
        </SectionCard>

        <SectionCard title="Dropoff Location">
          <p className="text-sm text-white">{trip.dropoff}</p>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Status Timeline">
          <Timeline
            items={trip.timeline.map((event) => ({
              color:
                event.status === 'completed'
                  ? 'green'
                  : event.status === 'current'
                    ? 'blue'
                    : 'gray',
              children: (
                <div>
                  <p className="text-sm font-medium text-white">{event.label}</p>
                  <p className="text-xs text-alygo-text-muted">{formatDateTime(event.timestamp)}</p>
                </div>
              ),
            }))}
          />
        </SectionCard>

        <SectionCard title="Cancellation History">
          {trip.cancellationHistory.length > 0 ? (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={trip.cancellationHistory}
              columns={[
                { title: 'Actor', dataIndex: 'actor', render: (v: string) => v.replace('_', ' ') },
                { title: 'Reason', dataIndex: 'reason' },
                {
                  title: 'Fee',
                  dataIndex: 'feeApplied',
                  render: (fee?: number) => (fee != null ? formatCurrency(fee) : '—'),
                },
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
          {trip.safetyEvents.length > 0 ? (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={trip.safetyEvents}
              columns={[
                {
                  title: 'Type',
                  dataIndex: 'type',
                  render: (type: string) => <Tag>{type.toUpperCase()}</Tag>,
                },
                { title: 'Description', dataIndex: 'description', ellipsis: true },
                { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
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
