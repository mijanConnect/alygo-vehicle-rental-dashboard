import { Drawer, Tabs, Descriptions, Form, Select, Button, Timeline } from 'antd'
import { UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import {
  reservationActivityLog,
  RESERVATION_TYPE_LABELS,
  reservationTimeline,
} from '@/features/reservations/reservationData'
import { useAdminActions } from '@/hooks/useAdminActions'
import type { Reservation } from '@/types'
import { formatCurrency, formatDateTime } from '@/utils/format'

interface ReservationDetailsDrawerProps {
  reservation: Reservation | null
  open: boolean
  onClose: () => void
}

export function ReservationDetailsDrawer({ reservation, open, onClose }: ReservationDetailsDrawerProps) {
  const adminActions = useAdminActions()
  const [assignDriver, setAssignDriver] = useState('')

  const timeline = useMemo(
    () => (reservation ? reservationTimeline(reservation) : []),
    [reservation],
  )
  const activity = useMemo(
    () => (reservation ? reservationActivityLog(reservation) : []),
    [reservation],
  )

  if (!reservation) return null

  const estimatedFare = 42 + reservation.id.charCodeAt(3)

  return (
    <Drawer
      title={`Reservation ${reservation.id}`}
      open={open}
      onClose={onClose}
      width={640}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: 'details',
            label: 'Reservation Details',
            children: (
              <Descriptions column={1} size="small" className="mt-2">
                <Descriptions.Item label="Reservation ID">{reservation.id}</Descriptions.Item>
                <Descriptions.Item label="Type">{RESERVATION_TYPE_LABELS[reservation.type]}</Descriptions.Item>
                <Descriptions.Item label="Pickup">{reservation.pickup}</Descriptions.Item>
                <Descriptions.Item label="Dropoff">{reservation.dropoff}</Descriptions.Item>
                <Descriptions.Item label="Scheduled Time">{formatDateTime(reservation.scheduledAt)}</Descriptions.Item>
                <Descriptions.Item label="Category">{RIDE_CATEGORY_LABELS[reservation.category]}</Descriptions.Item>
                <Descriptions.Item label="Status">{reservation.status}</Descriptions.Item>
                <Descriptions.Item label="Created">{formatDateTime(reservation.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="City">{reservation.city ?? '—'}</Descriptions.Item>
                {reservation.type === 'airport' && (
                  <>
                    <Descriptions.Item label="Airport">{reservation.airportCode}</Descriptions.Item>
                    <Descriptions.Item label="Flight">{reservation.flightNumber}</Descriptions.Item>
                    <Descriptions.Item label="Terminal">{reservation.terminal}</Descriptions.Item>
                  </>
                )}
                {reservation.type === 'event' && (
                  <>
                    <Descriptions.Item label="Event">{reservation.eventName}</Descriptions.Item>
                    <Descriptions.Item label="Venue">{reservation.venue}</Descriptions.Item>
                    <Descriptions.Item label="Event Time">
                      {reservation.eventTime ? formatDateTime(reservation.eventTime) : '—'}
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            ),
          },
          {
            key: 'passenger',
            label: 'Passenger',
            children: (
              <Descriptions column={1} size="small" className="mt-2">
                <Descriptions.Item label="Name">{reservation.passengerName}</Descriptions.Item>
                <Descriptions.Item label="Contact">+1 (555) 010-{reservation.id.slice(-4)}</Descriptions.Item>
                <Descriptions.Item label="Rating">4.8</Descriptions.Item>
                <Descriptions.Item label="Total Trips">127</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'driver',
            label: 'Driver Assignment',
            children: (
              <div className="mt-2 space-y-4">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Assigned Driver">
                    {reservation.driverName ?? 'Unassigned'}
                  </Descriptions.Item>
                </Descriptions>
                <Form layout="vertical">
                  <Form.Item label="Assign Driver">
                    <Select
                      placeholder="Select driver"
                      value={assignDriver || undefined}
                      onChange={setAssignDriver}
                      options={[
                        { value: 'Marcus Johnson', label: 'Marcus Johnson' },
                        { value: 'Sarah Chen', label: 'Sarah Chen' },
                        { value: 'David Kim', label: 'David Kim' },
                      ]}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    icon={<UserPlus className="h-4 w-4" />}
                    disabled={!assignDriver}
                    onClick={() => {
                      adminActions.notify(`Driver ${assignDriver} assigned to ${reservation.id}`)
                      setAssignDriver('')
                    }}
                  >
                    {reservation.driverName ? 'Reassign Driver' : 'Assign Driver'}
                  </Button>
                </Form>
              </div>
            ),
          },
          {
            key: 'pricing',
            label: 'Pricing',
            children: (
              <Descriptions column={1} size="small" className="mt-2">
                <Descriptions.Item label="Estimated Fare">{formatCurrency(estimatedFare)}</Descriptions.Item>
                <Descriptions.Item label="Platform Fee">{formatCurrency(estimatedFare * 0.2)}</Descriptions.Item>
                <Descriptions.Item label="Driver Earnings">{formatCurrency(estimatedFare * 0.8)}</Descriptions.Item>
                <Descriptions.Item label="Surge Multiplier">1.0x</Descriptions.Item>
                <Descriptions.Item label="Payment Status">Authorized</Descriptions.Item>
              </Descriptions>
            ),
          },
          {
            key: 'timeline',
            label: 'Timeline',
            children: (
              <Timeline
                className="mt-4"
                items={timeline.map((e) => ({
                  children: (
                    <div>
                      <p className="font-medium text-white">{e.label}</p>
                      <p className="text-xs text-alygo-text-muted">{formatDateTime(e.time)}</p>
                    </div>
                  ),
                }))}
              />
            ),
          },
          {
            key: 'activity',
            label: 'Activity Log',
            children: (
              <div className="mt-2 space-y-3">
                {activity.map((entry, i) => (
                  <div key={i} className="rounded-lg border border-white/5 p-3">
                    <p className="text-sm font-medium text-white">{entry.action}</p>
                    <p className="text-xs text-alygo-text-muted">
                      {entry.actor} · {formatDateTime(entry.at)}
                    </p>
                    <p className="mt-1 text-sm text-alygo-text-muted">{entry.detail}</p>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  )
}
