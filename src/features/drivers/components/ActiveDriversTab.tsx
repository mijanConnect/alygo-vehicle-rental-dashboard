import { useCallback, useState } from 'react'
import { Table, Tag } from 'antd'
import { Link } from 'react-router-dom'
import {
  createActionsColumn,
  createTableRowProps,
  getActiveDriverActionItems,
  handleDriverAction,
  openDriverDetails,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { mapOnlineDriver, type DriverTableRow } from '@/features/drivers/mapDriverManagement'
import type { useAdminActions } from '@/hooks/useAdminActions'
import { useGetAllOnlineDriversQuery } from '@/redux/api/driverManagementApi'

interface ActiveDriversTabProps {
  adminActions: ReturnType<typeof useAdminActions>
}

export function ActiveDriversTab({ adminActions }: ActiveDriversTabProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetAllOnlineDriversQuery({
    page,
    limit,
    searchTerm,
  })

  const rows = (data?.data ?? []).map(mapOnlineDriver)
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.totalItems ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">
        Real-time online drivers monitor — availability, tier, vehicle, and operational status.
      </p>
      <SearchingInput
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search online drivers..."
      />
      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1200 }}
        {...createTableRowProps<DriverTableRow>((record) =>
          openDriverDetails(record, adminActions),
        )}
        columns={[
          {
            title: 'Driver',
            dataIndex: 'name',
            render: (name: string, record: DriverTableRow) => (
              <Link to={`/drivers/${record.id}`} onClick={(e) => e.stopPropagation()}>
                {name}
              </Link>
            ),
          },
          {
            title: 'Online Status',
            dataIndex: 'availabilityStatus',
            render: (status?: string) => (
              <StatusBadge status={status === 'online' || !status ? 'active' : status} />
            ),
          },
          { title: 'City', dataIndex: 'city', ellipsis: true },
          {
            title: 'Tier',
            dataIndex: 'currentTier',
            render: (tier?: string) => (tier ? <Tag>{tier}</Tag> : '—'),
          },
          { title: 'Vehicle', dataIndex: 'vehicle', ellipsis: true },
          {
            title: 'Plate',
            dataIndex: 'vehiclePlate',
            render: (plate?: string) => plate || '—',
          },
          { title: 'Rating', dataIndex: 'rating', render: (r: number) => `${r} ★` },
          {
            title: 'Availability',
            render: () => <Tag color="green">Available</Tag>,
          },
          createActionsColumn<DriverTableRow>(
            () => getActiveDriverActionItems(),
            (key, record) => handleDriverAction(key, record, adminActions),
          ),
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
