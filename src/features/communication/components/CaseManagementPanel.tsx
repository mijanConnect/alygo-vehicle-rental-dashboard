import { Form, Input, Select, Tag } from 'antd'
import type { Conversation } from '@/types/communication'
import {
  formatRelativeActivity,
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
} from '@/features/communication/communicationHelpers'
import { PRIORITY_LABELS, STATUS_LABELS } from '@/services/communicationApi'

interface CaseManagementPanelProps {
  conversation: Conversation
  resolutionNotes: string
  onResolutionNotesChange: (value: string) => void
  onPriorityChange: (priority: Conversation['priority']) => void
  onStatusChange: (status: Conversation['status']) => void
  onAssignAgent: (agent: string) => void
  assigning?: boolean
}

const AGENTS = [
  'Sarah Kim',
  'Mike Torres',
  'Lisa Park',
  'Safety Team Alpha',
  'Compliance Admin',
]

export function CaseManagementPanel({
  conversation,
  resolutionNotes,
  onResolutionNotesChange,
  onPriorityChange,
  onStatusChange,
  onAssignAgent,
  assigning,
}: CaseManagementPanelProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
      <h4 className="mb-3 text-sm font-semibold text-white">Case Management</h4>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="mb-1 text-[11px] uppercase text-alygo-text-muted">Priority</p>
          <Select
            size="small"
            value={conversation.priority}
            className="w-full"
            onChange={onPriorityChange}
            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase text-alygo-text-muted">Status</p>
          <Select
            size="small"
            value={conversation.status}
            className="w-full"
            onChange={onStatusChange}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase text-alygo-text-muted">Assigned Agent</p>
          <Select
            size="small"
            value={conversation.assignedAgent}
            className="w-full"
            loading={assigning}
            onChange={onAssignAgent}
            options={AGENTS.map((a) => ({ value: a, label: a }))}
          />
        </div>
        <div>
          <p className="mb-1 text-[11px] uppercase text-alygo-text-muted">Last Activity</p>
          <p className="text-sm text-white">{formatRelativeActivity(conversation.lastActivity)}</p>
          <div className="mt-1 flex gap-1">
            <Tag color={priorityColor(conversation.priority)} className="m-0! text-[10px]!">
              {priorityLabel(conversation.priority)}
            </Tag>
            <Tag color={statusColor(conversation.status)} className="m-0! text-[10px]!">
              {statusLabel(conversation.status)}
            </Tag>
          </div>
        </div>
      </div>
      <Form layout="vertical">
        <Form.Item label="Resolution Notes" className="mb-0!">
          <Input.TextArea
            rows={2}
            value={resolutionNotes}
            onChange={(e) => onResolutionNotesChange(e.target.value)}
            placeholder="Document resolution details visible to support team..."
          />
        </Form.Item>
      </Form>
    </div>
  )
}
