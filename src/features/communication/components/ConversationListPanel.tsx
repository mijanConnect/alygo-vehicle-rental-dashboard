import { Spin } from 'antd'
import type { Conversation } from '@/types/communication'
import { ConversationCard } from '@/features/communication/components/ConversationCard'

interface ConversationListPanelProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
  title?: string
}

export function ConversationListPanel({
  conversations,
  selectedId,
  onSelect,
  isLoading,
  title = 'Conversation List',
}: ConversationListPanelProps) {
  return (
    <section className="flex h-full flex-col border-r border-white/5 bg-white/1">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0d0f14]/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-alygo-text-muted">{conversations.length} chats</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spin />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center text-sm text-alygo-text-muted">
            <p>No conversations match your filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                conversation={conversation}
                selected={selectedId === conversation.id}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
