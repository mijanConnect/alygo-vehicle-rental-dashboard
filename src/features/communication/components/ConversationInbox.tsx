import { useState } from 'react'
import { Badge, Form, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useAssignConversationMutation,
  useGetConversationsQuery,
  useSendMessageMutation,
  useUpdateConversationStatusMutation,
} from '@/services/communicationApi'
import type { Conversation } from '@/types/communication'
import {
  getConversationActionItems,
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
} from '@/features/communication/communicationHelpers'
import { ChatPanel } from '@/features/communication/components/ChatPanel'

const inboxTabs = [
  { key: 'all', label: 'All Conversations' },
  { key: 'driver', label: 'Drivers', userType: 'driver' },
  { key: 'passenger', label: 'Passengers', userType: 'passenger' },
  { key: 'active_trip', label: 'Active Trips', category: 'active_trip' },
  { key: 'safety', label: 'Safety Cases', category: 'safety' },
  { key: 'lost_found', label: 'Lost & Found', category: 'lost_found' },
  { key: 'escalation', label: 'Escalations', category: 'escalation' },
] as const

interface ConversationInboxProps {
  defaultTab?: string
  userTypeFilter?: string
  categoryFilter?: string
  showCases?: boolean
}

export function ConversationInbox({
  defaultTab = 'all',
  userTypeFilter,
  categoryFilter,
}: ConversationInboxProps) {
  const adminActions = useAdminActions()
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assignRecord, setAssignRecord] = useState<Conversation | null>(null)
  const [agentName, setAgentName] = useState('Sarah Kim')

  const tabConfig = inboxTabs.find((t) => t.key === activeTab) ?? inboxTabs[0]
  const filters = {
    userType: userTypeFilter ?? ('userType' in tabConfig ? tabConfig.userType : undefined),
    category: categoryFilter ?? ('category' in tabConfig ? tabConfig.category : undefined),
  }

  const { data = [], isLoading } = useGetConversationsQuery(
    filters.userType || filters.category
      ? { userType: filters.userType, category: filters.category }
      : undefined,
  )
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation()
  const [updateStatus] = useUpdateConversationStatusMutation()
  const [assignConversation, { isLoading: assigning }] = useAssignConversationMutation()

  const selected = data.find((c) => c.id === selectedId) ?? data[0]

  const handleAction = (key: string, record: Conversation) => {
    switch (key) {
      case 'view':
        setSelectedId(record.id)
        break
      case 'assign':
        setAssignRecord(record)
        break
      case 'resolve':
        updateStatus({ id: record.id, status: 'resolved' }).unwrap()
          .then(() => adminActions.notify('Conversation resolved'))
        break
      case 'escalate':
        updateStatus({ id: record.id, status: 'escalated' }).unwrap()
          .then(() => adminActions.notify('Conversation escalated'))
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {inboxTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              activeTab === tab.key
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                : 'text-alygo-text-muted hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Table
            loading={isLoading}
            rowKey="id"
            dataSource={data}
            size="small"
            pagination={{ pageSize: 8, size: 'small' }}
            scroll={{ x: 700 }}
            onRow={(record) => ({
              onClick: () => setSelectedId(record.id),
              className: selected?.id === record.id ? 'bg-indigo-500/10 cursor-pointer' : 'cursor-pointer',
            })}
            columns={[
              {
                title: 'User',
                render: (_: unknown, r: Conversation) => (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{r.userName}</span>
                      {r.unreadCount > 0 && <Badge count={r.unreadCount} size="small" />}
                    </div>
                    <Tag className="mt-1 text-[10px]">{r.userType}</Tag>
                  </div>
                ),
              },
              { title: 'Last Message', dataIndex: 'lastMessage', ellipsis: true, width: 140 },
              { title: 'Priority', dataIndex: 'priority', width: 90, render: (p: string) => <Tag color={priorityColor(p)}>{priorityLabel(p)}</Tag> },
              { title: 'Agent', dataIndex: 'assignedAgent', ellipsis: true, width: 100 },
              { title: 'Status', dataIndex: 'status', width: 100, render: (s: string) => <Tag color={statusColor(s)}>{statusLabel(s)}</Tag> },
              { title: 'Activity', dataIndex: 'lastActivity', width: 110, render: (d: string) => new Date(d).toLocaleTimeString() },
              createActionsColumn<Conversation>(
                (record) => getConversationActionItems(record),
                (key, record) => handleAction(key, record),
              ),
            ]}
          />
        </div>

        <div className="lg:col-span-3">
          {selected ? (
            <ChatPanel
              conversationId={selected.id}
              userName={selected.userName}
              isOnline={selected.isOnline}
              isTyping={selected.isTyping}
              sending={sending}
              onSend={(content) => sendMessage({ conversationId: selected.id, content }).unwrap()}
            />
          ) : (
            <div className="flex h-[560px] items-center justify-center rounded-xl border border-white/5 text-alygo-text-muted">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>

      <Modal
        title={`Assign Agent — ${assignRecord?.userName}`}
        open={Boolean(assignRecord)}
        confirmLoading={assigning}
        onCancel={() => setAssignRecord(null)}
        onOk={async () => {
          if (!assignRecord) return
          await assignConversation({ id: assignRecord.id, agent: agentName }).unwrap()
          adminActions.notify(`Assigned to ${agentName}`)
          setAssignRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Support Agent">
            <Select
              value={agentName}
              onChange={setAgentName}
              options={[
                { value: 'Sarah Kim', label: 'Sarah Kim' },
                { value: 'Mike Torres', label: 'Mike Torres' },
                { value: 'Lisa Park', label: 'Lisa Park' },
                { value: 'Safety Team Alpha', label: 'Safety Team Alpha' },
                { value: 'Compliance Admin', label: 'Compliance Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
