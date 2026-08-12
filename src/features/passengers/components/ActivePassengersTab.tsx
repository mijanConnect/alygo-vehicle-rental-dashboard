import { useCallback, useState } from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
import { createTableRowProps } from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { PassengerTableActions } from '@/features/passengers/components/PassengerTableActions'
import { mapLivePassengerItem } from '@/features/passengers/mapPassengerManagement'
import { useGetAllLiveActivityPassengersQuery } from '@/redux/api/passengersApi'
import type { Passenger } from '@/types'

interface ActivePassengersTabProps {
  onOpenDetails: (passengerId: string) => void
  onSuspend: (passenger: Passenger) => void
}

export function ActivePassengersTab({ onOpenDetails, onSuspend }: ActivePassengersTabProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetAllLiveActivityPassengersQuery({
    page,
    limit,
    searchTerm,
  })

  const rows = (data?.data ?? []).map(mapLivePassengerItem)
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.totalItems ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const openDetails = (record: Passenger) => {
    onOpenDetails(record.id)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">
        Real-time passenger activity monitor — online status, account health, and recent
        engagement.
      </p>
      <SearchingInput
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search live passengers..."
      />
      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        locale={{ emptyText: 'No live passengers right now' }}
        {...createTableRowProps<Passenger>(openDetails)}
        columns={[
          {
            title: 'Passenger',
            dataIndex: 'name',
            render: (name: string, record: Passenger) => (
              <Link to={`/passengers/${record.id}`} onClick={(e) => e.stopPropagation()}>
                {name}
              </Link>
            ),
          },
          {
            title: 'ID',
            dataIndex: 'id',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => <StatusBadge status={s} />,
          },
          { title: 'Trips', dataIndex: 'completedTrips', width: 80 },
          {
            title: 'Rating',
            dataIndex: 'rating',
            width: 90,
            render: (r: number) => `${r} ★`,
          },
          { title: 'City', dataIndex: 'city', ellipsis: true },
          {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 180,
            render: (_: unknown, record: Passenger) => (
              <PassengerTableActions
                record={record}
                mode="default"
                onDetails={openDetails}
                onSuspend={onSuspend}
              />
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
        onItemsPerPageChange={(next) => {
          setLimit(next)
          setPage(1)
        }}
      />
    </div>
  )
}
