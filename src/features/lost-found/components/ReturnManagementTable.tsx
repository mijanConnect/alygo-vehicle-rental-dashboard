import { useCallback, useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { createTableRowProps } from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import {
  useGetLostAndFoundReturnsQuery,
  type LostFoundReturnRow,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { formatCurrency, formatDateTime } from '@/utils/format'
import {
  RETURN_METHOD_LABELS,
  RETURN_STATUS_LABELS,
} from '@/features/lost-found/lostFoundHelpers'
import { ReturnDetailsDrawer } from '@/features/lost-found/components/ReturnDetailsDrawer'

export function ReturnManagementTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const { data, isLoading, isFetching } = useGetLostAndFoundReturnsQuery({
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

  const openDetails = (record: LostFoundReturnRow) => {
    setSelectedReportId(record.reportId || record.id)
  }

  return (
    <>
      <div className="mb-4">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search returns by passenger, driver, report..."
        />
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1100 }}
        {...createTableRowProps<LostFoundReturnRow>(openDetails)}
        columns={[
          {
            title: 'Report ID',
            dataIndex: 'reportId',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
            ),
          },
          {
            title: 'Return Method',
            dataIndex: 'returnMethod',
            render: (m: string) => RETURN_METHOD_LABELS[m] ?? m.replace(/_/g, ' '),
          },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          {
            title: 'Scheduled Date',
            dataIndex: 'scheduledDate',
            render: (d: string) => formatDateTime(d),
          },
          {
            title: 'Return Status',
            dataIndex: 'returnStatus',
            render: (s: string) => (
              <Tag>{RETURN_STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}</Tag>
            ),
          },
          {
            title: 'Fee',
            dataIndex: 'fee',
            render: (f: number) => formatCurrency(f),
          },
          {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 110,
            render: (_: unknown, record: LostFoundReturnRow) => (
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  openDetails(record)
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

      <ReturnDetailsDrawer
        open={Boolean(selectedReportId)}
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </>
  )
}
