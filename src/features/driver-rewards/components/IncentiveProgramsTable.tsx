import { useState } from 'react'
import { Button, Drawer, Form, Input, InputNumber, Select, Table } from 'antd'
import { Pencil, Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateIncentiveProgramMutation,
  useDeleteIncentiveProgramMutation,
  useGetIncentiveProgramsQuery,
  useUpdateIncentiveProgramMutation,
  LEVEL_OPTIONS,
} from '@/services/driverRewardsApi'
import type { IncentiveProgram } from '@/types/driverRewards'
import { formatCurrency, formatDate } from '@/utils/format'

export function IncentiveProgramsTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetIncentiveProgramsQuery()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<IncentiveProgram | null>(null)
  const [form] = Form.useForm<Omit<IncentiveProgram, 'id'>>()
  const [createProgram, { isLoading: creating }] = useCreateIncentiveProgramMutation()
  const [updateProgram, { isLoading: updating }] = useUpdateIncentiveProgramMutation()
  const [deleteProgram] = useDeleteIncentiveProgramMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    setDrawerOpen(true)
  }

  const openEdit = (record: IncentiveProgram) => {
    setEditRecord(record)
    form.setFieldsValue(record)
    setDrawerOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editRecord) {
      await updateProgram({ id: editRecord.id, ...values }).unwrap()
      adminActions.notify('Incentive program updated')
    } else {
      await createProgram(values).unwrap()
      adminActions.notify('Incentive program created')
    }
    setDrawerOpen(false)
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="primary" onClick={openCreate}>Create Incentive Program</Button>
      </div>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        columns={[
          { title: 'Program', dataIndex: 'title' },
          { title: 'Description', dataIndex: 'description', ellipsis: true },
          { title: 'Trip Target', dataIndex: 'tripTarget' },
          {
            title: 'Reward',
            render: (_: unknown, r: IncentiveProgram) =>
              r.rewardType === 'fixed_cash' ? formatCurrency(r.rewardValue) : `${r.rewardValue}x`,
          },
          { title: 'Start', dataIndex: 'startDate', render: (d: string) => formatDate(d) },
          { title: 'End', dataIndex: 'endDate', render: (d: string) => formatDate(d) },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<IncentiveProgram>(
            () => [
              { key: 'edit', label: 'Edit', icon: Pencil },
              { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
            ],
            (key, record) => {
              if (key === 'edit') openEdit(record)
              if (key === 'delete') {
                deleteProgram(record.id).unwrap().then(() => adminActions.notify('Program deleted'))
              }
            },
          ),
        ]}
      />

      <Drawer
        title={editRecord ? 'Edit Incentive Program' : 'Create Incentive Program'}
        open={drawerOpen}
        width={520}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" loading={creating || updating} onClick={handleSubmit}>Save</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="tripTarget" label="Trip Target" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="rewardType" label="Reward Type" initialValue="fixed_cash" rules={[{ required: true }]}>
            <Select options={[
              { value: 'fixed_cash', label: 'Fixed Cash' },
              { value: 'multiplier', label: 'Multiplier' },
              { value: 'points', label: 'Points' },
              { value: 'percentage', label: 'Percentage' },
            ]} />
          </Form.Item>
          <Form.Item name="rewardValue" label="Reward Value" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="eligibleTiers" label="Eligible Tiers" initialValue={['journey', 'pro_go', 'elite', 'platinum', 'diamond']}>
            <Select mode="multiple" options={LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="active" rules={[{ required: true }]}>
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Drawer>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
