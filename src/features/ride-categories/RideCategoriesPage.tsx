import { useMemo, useState } from 'react'
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
import { RideCategoryFormModal } from '@/features/ride-categories/components/RideCategoryFormModal'
import {
  buildRideCategoryWritePayload,
  formatVehicleRequirements,
  mapRideCategoryItem,
  type RideCategoryFormValues,
  type RideCategoryRow,
} from '@/features/ride-categories/mapRideCategory'
import {
  getRideCategoryActionItems,
  getRideCategoryStatusColor,
  getRideCategoryStatusLabel,
  RIDE_CATEGORY_STATUS_OPTIONS,
} from '@/features/ride-categories/rideCategoryHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateRideCategoryMutation,
  useDeleteRideCategoryMutation,
  useGetRideCategoriesListQuery,
  useUpdateRideCategoryMutation,
  useUpdateRideCategoryStatusMutation,
} from '@/redux/api/rideCategoriesApi'
import type { RideCategoryStatus } from '@/redux/api/rideCategoriesApi'
import { formatDateTime } from '@/utils/format'

export default function RideCategoriesPage() {
  useDocumentTitle('Ride Categories')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<RideCategoryRow | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<RideCategoryRow | null>(null)

  const { data, isLoading, isFetching } = useGetRideCategoriesListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const rows = useMemo(
    () => (data?.data ?? []).map(mapRideCategoryItem),
    [data?.data],
  )
  const meta = data?.meta

  const [createCategory, { isLoading: creating }] = useCreateRideCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateRideCategoryMutation()
  const [deleteCategory, { isLoading: deleting }] = useDeleteRideCategoryMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateRideCategoryStatusMutation()

  const handleAction = async (key: string, record: RideCategoryRow) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle': {
        const nextStatus: RideCategoryStatus = record.status === 'active' ? 'inactive' : 'active'
        try {
          await updateStatus({ id: record.id, status: nextStatus }).unwrap()
          adminActions.notify(
            nextStatus === 'active' ? 'Category activated' : 'Category deactivated',
            record.name,
          )
        } catch (err) {
          adminActions.notify('Unable to update category status', String(err))
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (values: RideCategoryFormValues) => {
    try {
      await createCategory(buildRideCategoryWritePayload(values)).unwrap()
      adminActions.notify('Category created', values.name)
      setFormOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create category', String(err))
    }
  }

  const handleUpdate = async (values: RideCategoryFormValues) => {
    if (!editRecord) return
    try {
      await updateCategory({
        id: editRecord.id,
        body: buildRideCategoryWritePayload(values),
      }).unwrap()
      adminActions.notify('Category updated', editRecord.name)
      setEditRecord(null)
    } catch (err) {
      adminActions.notify('Unable to update category', String(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteCategory(deleteRecord.id).unwrap()
      adminActions.notify('Category deleted', deleteRecord.name)
      setDeleteRecord(null)
    } catch (err) {
      adminActions.notify('Unable to delete category', String(err))
    }
  }

  return (
    <PageShell
      title="Ride Categories"
      description="Manage ride categories, commission rules, and vehicle requirements."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Category
        </Button>
      }
    >
      <TableFilters
        search={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value)
          setPage(1)
        }}
        searchPlaceholder="Search categories..."
        statusOptions={RIDE_CATEGORY_STATUS_OPTIONS}
        status={status}
        onStatusChange={(value) => {
          setStatus(value ?? '')
          setPage(1)
        }}
      />

      <div className="glass-card p-4">
        <Table
          loading={isLoading || isFetching || updatingStatus}
          rowKey="id"
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1200 }}
          columns={[
            { title: 'Category Name', dataIndex: 'name' },
            {
              title: 'Description',
              dataIndex: 'description',
              ellipsis: true,
            },
            {
              title: 'Commission',
              dataIndex: 'commissionRate',
              render: (v: number) => `${v}%`,
            },
            {
              title: 'Min Rating',
              dataIndex: 'minimumDriverRating',
            },
            {
              title: 'Vehicle Requirements',
              render: (_: unknown, record: RideCategoryRow) =>
                formatVehicleRequirements(record.vehicleRequirements),
            },
            {
              title: 'Service Category',
              render: (_: unknown, record: RideCategoryRow) => record.serviceCategoryName ?? '—',
            },
            {
              title: 'Reservation',
              render: (_: unknown, record: RideCategoryRow) =>
                record.supportsReservation ? 'Supported' : 'Not supported',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: RideCategoryStatus) => (
                <Tag color={getRideCategoryStatusColor(s)}>{getRideCategoryStatusLabel(s)}</Tag>
              ),
            },
            {
              title: 'Created At',
              dataIndex: 'createdAt',
              render: (d: string) => (d ? formatDateTime(d) : '—'),
            },
            createActionsColumn<RideCategoryRow>(
              (record) => getRideCategoryActionItems(record),
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

      <RideCategoryFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <RideCategoryFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
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
