import { Badge, Tag } from 'antd'
import type { Conversation } from '@/types/communication'
import {
  avatarUrl,
  formatRelativeActivity,
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
  userTypeLabel,
} from '@/features/communication/communicationHelpers'

interface ConversationCardProps {
  conversation: Conversation
  selected: boolean
  onSelect: () => void
}

export function ConversationCard({ conversation, selected, onSelect }: ConversationCardProps) {
  const priorityClass =
    conversation.priority === 'critical'
      ? 'border-red-500/40 bg-red-500/5'
      : conversation.priority === 'high'
        ? 'border-amber-500/30 bg-amber-500/5'
        : 'border-white/5 bg-white/[0.02]'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border p-3 text-left transition-all ${
        selected
          ? 'border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/30'
          : `${priorityClass} hover:border-white/15 hover:bg-white/4`
      }`}
    >
      <div className="flex gap-3">
        <img
          src={avatarUrl(conversation.userName)}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-indigo-950 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{conversation.userName}</p>
              <p className="text-[11px] uppercase tracking-wide text-alygo-text-muted">
                {userTypeLabel(conversation.userType)}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-alygo-text-muted">
              {formatRelativeActivity(conversation.lastActivity)}
            </span>
          </div>

          <p className="mt-1.5 line-clamp-2 text-sm text-alygo-text-muted">{conversation.lastMessage}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag color={priorityColor(conversation.priority)} className="m-0! text-[10px]!">
              {priorityLabel(conversation.priority)}
            </Tag>
            <Tag color={statusColor(conversation.status)} className="m-0! text-[10px]!">
              {statusLabel(conversation.status)}
            </Tag>
            {conversation.unreadCount > 0 && (
              <Badge count={conversation.unreadCount} size="small" className="ml-auto" />
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
