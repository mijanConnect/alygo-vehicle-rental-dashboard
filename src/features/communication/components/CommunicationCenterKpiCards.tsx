import { Megaphone, MessageSquare, Mail, FolderOpen } from 'lucide-react'
import { useGetCommunicationInboxOverviewQuery } from '@/services/communicationApi'
import { formatNumber } from '@/utils/format'

const kpiConfig = [
  { key: 'totalConversations' as const, label: 'Total Conversations', icon: MessageSquare },
  { key: 'unreadMessages' as const, label: 'Unread Messages', icon: Mail },
  { key: 'openCases' as const, label: 'Open Cases', icon: FolderOpen },
  { key: 'broadcastsSentToday' as const, label: 'Broadcasts Sent Today', icon: Megaphone },
]

export function CommunicationCenterKpiCards() {
  const { data, isLoading } = useGetCommunicationInboxOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpiConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="w-fit rounded-xl bg-indigo-500/10 p-2.5">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
