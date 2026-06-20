import { useState } from 'react'
import { Button, Form, Input, Modal, Table } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateLostItemCategoryMutation,
  useDeleteLostItemCategoryMutation,
  useGetLostItemCategoriesQuery,
  useUpdateLostItemCategoryMutation,
} from '@/services/lostFoundApi'
import type { LostItemCategory } from '@/types/lostFound'
import { getCategoryActionItems } from '@/features/lost-found/lostFoundHelpers'

export function CategoryManagementTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetLostItemCategoriesQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<LostItemCategory | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<LostItemCategory | null>(null)
  const [newName, setNewName] = useState('')

  const [createCategory, { isLoading: creating }] = useCreateLostItemCategoryMutation()
  const [updateCategory, { isLoading: updating }] = useUpdateLostItemCategoryMutation()
  const [deleteCategory, { isLoading: deleting }] = useDeleteLostItemCategoryMutation()

  const handleAction = (key: string, record: LostItemCategory) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add Category
        </Button>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 600 }}
        columns={[
          { title: 'Category Name', dataIndex: 'name' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<LostItemCategory>(
            () => getCategoryActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <Modal
        title="Add Category"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => {
          setCreateOpen(false)
          setNewName('')
        }}
        onOk={async () => {
          if (!newName.trim()) return
          await createCategory({ name: newName.trim() }).unwrap()
          adminActions.notify('Category created')
          setCreateOpen(false)
          setNewName('')
        }}
        destroyOnClose
      >
        <Input
          className="mt-4"
          placeholder="Category name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </Modal>

      {editRecord && (
        <Modal
          title="Edit Category"
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('category-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="category-edit-form"
            layout="vertical"
            className="mt-4"
            initialValues={{ name: editRecord.name }}
            onFinish={async (values: { name: string }) => {
              await updateCategory({ id: editRecord.id, name: values.name }).unwrap()
              adminActions.notify('Category updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

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
          await deleteCategory(deleteRecord.id).unwrap()
          adminActions.notify('Category deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
