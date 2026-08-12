import { useCallback, useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { createTableRowProps } from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import {
  useGetLostAndFoundReportsQuery,
  type LostFoundReportRow,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { REPORT_STATUS_LABELS } from '@/features/lost-found/lostFoundHelpers'
import { ReportDetailsDrawer } from '@/features/lost-found/components/ReportDetailsDrawer'
import { formatDateTime } from '@/utils/format'

export function LostItemTable() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const { data, isLoading, isFetching } = useGetLostAndFoundReportsQuery({
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

  const openDetails = (record: LostFoundReportRow) => {
    setSelectedReportId(record.id)
  }

  return (
    <>
      <div className="mb-4">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by report, passenger, driver, item..."
        />
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1300 }}
        {...createTableRowProps<LostFoundReportRow>(openDetails)}
        columns={[
          {
            title: 'Report ID',
            dataIndex: 'id',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
            ),
          },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          {
            title: 'Trip ID',
            dataIndex: 'tripId',
            width: 120,
            render: (id: string) => (
              <span className="font-mono text-xs text-white">
                {id ? id.slice(-8) : '—'}
              </span>
            ),
          },
          { title: 'Item Category', dataIndex: 'itemCategory' },
          { title: 'Item Name', dataIndex: 'itemName', ellipsis: true },
          {
            title: 'Created Date',
            dataIndex: 'createdAt',
            render: (d: string) => formatDateTime(d),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag>{REPORT_STATUS_LABELS[s] ?? s.replace(/_/g, ' ')}</Tag>
            ),
          },
          {
            title: 'Action',
            key: 'action',
            fixed: 'right',
            width: 110,
            render: (_: unknown, record: LostFoundReportRow) => (
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

      <ReportDetailsDrawer
        open={Boolean(selectedReportId)}
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </>
  )
}
