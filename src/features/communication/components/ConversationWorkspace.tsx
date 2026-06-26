import { useMemo, useState } from 'react'
import { Drawer } from 'antd'
import { Menu, X } from 'lucide-react'
import type {
  Conversation,
  ConversationPriority,
  ConversationStatus,
} from '@/types/communication'
import {
  CURRENT_SUPPORT_AGENT,
  INBOX_CATEGORIES,
  OPEN_STATUSES,
  type InboxCategoryKey,
} from '@/features/communication/communicationHelpers'
import { CommunicationHistoryTable } from '@/features/communication/components/CommunicationHistoryTable'
import { ConversationListPanel } from '@/features/communication/components/ConversationListPanel'
import { ConversationSidebar } from '@/features/communication/components/ConversationSidebar'
import { ConversationWorkspacePanel } from '@/features/communication/components/ConversationWorkspacePanel'
import { useGetConversationsQuery } from '@/services/communicationApi'

type MobilePane = 'sidebar' | 'list' | 'workspace'

function matchesCategory(conversation: Conversation, categoryKey: InboxCategoryKey) {
  const config = INBOX_CATEGORIES.find((c) => c.key === categoryKey)
  if (!config || categoryKey === 'all') return true
  if ('userType' in config && config.userType) return conversation.userType === config.userType
  if ('category' in config && config.category) return conversation.category === config.category
  return true
}

export function ConversationWorkspace() {
  const { data: allConversations = [], isLoading } = useGetConversationsQuery()
  const [activeCategory, setActiveCategory] = useState<InboxCategoryKey>('all')
  const [search, setSearch] = useState('')
  const [assignedToMe, setAssignedToMe] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState<ConversationPriority | ''>('')
  const [statusFilter, setStatusFilter] = useState<ConversationStatus | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mobilePane, setMobilePane] = useState<MobilePane>('list')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return allConversations
      .filter((c) => matchesCategory(c, activeCategory))
      .filter((c) => !assignedToMe || c.assignedAgent === CURRENT_SUPPORT_AGENT)
      .filter((c) => !priorityFilter || c.priority === priorityFilter)
      .filter((c) => !statusFilter || c.status === statusFilter)
      .filter(
        (c) =>
          !q ||
          c.userName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
  }, [allConversations, activeCategory, assignedToMe, priorityFilter, statusFilter, search])

  const selected = filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null

  const unreadCount = filtered.reduce((sum, c) => sum + c.unreadCount, 0)
  const openCount = filtered.filter((c) => OPEN_STATUSES.includes(c.status as typeof OPEN_STATUSES[number])).length

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setMobilePane('workspace')
  }

  return (
    <>
      <div className="mb-3 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white"
        >
          <Menu className="h-4 w-4" />
          Categories
        </button>
        {mobilePane === 'workspace' && (
          <button
            type="button"
            onClick={() => setMobilePane('list')}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-alygo-text-muted"
          >
            Back to list
          </button>
        )}
      </div>

      <div className="flex h-[calc(100vh-200px)] min-h-170 overflow-hidden rounded-xl border border-white/5 bg-[#0a0c10]">
        <div className="hidden w-[20%] min-w-55 max-w-70 shrink-0 lg:flex">
          <ConversationSidebar
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            search={search}
            onSearchChange={setSearch}
            assignedToMe={assignedToMe}
            onAssignedToMeChange={setAssignedToMe}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            unreadCount={unreadCount}
            openCount={openCount}
            onOpenHistory={() => setHistoryOpen(true)}
          />
        </div>

        <div
          className={`w-full shrink-0 lg:flex lg:w-[30%] lg:min-w-75 lg:max-w-95 ${
            mobilePane === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ConversationListPanel
            conversations={filtered}
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            isLoading={isLoading}
          />
        </div>

        <div
          className={`min-w-0 flex-1 ${
            mobilePane === 'workspace' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ConversationWorkspacePanel
            conversation={selected}
            showBackButton
            onBack={() => setMobilePane('list')}
          />
        </div>
      </div>

      <Drawer
        title="Conversation Categories"
        placement="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        width={300}
        closeIcon={<X className="h-4 w-4" />}
      >
        <ConversationSidebar
          activeCategory={activeCategory}
          onCategoryChange={(key) => {
            setActiveCategory(key)
            setSidebarOpen(false)
          }}
          search={search}
          onSearchChange={setSearch}
          assignedToMe={assignedToMe}
          onAssignedToMeChange={setAssignedToMe}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          unreadCount={unreadCount}
          openCount={openCount}
          onOpenHistory={() => {
            setHistoryOpen(true)
            setSidebarOpen(false)
          }}
        />
      </Drawer>

      <Drawer
        title="Communication History"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        width={720}
      >
        <CommunicationHistoryTable />
      </Drawer>
    </>
  )
}
