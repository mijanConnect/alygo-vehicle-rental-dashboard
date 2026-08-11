import { useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { TableFilters } from '@/components/common/TableFilters'
import { Pagination } from '@/components/shared/Pagination'
import {
  HOLIDAY_STATUS_OPTIONS,
  getHolidayActionItems,
  getHolidayStatusColor,
  getHolidayStatusLabel,
} from '@/features/holidays/holidayHelpers'
import { HolidayFormModal } from '@/features/holidays/components/HolidayFormModal'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateHolidayMutation,
  useDeleteHolidayMutation,
  useGetHolidaysListQuery,
  useUpdateHolidayMutation,
  useUpdateHolidayStatusMutation,
  type HolidayItem,
  type HolidayStatus,
  type HolidayWritePayload,
} from '@/redux/api/holidayManageApi'
import { formatDateTime } from '@/utils/format'

export default function HolidayManagementPage() {
  useDocumentTitle('Holiday Management')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<HolidayItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<HolidayItem | null>(null)

  const { data, isLoading, isFetching } = useGetHolidaysListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const [createHoliday, { isLoading: creating }] = useCreateHolidayMutation()
  const [updateHoliday, { isLoading: updating }] = useUpdateHolidayMutation()
  const [deleteHoliday, { isLoading: deleting }] = useDeleteHolidayMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateHolidayStatusMutation()

  const handleAction = async (key: string, record: HolidayItem) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle': {
        const nextStatus: HolidayStatus = record.status === 'active' ? 'inactive' : 'active'
        try {
          await updateStatus({ id: record._id, status: nextStatus }).unwrap()
          adminActions.notify(
            nextStatus === 'active' ? 'Holiday activated' : 'Holiday deactivated',
            record.holidayName,
          )
        } catch (err) {
          adminActions.notify('Unable to update holiday status', String(err))
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (payload: HolidayWritePayload) => {
    try {
      await createHoliday(payload).unwrap()
      adminActions.notify('Holiday created', payload.holidayName)
      setFormOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create holiday', String(err))
    }
  }

  const handleUpdate = async (payload: HolidayWritePayload) => {
    if (!editRecord) return
    try {
      await updateHoliday({ id: editRecord._id, body: payload }).unwrap()
      adminActions.notify('Holiday updated', editRecord.holidayName)
      setEditRecord(null)
    } catch (err) {
      adminActions.notify('Unable to update holiday', String(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteHoliday(deleteRecord._id).unwrap()
      adminActions.notify('Holiday deleted', deleteRecord.holidayName)
      setDeleteRecord(null)
    } catch (err) {
      adminActions.notify('Unable to delete holiday', String(err))
    }
  }

  return (
    <PageShell
      title="Holiday Management"
      description="Create and manage special holidays that affect platform operations."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Holiday
        </Button>
      }
    >
      <TableFilters
        search={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setPage(1)
        }}
        searchPlaceholder="Search holidays..."
        statusOptions={HOLIDAY_STATUS_OPTIONS}
        status={status}
        onStatusChange={(value) => {
          setStatus(value ?? '')
          setPage(1)
        }}
      />

      <div className="glass-card p-4">
        <Table
          loading={isLoading || isFetching || updatingStatus}
          rowKey="_id"
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1100 }}
          columns={[
            { title: 'Holiday Name', dataIndex: 'holidayName' },
            {
              title: 'Description',
              dataIndex: 'description',
              ellipsis: true,
            },
            { title: 'Timezone', dataIndex: 'timezone', width: 160 },
            {
              title: 'Start',
              dataIndex: 'startDate',
              render: (d: string) => (d ? formatDateTime(d) : '—'),
            },
            {
              title: 'End',
              dataIndex: 'endDate',
              render: (d: string) => (d ? formatDateTime(d) : '—'),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: HolidayStatus) => (
                <Tag color={getHolidayStatusColor(s)}>{getHolidayStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<HolidayItem>(
              (record) => getHolidayActionItems(record),
              (key, record) => void handleAction(key, record),
            ),
          ]}
        />
      </div>

      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />

      <HolidayFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <HolidayFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Holiday"
        description="Are you sure you want to delete this holiday? This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteRecord(null)}
      />

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
