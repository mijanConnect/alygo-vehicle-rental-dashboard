import { Input, Select, Table, Tag } from 'antd'
import { useMemo, useState } from 'react'
import { useGetCommunicationHistoryQuery } from '@/services/communicationApi'

export function CommunicationHistoryTable() {
  const { data = [], isLoading } = useGetCommunicationHistoryQuery()
  const [driverFilter, setDriverFilter] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('all')

  const filtered = useMemo(() => {
    return data.filter((entry) => {
      if (eventFilter !== 'all' && entry.eventType !== eventFilter) return false
      if (cityFilter && entry.city !== cityFilter) return false
      if (agentFilter && entry.agent !== agentFilter) return false
      if (driverFilter && !entry.userName.toLowerCase().includes(driverFilter.toLowerCase())) return false
      return true
    })
  }, [data, driverFilter, cityFilter, agentFilter, eventFilter])

  const cities = [...new Set(data.map((d) => d.city).filter(Boolean))]

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Complete communication history including messages, attachments, admin actions, status changes, escalations, and internal notes.
      </p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Input placeholder="Filter by user..." value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} allowClear />
        <Select placeholder="Filter by city" value={cityFilter || undefined} onChange={setCityFilter} allowClear options={cities.map((c) => ({ value: c!, label: c! }))} className="w-full" />
        <Input placeholder="Filter by agent..." value={agentFilter} onChange={(e) => setAgentFilter(e.target.value)} allowClear />
        <Select
          value={eventFilter}
          onChange={setEventFilter}
          className="w-full"
          options={[
            { value: 'all', label: 'All Events' },
            { value: 'message', label: 'Messages' },
            { value: 'attachment', label: 'Attachments' },
            { value: 'admin_action', label: 'Admin Actions' },
            { value: 'status_change', label: 'Status Changes' },
            { value: 'escalation', label: 'Escalations' },
            { value: 'note', label: 'Notes' },
          ]}
        />
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={filtered}
        scroll={{ x: 1200 }}
        columns={[
          { title: 'Event', dataIndex: 'eventType', render: (t: string) => <Tag>{t.replace(/_/g, ' ')}</Tag> },
          { title: 'Description', dataIndex: 'description', ellipsis: true },
          { title: 'User', dataIndex: 'userName' },
          { title: 'Type', dataIndex: 'userType', render: (t: string) => <Tag>{t}</Tag> },
          { title: 'Agent', dataIndex: 'agent', render: (a?: string) => a ?? '—' },
          { title: 'Trip', dataIndex: 'tripId', render: (t?: string) => t ?? '—' },
          { title: 'City', dataIndex: 'city', render: (c?: string) => c ?? '—' },
          { title: 'Timestamp', dataIndex: 'timestamp', render: (d: string) => new Date(d).toLocaleString() },
        ]}
      />
    </>
  )
}
