import { Input, Select, Switch } from 'antd'
import { Filter, History, Search } from 'lucide-react'
import type { ConversationPriority, ConversationStatus } from '@/types/communication'
import {
  CURRENT_SUPPORT_AGENT,
  INBOX_CATEGORIES,
  type InboxCategoryKey,
  OPEN_STATUSES,
} from '@/features/communication/communicationHelpers'
import { PRIORITY_LABELS, STATUS_LABELS } from '@/services/communicationApi'

interface ConversationSidebarProps {
  activeCategory: InboxCategoryKey
  onCategoryChange: (key: InboxCategoryKey) => void
  search: string
  onSearchChange: (value: string) => void
  assignedToMe: boolean
  onAssignedToMeChange: (value: boolean) => void
  priorityFilter: ConversationPriority | ''
  onPriorityFilterChange: (value: ConversationPriority | '') => void
  statusFilter: ConversationStatus | ''
  onStatusFilterChange: (value: ConversationStatus | '') => void
  unreadCount: number
  openCount: number
  onOpenHistory?: () => void
}

export function ConversationSidebar({
  activeCategory,
  onCategoryChange,
  search,
  onSearchChange,
  assignedToMe,
  onAssignedToMeChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
  unreadCount,
  openCount,
  onOpenHistory,
}: ConversationSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-white/5 bg-black/20">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0d0f14]/95 p-3 backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">
          Conversation Categories
        </p>
        <Input
          prefix={<Search className="h-3.5 w-3.5 text-alygo-text-muted" />}
          placeholder="Search conversations"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          size="small"
          allowClear
          className="!rounded-lg !border-white/10 !bg-white/5"
        />
        <div className="mt-2 flex gap-2">
          <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase text-alygo-text-muted">Unread</p>
            <p className="text-sm font-semibold text-white">{unreadCount}</p>
          </div>
          <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase text-alygo-text-muted">Open</p>
            <p className="text-sm font-semibold text-white">{openCount}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {INBOX_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => onCategoryChange(cat.key)}
            className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              activeCategory === cat.key
                ? 'bg-indigo-600/25 text-indigo-200'
                : 'text-alygo-text-muted hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </nav>

      <div className="sticky bottom-0 border-t border-white/5 bg-[#0d0f14]/95 p-3 backdrop-blur">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-alygo-text-muted">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-alygo-text-muted">Assigned to me</span>
            <Switch size="small" checked={assignedToMe} onChange={onAssignedToMeChange} />
          </div>
          <Select
            size="small"
            placeholder="Priority"
            value={priorityFilter || undefined}
            onChange={onPriorityFilterChange}
            allowClear
            className="w-full"
            options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Select
            size="small"
            placeholder="Status"
            value={statusFilter || undefined}
            onChange={onStatusFilterChange}
            allowClear
            className="w-full"
            options={Object.entries(STATUS_LABELS)
              .filter(([value]) => OPEN_STATUSES.includes(value as typeof OPEN_STATUSES[number]) || ['resolved', 'closed'].includes(value))
              .map(([value, label]) => ({ value, label }))}
          />
          <p className="text-[10px] text-alygo-text-muted">Agent: {CURRENT_SUPPORT_AGENT}</p>
        </div>
        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-alygo-text-muted hover:bg-white/5 hover:text-white"
          >
            <History className="h-3.5 w-3.5" />
            Communication History
          </button>
        )}
      </div>
    </aside>
  )
}
