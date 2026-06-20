import { Table, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  getTripActionItems,
  handleTripAction,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useGetTripsQuery } from '@/services/api'
import { formatCurrency } from '@/utils/format'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { Trip } from '@/types'

export default function LiveTripsPage() {
  useDocumentTitle('Live Trips')
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const { data: trips = [], isLoading } = useGetTripsQuery()

  const goToTripDetails = (tripId: string) => {
    navigate(`/operations/live-trips/${tripId}`)
  }

  return (
    <PageShell
      title="Live Trips"
      description="Real-time view of active and recent trips. Open a trip to monitor route progress, timeline, and safety events."
    >
      <div className="glass-card p-4">
        <Table
          loading={isLoading}
          rowKey="id"
          dataSource={trips}
          scroll={{ x: 1200 }}
          {...createTableRowProps<Trip>((record) => goToTripDetails(record.id))}
          columns={[
            { title: 'Trip ID', dataIndex: 'id' },
            { title: 'Driver', dataIndex: 'driverName' },
            { title: 'Passenger', dataIndex: 'passengerName' },
            {
              title: 'Category',
              dataIndex: 'category',
              render: (c: keyof typeof RIDE_CATEGORY_LABELS) => <Tag>{RIDE_CATEGORY_LABELS[c]}</Tag>,
            },
            { title: 'Pickup', dataIndex: 'pickup', ellipsis: true },
            { title: 'Dropoff', dataIndex: 'dropoff', ellipsis: true },
            { title: 'City', dataIndex: 'city' },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
            { title: 'Fare', dataIndex: 'fare', render: (f: number) => formatCurrency(f) },
            createActionsColumn<Trip>(
              () => getTripActionItems(),
              (key, record) =>
                handleTripAction(key, record, adminActions, { onNavigate: navigate }),
            ),
          ]}
        />
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
