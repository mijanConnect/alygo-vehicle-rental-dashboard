import { useCallback, useState } from 'react'
import { Table, Tag } from 'antd'
import { AdminActionHost, createTableRowProps } from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetDriverCompensationQuery,
  type DriverCompensationRow,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { openLostFoundDrawer } from '@/features/lost-found/lostFoundHelpers'
import { formatCurrency, formatDateTime } from '@/utils/format'

const STATUS_COLORS: Record<string, string> = {
  pending: 'orange',
  paid: 'green',
  cancelled: 'red',
  failed: 'red',
}

function openCompensationDetails(
  record: DriverCompensationRow,
  adminActions: ReturnType<typeof useAdminActions>,
) {
  openLostFoundDrawer(
    `Compensation — ${record.reportId.slice(-8)}`,
    [
      { label: 'Report ID', value: record.reportId },
      { label: 'Driver', value: record.driverName },
      { label: 'Driver Email', value: record.driverEmail },
      { label: 'Driver Phone', value: record.driverPhone },
      { label: 'Amount', value: formatCurrency(record.amount) },
      {
        label: 'Status',
        value: record.status.replace(/_/g, ' '),
      },
      {
        label: 'Paid At',
        value: record.paidAt ? formatDateTime(record.paidAt) : '—',
      },
    ],
    adminActions,
  )
}

export function CompensationSettings() {
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetDriverCompensationQuery({
    page,
    limit,
    searchTerm,
  })

  const rows = data?.data ?? []
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

  return (
    <>
      <div className="mb-4">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by driver, report, status..."
        />
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1000 }}
        {...createTableRowProps<DriverCompensationRow>((record) =>
          openCompensationDetails(record, adminActions),
        )}
        columns={[
          {
            title: 'Report ID',
            dataIndex: 'reportId',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
            ),
          },
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Email', dataIndex: 'driverEmail', ellipsis: true },
          { title: 'Phone', dataIndex: 'driverPhone', width: 140 },
          {
            title: 'Amount',
            dataIndex: 'amount',
            width: 120,
            render: (amount: number) => formatCurrency(amount),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 120,
            render: (status: string) => (
              <Tag color={STATUS_COLORS[status] ?? 'default'}>
                {status.replace(/_/g, ' ')}
              </Tag>
            ),
          },
          {
            title: 'Paid At',
            dataIndex: 'paidAt',
            width: 180,
            render: (date: string) => (date ? formatDateTime(date) : '—'),
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

      <AdminActionHost actions={adminActions} />
    </>
  )
}
