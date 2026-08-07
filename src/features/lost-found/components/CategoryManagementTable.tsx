import { useCallback, useState } from 'react'
import { Button, Form, Input, Modal, Table } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateLostAndFoundCategoryMutation,
  useDeleteLostAndFoundCategoryMutation,
  useGetLostAndFoundCategoriesQuery,
  useUpdateLostAndFoundCategoryMutation,
  type LostFoundCategoryRow,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { getCategoryActionItems } from '@/features/lost-found/lostFoundHelpers'
import { formatDateTime } from '@/utils/format'

export function CategoryManagementTable() {
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<LostFoundCategoryRow | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<LostFoundCategoryRow | null>(null)
  const [createForm] = Form.useForm<{ name: string }>()
  const [editForm] = Form.useForm<{ name: string }>()

  const { data, isLoading, isFetching } = useGetLostAndFoundCategoriesQuery({
    page,
    limit,
    searchTerm,
  })

  const [createCategory, { isLoading: creating }] = useCreateLostAndFoundCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateLostAndFoundCategoryMutation()
  const [deleteCategory, { isLoading: deleting }] = useDeleteLostAndFoundCategoryMutation()

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

  const handleAction = (key: string, record: LostFoundCategoryRow) => {
    switch (key) {
      case 'edit':
        editForm.setFieldsValue({ name: record.name })
        setEditRecord(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search categories..."
        />
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            createForm.resetFields()
            setCreateOpen(true)
          }}
        >
          Add Category
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 700 }}
        columns={[
          { title: 'Category Name', dataIndex: 'name' },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => <StatusBadge status={s} />,
          },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            width: 180,
            render: (d: string) => formatDateTime(d),
          },
          createActionsColumn<LostFoundCategoryRow>(
            () => getCategoryActionItems(),
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

      <Modal
        title="Add Category"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        okText="Create"
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          className="mt-4"
          onFinish={async (values) => {
            try {
              await createCategory({ name: values.name.trim() }).unwrap()
              adminActions.notify('Category created')
              setCreateOpen(false)
            } catch {
              adminActions.notify('Unable to create category')
            }
          }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Category name is required' }]}
          >
            <Input className="!h-[45px]" placeholder="e.g. iPhone" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Category"
        open={Boolean(editRecord)}
        confirmLoading={updating}
        onCancel={() => setEditRecord(null)}
        onOk={() => editForm.submit()}
        okText="Save"
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          className="mt-4"
          onFinish={async (values) => {
            if (!editRecord) return
            try {
              await updateCategory({
                id: editRecord.id,
                name: values.name.trim(),
              }).unwrap()
              adminActions.notify('Category updated')
              setEditRecord(null)
            } catch {
              adminActions.notify('Unable to update category')
            }
          }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Category name is required' }]}
          >
            <Input className="!h-[45px]" placeholder="Category name" />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Category"
        description={`Delete category "${deleteRecord?.name}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          try {
            await deleteCategory(deleteRecord.id).unwrap()
            adminActions.notify('Category deleted')
            setDeleteRecord(null)
          } catch {
            adminActions.notify('Unable to delete category')
          }
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
