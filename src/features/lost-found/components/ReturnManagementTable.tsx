import { useCallback, useState } from 'react'
import { Form, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetLostAndFoundReturnsQuery,
  type LostFoundReturnRow,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import {
  useCompleteReturnMutation,
  useUpdateReturnStatusMutation,
} from '@/services/lostFoundApi'
import type { ReturnRecord, ReturnStatus } from '@/types/lostFound'
import { formatCurrency, formatDateTime } from '@/utils/format'
import {
  getReturnActionItems,
  openLostFoundDrawer,
  RETURN_METHOD_LABELS,
  RETURN_STATUS_LABELS,
} from '@/features/lost-found/lostFoundHelpers'

function toReturnRecord(row: LostFoundReturnRow): ReturnRecord {
  return {
    id: row.id,
    reportId: row.reportId,
    returnMethod: row.returnMethod as ReturnRecord['returnMethod'],
    passengerName: row.passengerName,
    driverName: row.driverName,
    scheduledDate: row.scheduledDate,
    returnStatus: row.returnStatus as ReturnStatus,
    fee: row.fee,
  }
}

function openReturnDetails(record: LostFoundReturnRow, adminActions: ReturnType<typeof useAdminActions>) {
  openLostFoundDrawer(
    `Return — ${record.reportId.slice(-8)}`,
    [
      { label: 'Report ID', value: record.reportId },
      {
        label: 'Return Method',
        value: RETURN_METHOD_LABELS[record.returnMethod] ?? record.returnMethod,
      },
      { label: 'Passenger', value: record.passengerName },
      { label: 'Passenger Email', value: record.passengerEmail },
      { label: 'Passenger Phone', value: record.passengerPhone },
      { label: 'Driver', value: record.driverName },
      { label: 'Driver Email', value: record.driverEmail },
      { label: 'Driver Phone', value: record.driverPhone },
      { label: 'Scheduled Date', value: formatDateTime(record.scheduledDate) },
      {
        label: 'Return Status',
        value: RETURN_STATUS_LABELS[record.returnStatus] ?? record.returnStatus.replace(/_/g, ' '),
      },
      { label: 'Fee', value: formatCurrency(record.fee) },
    ],
    adminActions,
  )
}

export function ReturnManagementTable() {
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusRecord, setStatusRecord] = useState<LostFoundReturnRow | null>(null)

  const { data, isLoading, isFetching } = useGetLostAndFoundReturnsQuery({
    page,
    limit,
    searchTerm,
  })

  const [updateStatus, { isLoading: updating }] = useUpdateReturnStatusMutation()
  const [completeReturn] = useCompleteReturnMutation()

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

  const handleAction = (key: string, record: LostFoundReturnRow) => {
    switch (key) {
      case 'view':
        openReturnDetails(record, adminActions)
        break
      case 'update-status':
        setStatusRecord(record)
        break
      case 'complete':
        completeReturn(record.id)
          .unwrap()
          .then(() => adminActions.notify(`Return ${record.id.slice(-8)} completed`))
          .catch(() => adminActions.notify('Unable to complete return'))
        break
    }
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
        {...createTableRowProps<LostFoundReturnRow>((record) =>
          openReturnDetails(record, adminActions),
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
          createActionsColumn<LostFoundReturnRow>(
            (record) => getReturnActionItems(toReturnRecord(record)),
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

      {statusRecord && (
        <Modal
          title={`Update Status — ${statusRecord.reportId.slice(-8)}`}
          open
          confirmLoading={updating}
          onCancel={() => setStatusRecord(null)}
          onOk={() => {
            document.getElementById('return-status-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="return-status-form"
            layout="vertical"
            className="mt-4"
            initialValues={{ returnStatus: statusRecord.returnStatus }}
            onFinish={async (values: { returnStatus: string }) => {
              try {
                await updateStatus({
                  id: statusRecord.id,
                  returnStatus: values.returnStatus as ReturnStatus,
                }).unwrap()
                adminActions.notify('Return status updated')
                setStatusRecord(null)
              } catch {
                adminActions.notify('Unable to update return status')
              }
            }}
          >
            <Form.Item name="returnStatus" label="Return Status" rules={[{ required: true }]}>
              <Select
                className="!h-[45px]"
                options={[
                  ...Object.entries(RETURN_STATUS_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                  // Ensure current API status is selectable even if not in defaults
                  ...(RETURN_STATUS_LABELS[statusRecord.returnStatus]
                    ? []
                    : [
                        {
                          value: statusRecord.returnStatus,
                          label: statusRecord.returnStatus.replace(/_/g, ' '),
                        },
                      ]),
                ]}
              />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
