import { useCallback, useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { useNavigate } from 'react-router-dom'
import { createTableRowProps } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetLiveTripsQuery,
  type LiveTrip,
} from '@/redux/api/liveTripApi'
import { formatCurrency, formatDateTime } from '@/utils/format'

export default function LiveTripsPage() {
  useDocumentTitle('Live Trips')
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetLiveTripsQuery({
    page,
    limit,
    searchTerm,
  })

  const trips = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.totalItems ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleItemsPerPageChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  const goToTripDetails = (tripId: string) => {
    navigate(`/operations/live-trips/${tripId}`)
  }

  return (
    <PageShell
      title="Live Trips"
      description="Real-time view of active and recent trips. Open a trip to monitor route progress, timeline, and safety events."
    >
      <div className="glass-card p-4">
        <div className="mb-4">
          <SearchingInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by trip, driver, passenger..."
          />
        </div>

        <Table
          loading={isLoading || isFetching}
          rowKey="_id"
          dataSource={trips}
          pagination={false}
          scroll={{ x: 1200 }}
          {...createTableRowProps<LiveTrip>((record) => goToTripDetails(record._id))}
          columns={[
            {
              title: 'Trip ID',
              dataIndex: '_id',
              render: (id: string) => (
                <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
              ),
            },
            {
              title: 'Driver',
              key: 'driver',
              render: (_: unknown, record: LiveTrip) =>
                record.driver?.name?.trim() || 'Unassigned',
            },
            {
              title: 'Passenger',
              key: 'passenger',
              render: (_: unknown, record: LiveTrip) =>
                record.passenger?.name?.trim() || '—',
            },
            {
              title: 'Category',
              dataIndex: 'category',
              render: (category: string) => <Tag>{category || '—'}</Tag>,
            },
            { title: 'Pickup', dataIndex: 'pickup', ellipsis: true },
            { title: 'Dropoff', dataIndex: 'dropoff', ellipsis: true },
            {
              title: 'City',
              dataIndex: 'city',
              render: (city: string) => city?.trim() || '—',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (status: string) => <StatusBadge status={status} />,
            },
            {
              title: 'Fare',
              dataIndex: 'fare',
              render: (fare: number) => formatCurrency(fare),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              render: (createdAt: string) => formatDateTime(createdAt),
            },
            {
              title: 'Action',
              key: 'action',
              fixed: 'right',
              width: 110,
              render: (_: unknown, record: LiveTrip) => (
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToTripDetails(record._id)
                  }}
                >
                  Details
                </Button>
              ),
            },
          ]}
        />

        <Pagination
          currentPage={page}
          totalPages={Math.max(totalPages, 1)}
          totalItems={totalItems}
          itemsPerPage={limit}
          onPageChange={setPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>
    </PageShell>
  )
}
