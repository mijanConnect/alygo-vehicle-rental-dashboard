import { Button, Form, Input, Select, Table, Tag } from 'antd'
import { Send } from 'lucide-react'
import { useState } from 'react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  BROADCAST_TARGET_LABELS,
  BROADCAST_TYPE_LABELS,
  useGetBroadcastsQuery,
  useSendBroadcastMutation,
} from '@/services/communicationApi'

const targetOptions = Object.entries(BROADCAST_TARGET_LABELS).map(([value, label]) => ({ value, label }))
const typeOptions = Object.entries(BROADCAST_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export function BroadcastCenter() {
  const adminActions = useAdminActions()
  const { data: history = [], isLoading } = useGetBroadcastsQuery()
  const [sendBroadcast, { isLoading: sending }] = useSendBroadcastMutation()
  const [targetValue, setTargetValue] = useState('')

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm text-alygo-text-muted">
          Send platform-wide announcements to drivers and passengers with targeted delivery options.
        </p>
        <Form
          layout="vertical"
          onFinish={async (values) => {
            await sendBroadcast({
              ...values,
              targetValue: values.target === 'city' || values.target === 'state' ? targetValue : undefined,
            }).unwrap()
            adminActions.notify('Broadcast sent successfully')
          }}
        >
          <Form.Item name="title" label="Announcement Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Platform Maintenance Tonight" />
          </Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="Enter announcement message..." />
          </Form.Item>
          <Form.Item name="broadcastType" label="Broadcast Type" rules={[{ required: true }]}>
            <Select options={typeOptions} placeholder="Select type" />
          </Form.Item>
          <Form.Item name="target" label="Target Audience" rules={[{ required: true }]}>
            <Select options={targetOptions} placeholder="Select audience" onChange={() => setTargetValue('')} />
          </Form.Item>
          <Form.Item label="Target Value (City/State)" extra="Required when targeting by city or state">
            <Input
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="e.g. San Francisco or California"
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={sending} icon={<Send className="h-4 w-4" />}>
            Send Broadcast
          </Button>
        </Form>
      </div>

      <div>
        <h4 className="mb-3 font-semibold text-white">Broadcast History</h4>
        <Table
          loading={isLoading}
          rowKey="id"
          dataSource={history}
          scroll={{ x: 1000 }}
          columns={[
            { title: 'Title', dataIndex: 'title' },
            { title: 'Type', dataIndex: 'broadcastType', render: (t: string) => <Tag>{BROADCAST_TYPE_LABELS[t] ?? t}</Tag> },
            { title: 'Target', dataIndex: 'target', render: (t: string, r) => `${BROADCAST_TARGET_LABELS[t] ?? t}${r.targetValue ? ` — ${r.targetValue}` : ''}` },
            { title: 'Recipients', dataIndex: 'recipientCount' },
            { title: 'Sent By', dataIndex: 'sentBy' },
            { title: 'Sent At', dataIndex: 'sentAt', render: (d: string) => new Date(d).toLocaleString() },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={s === 'sent' ? 'success' : 'default'}>{s}</Tag> },
          ]}
        />
      </div>
    </div>
  )
}
