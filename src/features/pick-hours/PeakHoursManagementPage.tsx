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
import { PeakHourFormModal } from '@/features/pick-hours/components/PeakHourFormModal'
import {
  PEAK_HOUR_STATUS_OPTIONS,
  formatApplicableDays,
  getPeakHourActionItems,
  getPeakHourStatusColor,
  getPeakHourStatusLabel,
} from '@/features/pick-hours/peakHourHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreatePickHourMutation,
  useDeletePickHourMutation,
  useGetPickHoursListQuery,
  useUpdatePickHourMutation,
  useUpdatePickHourStatusMutation,
  type PeakHourItem,
  type PeakHourStatus,
  type PeakHourWritePayload,
} from '@/redux/api/pickHoursApi'

export default function PeakHoursManagementPage() {
  useDocumentTitle('Peak Hours Management')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PeakHourItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PeakHourItem | null>(null)

  const { data, isLoading, isFetching } = useGetPickHoursListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const [createPeakHour, { isLoading: creating }] = useCreatePickHourMutation()
  const [updatePeakHour, { isLoading: updating }] = useUpdatePickHourMutation()
  const [deletePeakHour, { isLoading: deleting }] = useDeletePickHourMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdatePickHourStatusMutation()

  const handleAction = async (key: string, record: PeakHourItem) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle': {
        const nextStatus: PeakHourStatus = record.status === 'active' ? 'inactive' : 'active'
        try {
          await updateStatus({ id: record._id, status: nextStatus }).unwrap()
          adminActions.notify(
            nextStatus === 'active' ? 'Peak hour activated' : 'Peak hour deactivated',
            record.name,
          )
        } catch {
          adminActions.notify('Unable to update peak hour status', record.name)
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (payload: PeakHourWritePayload) => {
    try {
      await createPeakHour(payload).unwrap()
      adminActions.notify('Peak hour created', payload.name)
      setFormOpen(false)
    } catch {
      adminActions.notify('Unable to create peak hour', payload.name)
    }
  }

  const handleUpdate = async (payload: PeakHourWritePayload) => {
    if (!editRecord) return
    try {
      await updatePeakHour({ id: editRecord._id, body: payload }).unwrap()
      adminActions.notify('Peak hour updated', editRecord.name)
      setEditRecord(null)
    } catch {
      adminActions.notify('Unable to update peak hour', editRecord.name)
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deletePeakHour(deleteRecord._id).unwrap()
      adminActions.notify('Peak hour deleted', deleteRecord.name)
      setDeleteRecord(null)
    } catch {
      adminActions.notify('Unable to delete peak hour', deleteRecord.name)
    }
  }

  return (
    <PageShell
      title="Peak Hours Management"
      description="Define peak hour windows that affect surge and operational pricing."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Peak Hour
        </Button>
      }
    >
      <TableFilters
        search={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setPage(1)
        }}
        searchPlaceholder="Search peak hours..."
        statusOptions={PEAK_HOUR_STATUS_OPTIONS}
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
            { title: 'Name', dataIndex: 'name' },
            {
              title: 'Time',
              key: 'time',
              width: 140,
              render: (_: unknown, record: PeakHourItem) =>
                `${record.startTime} – ${record.endTime}`,
            },
            { title: 'Timezone', dataIndex: 'timezone', width: 180 },
            {
              title: 'Days',
              dataIndex: 'applicableDays',
              ellipsis: true,
              render: (days: PeakHourItem['applicableDays']) => formatApplicableDays(days),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 110,
              render: (s: PeakHourStatus) => (
                <Tag color={getPeakHourStatusColor(s)}>{getPeakHourStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<PeakHourItem>(
              (record) => getPeakHourActionItems(record),
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

      <PeakHourFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <PeakHourFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Peak Hour"
        description="Are you sure you want to delete this peak hour? This action cannot be undone."
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
