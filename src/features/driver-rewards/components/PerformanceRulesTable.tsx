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
  useCreatePerformanceRuleMutation,
  useDeletePerformanceRuleMutation,
  useGetPerformanceRulesQuery,
  useUpdatePerformanceRuleMutation,
} from '@/services/driverRewardsApi'
import type { PerformanceRule } from '@/types/driverRewards'
import { formatDateTime } from '@/utils/format'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'

const metricOptions = [
  { value: 'acceptance_rate', label: 'Acceptance Rate' },
  { value: 'completion_rate', label: 'Completion Rate' },
  { value: 'customer_rating', label: 'Customer Rating' },
  { value: 'on_time_arrival', label: 'On-Time Arrival' },
  { value: 'complaint_free_period', label: 'Complaint-Free Period' },
  { value: 'safe_driving_score', label: 'Safe Driving Score' },
]

export function PerformanceRulesTable() {
  const adminActions = useAdminActions()
  const { canManage } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetPerformanceRulesQuery()
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<PerformanceRule | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<PerformanceRule | null>(null)
  const [form] = Form.useForm<Omit<PerformanceRule, 'id' | 'lastUpdated'>>()

  const [createRule, { isLoading: creating }] = useCreatePerformanceRuleMutation()
  const [updateRule, { isLoading: updating }] = useUpdatePerformanceRuleMutation()
  const [deleteRule, { isLoading: deleting }] = useDeletePerformanceRuleMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEdit = (record: PerformanceRule) => {
    setEditRecord(record)
    form.setFieldsValue(record)
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    const metricLabel = metricOptions.find((m) => m.value === values.metric)?.label ?? values.metric
    const payload = { ...values, metricLabel }
    if (editRecord) {
      await updateRule({ id: editRecord.id, ...payload }).unwrap()
      adminActions.notify('Performance rule updated')
    } else {
      await createRule(payload).unwrap()
      adminActions.notify('Performance rule created')
    }
    setModalOpen(false)
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure monthly and periodic performance bonuses. All thresholds and point values are admin-configurable.
      </p>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add Performance Rule
          </Button>
        </div>
      )}

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1100 }}
        columns={[
          { title: 'Metric', dataIndex: 'metricLabel' },
          { title: 'Threshold', dataIndex: 'thresholdLabel' },
          { title: 'Points', dataIndex: 'points', render: (p: number) => <span className="text-emerald-400">+{p}</span> },
          { title: 'Period', dataIndex: 'period' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          { title: 'Last Updated', dataIndex: 'lastUpdated', render: (d: string) => formatDateTime(d) },
          ...(canManage
            ? [
                createActionsColumn<PerformanceRule>(
                  () => [
                    { key: 'edit', label: 'Edit', icon: Pencil },
                    { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
                  ],
                  (key, record) => {
                    if (key === 'edit') openEdit(record)
                    if (key === 'delete') setDeleteRecord(record)
                  },
                ),
              ]
            : []),
        ]}
      />

      <Modal
        title={editRecord ? 'Edit Performance Rule' : 'Create Performance Rule'}
        open={modalOpen}
        confirmLoading={creating || updating}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4" initialValues={{ period: 'monthly', status: 'active' }}>
          <Form.Item name="metric" label="Metric" rules={[{ required: true }]}>
            <Select options={metricOptions} />
          </Form.Item>
          <Form.Item name="thresholdLabel" label="Threshold Label" rules={[{ required: true }]}>
            <Input placeholder="e.g. 95%+" />
          </Form.Item>
          <Form.Item name="threshold" label="Threshold Value" rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>
          <Form.Item name="points" label="Points Awarded" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="period" label="Evaluation Period" rules={[{ required: true }]}>
            <Select options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'period', label: 'Custom Period' },
            ]} />
          </Form.Item>
          <Form.Item name="periodDays" label="Period Days (if custom)">
            <InputNumber min={1} className="w-full" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Performance Rule"
        description={`Delete "${deleteRecord?.metricLabel}" rule?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteRule(deleteRecord.id).unwrap()
          adminActions.notify('Performance rule deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
