import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button, Drawer, Form, Input, InputNumber, Select, Switch, Table } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  LEVEL_OPTIONS,
  useCreateBonusCampaignMutation,
  useDeleteBonusCampaignMutation,
  useGetBonusCampaignsQuery,
  useUpdateBonusCampaignMutation,
} from '@/services/driverRewardsApi'
import type { BonusCampaign } from '@/types/driverRewards'
import { formatDate, formatNumber } from '@/utils/format'

const campaignTypeOptions = [
  { value: 'tier_based', label: 'Tier Based' },
  { value: 'city_based', label: 'City Based' },
  { value: 'driver_based', label: 'Driver Based' },
  { value: 'event_based', label: 'Event Based' },
  { value: 'demand_based', label: 'Demand Based' },
]

const cityOptions = [
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'Oakland', label: 'Oakland' },
  { value: 'San Jose', label: 'San Jose' },
  { value: 'Los Angeles', label: 'Los Angeles' },
]

type CampaignFormValues = Omit<BonusCampaign, 'id' | 'spent'>

export function BonusCampaignsTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetBonusCampaignsQuery()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BonusCampaign | null>(null)
  const [form] = Form.useForm<CampaignFormValues>()
  const [createCampaign, { isLoading: creating }] = useCreateBonusCampaignMutation()
  const [updateCampaign, { isLoading: updating }] = useUpdateBonusCampaignMutation()
  const [deleteCampaign] = useDeleteBonusCampaignMutation()

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue({
      status: 'active',
      enabled: true,
      targetTiers: [],
      targetCities: [],
      tripTarget: 10,
      rewardPoints: 50,
    })
    setDrawerOpen(true)
  }

  const openEdit = (record: BonusCampaign) => {
    setEditRecord(record)
    form.setFieldsValue(record)
    setDrawerOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editRecord) {
      await updateCampaign({ id: editRecord.id, ...values }).unwrap()
      adminActions.notify('Bonus campaign updated')
    } else {
      await createCampaign(values).unwrap()
      adminActions.notify('Bonus campaign created')
    }
    setDrawerOpen(false)
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure promotional bonus campaigns with trip targets, reward points, date ranges, and targeting by tier or city.
      </p>

      <div className="mb-4 flex justify-end">
        <Button type="primary" onClick={openCreate}>Create Bonus Campaign</Button>
      </div>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1400 }}
        columns={[
          { title: 'Campaign', dataIndex: 'name' },
          { title: 'Trip Target', dataIndex: 'tripTarget' },
          {
            title: 'Reward Points',
            dataIndex: 'rewardPoints',
            render: (v: number) => <span className="text-emerald-400">+{formatNumber(v)}</span>,
          },
          { title: 'Target Tiers', dataIndex: 'targetTiers', render: (t: string[]) => t?.join(', ') || '—' },
          { title: 'Target Cities', dataIndex: 'targetCities', render: (c: string[]) => c?.join(', ') || '—' },
          { title: 'Start', dataIndex: 'startDate', render: (d: string) => formatDate(d) },
          { title: 'End', dataIndex: 'endDate', render: (d: string) => formatDate(d) },
          {
            title: 'Enabled',
            dataIndex: 'enabled',
            render: (v: boolean) => <StatusBadge status={v ? 'active' : 'inactive'} />,
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<BonusCampaign>(
            () => [
              { key: 'edit', label: 'Edit', icon: Pencil },
              { key: 'delete', label: 'Delete', icon: Trash2, danger: true },
            ],
            (key, record) => {
              if (key === 'edit') openEdit(record)
              if (key === 'delete') {
                deleteCampaign(record.id).unwrap().then(() => adminActions.notify('Campaign deleted'))
              }
            },
          ),
        ]}
      />

      <Drawer
        title={editRecord ? 'Edit Bonus Campaign' : 'Create Bonus Campaign'}
        open={drawerOpen}
        width={560}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" loading={creating || updating} onClick={handleSubmit}>Save</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Campaign Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="campaignType" label="Campaign Type" rules={[{ required: true }]}>
            <Select options={campaignTypeOptions} />
          </Form.Item>
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
            <Form.Item name="tripTarget" label="Trip Target" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
            <Form.Item name="rewardPoints" label="Reward Points" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="targetTiers" label="Target Tiers">
            <Select mode="multiple" allowClear options={LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="targetCities" label="Target Cities">
            <Select mode="multiple" allowClear options={cityOptions} />
          </Form.Item>
          <Form.Item name="targetDrivers" label="Target Drivers">
            <InputNumber min={0} className="w-full" placeholder="Optional cap" />
          </Form.Item>
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
          </div>
          <Form.Item name="budget" label="Budget" rules={[{ required: true }]}>
            <InputNumber min={0} className="w-full" prefix="$" />
          </Form.Item>
          <Form.Item name="enabled" label="Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select options={[
              { value: 'active', label: 'Active' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'paused', label: 'Paused' },
              { value: 'ended', label: 'Ended' },
            ]} />
          </Form.Item>
        </Form>
      </Drawer>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
