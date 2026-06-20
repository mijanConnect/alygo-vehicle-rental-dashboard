import { useState } from 'react'
import { Form, Input, InputNumber, Modal, Switch, Table, Tag } from 'antd'
import { Pencil, Power, PowerOff } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  openSurgeDetails,
} from '@/components/admin'
import type { ActionMenuItem } from '@/components/admin/types'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useGetSurgeZonesQuery } from '@/services/api'
import type { SurgeZone } from '@/types'

export function ZonePricingPanel() {
  const adminActions = useAdminActions()
  const { data: zones = [], isLoading } = useGetSurgeZonesQuery()
  const [localZones, setLocalZones] = useState<SurgeZone[] | null>(null)
  const [editZone, setEditZone] = useState<SurgeZone | null>(null)
  const [form] = Form.useForm()

  const displayZones = localZones ?? zones

  const toggleActive = (zone: SurgeZone) => {
    const update = (list: SurgeZone[]) =>
      list.map((z) => (z.id === zone.id ? { ...z, active: !z.active } : z))
    setLocalZones(update(displayZones))
    adminActions.notify(
      `${zone.name} surge ${zone.active ? 'deactivated' : 'activated'}`,
    )
  }

  const openEdit = (zone: SurgeZone) => {
    setEditZone(zone)
    form.setFieldsValue({
      multiplier: zone.multiplier,
      overrideRule: zone.active ? 'Standard surge curve' : 'Surge disabled',
    })
  }

  const saveEdit = (values: { multiplier: number; overrideRule: string }) => {
    if (!editZone) return
    const update = (list: SurgeZone[]) =>
      list.map((z) =>
        z.id === editZone.id ? { ...z, multiplier: values.multiplier } : z,
      )
    setLocalZones(update(displayZones))
    adminActions.notify(`${editZone.name} pricing updated`)
    setEditZone(null)
  }

  const actionItems = (zone: SurgeZone): ActionMenuItem[] => [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    {
      key: 'toggle',
      label: zone.active ? 'Deactivate' : 'Activate',
      icon: zone.active ? PowerOff : Power,
      group: 1,
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">
        Zone definitions are managed in Location Management. This module only controls pricing multipliers,
        surge rules, and analytics.
      </p>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={displayZones}
        scroll={{ x: 1000 }}
        {...createTableRowProps<SurgeZone>((record) => openSurgeDetails(record, adminActions))}
        columns={[
          { title: 'Zone', dataIndex: 'name' },
          { title: 'City', dataIndex: 'city' },
          {
            title: 'Zone Multiplier',
            dataIndex: 'multiplier',
            render: (m: number) => <Tag color="orange">{m}x</Tag>,
          },
          { title: 'Demand', dataIndex: 'demand' },
          { title: 'Supply', dataIndex: 'supply' },
          {
            title: 'Override Rule',
            render: (_, record) => (record.active ? 'Standard surge curve' : 'Surge disabled'),
          },
          {
            title: 'Surge Status',
            dataIndex: 'active',
            render: (active: boolean) => (
              <Tag color={active ? 'success' : 'default'}>{active ? 'Active' : 'Inactive'}</Tag>
            ),
          },
          createActionsColumn<SurgeZone>(
            (record) => actionItems(record),
            (key, record) => {
              if (key === 'edit') openEdit(record)
              else if (key === 'toggle') toggleActive(record)
            },
          ),
        ]}
      />

      {editZone && (
        <Modal
          title={`Edit Zone Pricing — ${editZone.name}`}
          open
          onCancel={() => setEditZone(null)}
          onOk={() => form.submit()}
          destroyOnClose
        >
          <Form form={form} layout="vertical" className="mt-4" onFinish={saveEdit}>
            <Form.Item name="multiplier" label="Zone Multiplier" rules={[{ required: true }]}>
              <InputNumber min={1} max={10} step={0.1} className="w-full" addonAfter="x" />
            </Form.Item>
            <Form.Item name="overrideRule" label="Zone Override Rules">
              <Input placeholder="e.g. Cap at 3.5x during events" />
            </Form.Item>
            <Form.Item label="Surge Active">
              <Switch checked={editZone.active} disabled checkedChildren="ON" unCheckedChildren="OFF" />
            </Form.Item>
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </div>
  )
}
