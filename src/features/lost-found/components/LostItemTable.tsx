import { useCallback, useState } from 'react'
import { Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetLostAndFoundReportsQuery,
  type LostFoundReportRow,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import {
  useAssignLostItemCaseMutation,
  useCloseLostItemCaseMutation,
} from '@/services/lostFoundApi'
import type { LostItemReport } from '@/types/lostFound'
import {
  getLostItemReportActionItems,
  REPORT_STATUS_LABELS,
} from '@/features/lost-found/lostFoundHelpers'
import { ReportDetailsDrawer } from '@/features/lost-found/components/ReportDetailsDrawer'
import { formatDateTime } from '@/utils/format'

function toLostItemReport(row: LostFoundReportRow): LostItemReport {
  return {
    id: row.id,
    passengerId: row.passengerId,
    passengerName: row.passengerName,
    passengerEmail: row.passengerEmail,
    passengerPhone: row.passengerPhone,
    driverId: row.driverId,
    driverName: row.driverName,
    driverRating: row.driverRating,
    tripId: row.tripId,
    pickup: row.pickup,
    destination: row.destination,
    tripDate: row.tripDate,
    itemCategory: row.itemCategory,
    itemName: row.itemName,
    itemDescription: row.itemDescription,
    photos: row.photos,
    status: row.status as LostItemReport['status'],
    createdAt: row.createdAt,
    timeline: row.timeline,
  }
}

export function LostItemTable() {
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedReport, setSelectedReport] = useState<LostItemReport | null>(null)
  const [assignRecord, setAssignRecord] = useState<LostFoundReportRow | null>(null)
  const [closeRecord, setCloseRecord] = useState<LostFoundReportRow | null>(null)
  const [assignAdmin, setAssignAdmin] = useState('Admin Ops')

  const { data, isLoading, isFetching } = useGetLostAndFoundReportsQuery({
    page,
    limit,
    searchTerm,
  })

  const [assignCase, { isLoading: assigning }] = useAssignLostItemCaseMutation()
  const [closeCase, { isLoading: closing }] = useCloseLostItemCaseMutation()

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
    setSelectedReport(toLostItemReport(record))
  }

  const handleAction = (key: string, record: LostFoundReportRow) => {
    switch (key) {
      case 'view':
        openDetails(record)
        break
      case 'assign':
        setAssignRecord(record)
        break
      case 'contact-passenger':
        adminActions.notify(`Contacting passenger: ${record.passengerName}`)
        break
      case 'contact-driver':
        adminActions.notify(`Contacting driver: ${record.driverName}`)
        break
      case 'dispute':
        adminActions.notify(`Dispute opened for report ${record.id}`)
        break
      case 'close':
        setCloseRecord(record)
        break
    }
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
              <span className="font-mono text-xs text-white">{id.slice(-8)}</span>
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
          createActionsColumn<LostFoundReportRow>(
            (record) => getLostItemReportActionItems(toLostItemReport(record)),
            (key, record) => handleAction(key, record),
          ),
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
        open={Boolean(selectedReport)}
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      <Modal
        title={`Assign Case — ${assignRecord?.id.slice(-8)}`}
        open={Boolean(assignRecord)}
        confirmLoading={assigning}
        onCancel={() => setAssignRecord(null)}
        onOk={async () => {
          if (!assignRecord) return
          await assignCase({ id: assignRecord.id, assignedAdmin: assignAdmin }).unwrap()
          adminActions.notify(`Case assigned to ${assignAdmin}`)
          setAssignRecord(null)
        }}
        destroyOnClose
      >
        <div className="mt-4 space-y-2">
          <label className="text-sm text-alygo-text-muted">Assigned Admin</label>
          <Select
            className="w-full !h-[45px]"
            value={assignAdmin}
            onChange={setAssignAdmin}
            options={[
              { value: 'Admin Ops', label: 'Admin Ops' },
              { value: 'Support Lead', label: 'Support Lead' },
              { value: 'Ops Manager', label: 'Ops Manager' },
            ]}
          />
        </div>
      </Modal>

      <ConfirmationModal
        open={Boolean(closeRecord)}
        title="Close Case"
        description={`Close lost item report ${closeRecord?.id}? This action marks the case as closed.`}
        confirmLabel="Close Case"
        danger
        loading={closing}
        onCancel={() => setCloseRecord(null)}
        onConfirm={async () => {
          if (!closeRecord) return
          await closeCase(closeRecord.id).unwrap()
          adminActions.notify(`Case ${closeRecord.id} closed`)
          setCloseRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
