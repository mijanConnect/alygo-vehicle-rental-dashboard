import {
  AlertTriangle,
  Clock,
  Headphones,
  MessageSquare,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useGetCommunicationOverviewQuery } from '@/services/communicationApi'
import { formatNumber } from '@/utils/format'

const overviewConfig: Array<{
  key: keyof import('@/types/communication').CommunicationOverview
  label: string
  icon: typeof MessageSquare
  format?: 'time'
}> = [
  { key: 'openConversations', label: 'Open Conversations', icon: MessageSquare },
  { key: 'activeSupportAgents', label: 'Active Support Agents', icon: Headphones },
  { key: 'activeDriverChats', label: 'Active Driver Chats', icon: Users },
  { key: 'activePassengerChats', label: 'Active Passenger Chats', icon: Users },
  { key: 'averageResponseTimeMinutes', label: 'Avg Response Time', icon: Clock, format: 'time' },
  { key: 'resolvedConversations', label: 'Resolved Conversations', icon: TrendingUp },
  { key: 'safetyCases', label: 'Safety Cases', icon: Shield },
  { key: 'escalatedCases', label: 'Escalated Cases', icon: AlertTriangle },
]

export function CommunicationOverviewCards() {
  const { data, isLoading } = useGetCommunicationOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewConfig.map(({ key, label, icon: Icon, format }) => (
        <div key={key} className="glass-card p-5">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {format === 'time' ? `${data[key]} min` : formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
