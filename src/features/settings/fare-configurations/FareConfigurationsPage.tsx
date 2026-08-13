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
import { FareConfigurationFormModal } from '@/features/settings/fare-configurations/components/FareConfigurationFormModal'
import {
  FARE_STATUS_OPTIONS,
  getFareActionItems,
  getFareStatusColor,
  getFareStatusLabel,
  getRideCategoryLabel,
  getServiceAreaLabel,
} from '@/features/settings/fare-configurations/fareConfigurationHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateFareConfigurationMutation,
  useDeleteFareConfigurationMutation,
  useGetFareConfigurationsQuery,
  useUpdateFareConfigurationMutation,
  useUpdateFareConfigurationStatusMutation,
  type FareConfigurationItem,
  type FareConfigurationStatus,
  type FareConfigurationWritePayload,
} from '@/redux/api/fareConfigurationsApi'
import { formatCurrency } from '@/utils/format'

export default function FareConfigurationsPage() {
  useDocumentTitle('Fare Configuration')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<FareConfigurationItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<FareConfigurationItem | null>(null)

  const { data, isLoading, isFetching } = useGetFareConfigurationsQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const [createFare, { isLoading: creating }] = useCreateFareConfigurationMutation()
  const [updateFare, { isLoading: updating }] = useUpdateFareConfigurationMutation()
  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateFareConfigurationStatusMutation()
  const [deleteFare, { isLoading: deleting }] = useDeleteFareConfigurationMutation()

  const rows = data?.data ?? []
  const meta = data?.meta

  const handleAction = async (key: string, record: FareConfigurationItem) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle': {
        const nextStatus: FareConfigurationStatus =
          record.status === 'active' ? 'inactive' : 'active'
        try {
          await updateStatus({ id: record._id, status: nextStatus }).unwrap()
          adminActions.notify(
            nextStatus === 'active' ? 'Fare activated' : 'Fare deactivated',
            getServiceAreaLabel(record.serviceAreaId),
          )
        } catch {
          adminActions.notify('Unable to update fare status')
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (payload: FareConfigurationWritePayload) => {
    try {
      await createFare(payload).unwrap()
      adminActions.notify('Fare configuration created')
      setFormOpen(false)
    } catch {
      adminActions.notify('Unable to create fare configuration')
    }
  }

  const handleUpdate = async (payload: FareConfigurationWritePayload) => {
    if (!editRecord) return
    try {
      await updateFare({ id: editRecord._id, body: payload }).unwrap()
      adminActions.notify('Fare configuration updated')
      setEditRecord(null)
    } catch {
      adminActions.notify('Unable to update fare configuration')
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteFare(deleteRecord._id).unwrap()
      adminActions.notify('Fare configuration deleted')
      setDeleteRecord(null)
    } catch {
      adminActions.notify('Unable to delete fare configuration')
    }
  }

  return (
    <PageShell
      title="Fare Configuration"
      description="Manage base fares and per-distance / per-time pricing by service area and ride category."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Fare
        </Button>
      }
    >
      <TableFilters
        search={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setPage(1)
        }}
        searchPlaceholder="Search fare configurations..."
        statusOptions={FARE_STATUS_OPTIONS}
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
          scroll={{ x: 1200 }}
          locale={{ emptyText: 'No fare configurations found' }}
          columns={[
            {
              title: 'Service Area',
              dataIndex: 'serviceAreaId',
              ellipsis: true,
              render: (value: FareConfigurationItem['serviceAreaId']) =>
                getServiceAreaLabel(value),
            },
            {
              title: 'Ride Category',
              dataIndex: 'rideCategoryId',
              width: 180,
              render: (value: FareConfigurationItem['rideCategoryId']) =>
                getRideCategoryLabel(value),
            },
            {
              title: 'Base',
              dataIndex: 'baseFare',
              width: 100,
              render: (v: number) => formatCurrency(v),
            },
            {
              title: 'Per Km',
              dataIndex: 'perKmFare',
              width: 100,
              render: (v: number) => formatCurrency(v),
            },
            {
              title: 'Per Min',
              dataIndex: 'perMinuteFare',
              width: 100,
              render: (v: number) => formatCurrency(v),
            },
            {
              title: 'Waiting / Min',
              dataIndex: 'waitingFeePerMinute',
              width: 120,
              render: (v: number) => formatCurrency(v),
            },
            {
              title: 'Minimum',
              dataIndex: 'minimumFare',
              width: 100,
              render: (v: number) => formatCurrency(v),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 110,
              render: (s: FareConfigurationStatus) => (
                <Tag color={getFareStatusColor(s)}>{getFareStatusLabel(s)}</Tag>
              ),
            },
            createActionsColumn<FareConfigurationItem>(
              (record) => getFareActionItems(record),
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

      <FareConfigurationFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <FareConfigurationFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Fare Configuration"
        description="Are you sure you want to delete this fare configuration?"
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
