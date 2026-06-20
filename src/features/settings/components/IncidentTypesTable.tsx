import { useState } from 'react'
import { Button, Form, Input, Modal, Select, Table } from 'antd'
import { Pencil, Plus, Power, PowerOff, Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateIncidentCategoryMutation,
  useDeleteIncidentCategoryMutation,
  useGetIncidentCategoriesQuery,
  useUpdateIncidentCategoryMutation,
} from '@/services/safetyIncidentApi'
import type { IncidentCategory, IncidentCategoryFormValues, IncidentPriority } from '@/types/safetyIncident'
import { severityLabel } from '@/features/safety-incidents/safetyIncidentHelpers'
import type { ActionMenuItem } from '@/components/admin/types'

const severityOptions: Array<{ value: IncidentPriority; label: string }> = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const defaultFormValues: IncidentCategoryFormValues = {
  name: '',
  description: '',
  severityLevel: 'high',
  status: 'active',
}

function getIncidentTypeActionItems(record: IncidentCategory): ActionMenuItem[] {
  const items: ActionMenuItem[] = [{ key: 'edit', label: 'Edit', icon: Pencil }]
  if (record.status === 'active') {
    items.push({ key: 'disable', label: 'Disable', icon: PowerOff, group: 1 })
  } else {
    items.push({ key: 'enable', label: 'Enable', icon: Power, group: 1 })
  }
  items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 })
  return items
}

export function IncidentTypesTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetIncidentCategoriesQuery()
  const [editRecord, setEditRecord] = useState<IncidentCategory | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [updateCategory, { isLoading: updating }] = useUpdateIncidentCategoryMutation()
  const [createCategory, { isLoading: creating }] = useCreateIncidentCategoryMutation()
  const [deleteCategory] = useDeleteIncidentCategoryMutation()

  const handleAction = (key: string, record: IncidentCategory) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'enable':
        updateCategory({ id: record.id, status: 'active' })
          .unwrap()
          .then(() => adminActions.notify(`${record.name} enabled`))
        break
      case 'disable':
        updateCategory({ id: record.id, status: 'inactive' })
          .unwrap()
          .then(() => adminActions.notify(`${record.name} disabled`))
        break
      case 'delete':
        adminActions.openConfirm({
          title: 'Delete Incident Type',
          description: `Delete "${record.name}"? This cannot be undone.`,
          confirmLabel: 'Delete',
          danger: true,
          onConfirm: async () => {
            await deleteCategory(record.id).unwrap()
            adminActions.notify('Incident type deleted')
          },
        })
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-alygo-text-muted">
          Configure incident types used to classify safety cases across the platform.
        </p>
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add Incident Type
        </Button>
      </div>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 700 }}
        columns={[
          { title: 'Category Name', dataIndex: 'name' },
          { title: 'Severity Level', dataIndex: 'severityLevel', render: (p: string) => severityLabel(p) },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<IncidentCategory>(
            (record) => getIncidentTypeActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {editRecord && (
        <IncidentTypeFormModal
          title={`Edit Incident Type — ${editRecord.name}`}
          initialValues={editRecord}
          loading={updating}
          onCancel={() => setEditRecord(null)}
          onSubmit={async (values) => {
            await updateCategory({ id: editRecord.id, ...values }).unwrap()
            adminActions.notify('Incident type updated')
            setEditRecord(null)
          }}
        />
      )}

      {createOpen && (
        <IncidentTypeFormModal
          title="Add Incident Type"
          initialValues={defaultFormValues}
          loading={creating}
          onCancel={() => setCreateOpen(false)}
          onSubmit={async (values) => {
            await createCategory(values).unwrap()
            adminActions.notify('Incident type created')
            setCreateOpen(false)
          }}
        />
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}

function IncidentTypeFormModal({
  title,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: {
  title: string
  initialValues: IncidentCategoryFormValues
  loading: boolean
  onCancel: () => void
  onSubmit: (values: IncidentCategoryFormValues) => Promise<void>
}) {
  return (
    <Modal
      title={title}
      open
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={() => {
        document.getElementById('incident-type-form')?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true }),
        )
      }}
      destroyOnClose
    >
      <Form
        id="incident-type-form"
        layout="vertical"
        className="mt-4"
        initialValues={initialValues}
        onFinish={onSubmit}
      >
        <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="severityLevel" label="Severity Level" rules={[{ required: true }]}>
          <Select options={severityOptions} />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </Form.Item>
        <button type="submit" className="hidden" />
      </Form>
    </Modal>
  )
}
