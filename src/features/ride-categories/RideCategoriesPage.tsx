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
import { RideCategoryFormModal } from '@/features/ride-categories/components/RideCategoryFormModal'
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
  useGetRideCategoriesQuery,
  useToggleRideCategoryStatusMutation,
  useUpdateRideCategoryMutation,
} from '@/services/rideCategoryApi'
import type { RideCategoryDefinition, RideCategoryFormValues } from '@/types/rideCategoryManagement'
import { formatDateTime } from '@/utils/format'

export default function RideCategoriesPage() {
  useDocumentTitle('Ride Categories')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<RideCategoryDefinition | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<RideCategoryDefinition | null>(null)

  const { data, isLoading } = useGetRideCategoriesQuery({
    page,
    pageSize: 10,
    search,
    status: status as RideCategoryDefinition['status'] | '',
  })

  const [createCategory, { isLoading: creating }] = useCreateRideCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateRideCategoryMutation()
  const [deleteCategory, { isLoading: deleting }] = useDeleteRideCategoryMutation()
  const [toggleStatus, { isLoading: toggling }] = useToggleRideCategoryStatusMutation()

  const handleAction = async (key: string, record: RideCategoryDefinition) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle':
        try {
          await toggleStatus(record.id).unwrap()
          adminActions.notify(
            record.status === 'enabled' ? 'Category disabled' : 'Category enabled',
            record.name,
          )
        } catch (err) {
          adminActions.notify('Unable to update category status', String(err))
        }
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (values: RideCategoryFormValues) => {
    try {
      await createCategory(values).unwrap()
      adminActions.notify('Category created', values.name)
      setFormOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create category', String(err))
    }
  }

  const handleUpdate = async (values: RideCategoryFormValues) => {
    if (!editRecord) return
    try {
      await updateCategory({ id: editRecord.id, ...values }).unwrap()
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
      description="Manage ride categories, pricing rules, and availability."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Category
        </Button>
      }
    >
      <TableFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
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
          loading={isLoading || toggling}
          rowKey="id"
          dataSource={data?.data ?? []}
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            total: data?.total ?? 0,
            pageSize: 10,
            onChange: setPage,
            showSizeChanger: false,
          }}
          columns={[
            { title: 'Category Name', dataIndex: 'name' },
            {
              title: 'Description',
              dataIndex: 'description',
              ellipsis: true,
            },
            {
              title: 'Fare Multiplier',
              dataIndex: 'fareMultiplier',
              render: (v: number) => `${v.toFixed(2)}x`,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: RideCategoryDefinition['status']) => (
                <Tag color={getRideCategoryStatusColor(s)}>{getRideCategoryStatusLabel(s)}</Tag>
              ),
            },
            {
              title: 'Created At',
              dataIndex: 'createdAt',
              render: (d: string) => formatDateTime(d),
            },
            createActionsColumn<RideCategoryDefinition>(
              (record) => getRideCategoryActionItems(record),
              (key, record) => void handleAction(key, record),
            ),
          ]}
        />
      </div>

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
