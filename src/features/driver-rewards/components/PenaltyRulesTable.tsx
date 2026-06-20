import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreatePenaltyRuleMutation,
  useDeletePenaltyRuleMutation,
  useGetPenaltyRulesQuery,
  useUpdatePenaltyRuleMutation,
} from '@/services/driverRewardsApi'
import type { PenaltyRule } from '@/types/driverRewards'
import { formatDateTime } from '@/utils/format'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'

export function PenaltyRulesTable() {
  const adminActions = useAdminActions()
  const { canManage } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetPenaltyRulesQuery()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PenaltyRule | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PenaltyRule | null>(null)
  const [form] = Form.useForm<Omit<PenaltyRule, 'id' | 'lastUpdated'>>()

  const [createRule, { isLoading: creating }] = useCreatePenaltyRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdatePenaltyRuleMutation()
  const [deleteRule, { isLoading: deleting }] = useDeletePenaltyRuleMutation()

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const points = values.points > 0 ? -Math.abs(values.points) : values.points
    if (editRecord) {
      await updateRule({ id: editRecord.id, ...values, points }).unwrap()
      adminActions.notify('Penalty rule updated')
    } else {
      await createRule({ ...values, points }).unwrap()
      adminActions.notify('Penalty rule created')
    }
    setModalOpen(false)
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure point deductions for cancellations, complaints, compliance violations, and safety incidents.
      </p>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => { setEditRecord(null); form.resetFields(); setModalOpen(true) }}>
            Add Penalty Rule
          </Button>
        </div>
      )}

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Rule Name', dataIndex: 'ruleName' },
          { title: 'Action Type', dataIndex: 'actionType' },
          { title: 'Points', dataIndex: 'points', render: (p: number) => <span className="text-red-400">{p}</span> },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          { title: 'Last Updated', dataIndex: 'lastUpdated', render: (d: string) => formatDateTime(d) },
          ...(canManage
            ? [
                createActionsColumn<PenaltyRule>(
                  () => [
                    { key: 'edit', label: 'Edit', icon: Pencil },
                    { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
                  ],
                  (key, record) => {
                    if (key === 'edit') { setEditRecord(record); form.setFieldsValue(record); setModalOpen(true) }
                    if (key === 'delete') setDeleteRecord(record)
                  },
                ),
              ]
            : []),
        ]}
      />

      <Modal
        title={editRecord ? 'Edit Penalty Rule' : 'Create Penalty Rule'}
        open={modalOpen}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4" initialValues={{ status: 'active', points: -10 }}>
          <Form.Item name="ruleName" label="Rule Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="actionType" label="Action Type" rules={[{ required: true }]}>
            <Input placeholder="e.g. ride_cancelled" />
          </Form.Item>
          <Form.Item name="points" label="Points (negative)" rules={[{ required: true }]}>
            <InputNumber max={0} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Penalty Rule"
        description={`Delete "${deleteRecord?.ruleName}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteRule(deleteRecord.id).unwrap()
          adminActions.notify('Penalty rule deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
