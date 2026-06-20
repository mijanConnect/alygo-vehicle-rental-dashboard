import { List, Tag } from 'antd'
import { Activity, AlertTriangle, Car, Shield } from 'lucide-react'
import type { ActivityItem } from '@/types'
import { formatDateTime } from '@/utils/format'

const severityConfig = {
  info: { color: 'blue', icon: Activity },
  success: { color: 'green', icon: Car },
  warning: { color: 'gold', icon: AlertTriangle },
  error: { color: 'red', icon: Shield },
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  title?: string
}

export function ActivityFeed({ activities, title = 'Real-Time Activity Feed' }: ActivityFeedProps) {
  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
      <List
        dataSource={activities}
        renderItem={(item) => {
          const config = severityConfig[item.severity ?? 'info']
          const Icon = config.icon
          return (
            <List.Item className="!border-white/5 !px-0">
              <div className="flex gap-3">
                <div className="mt-1 rounded-lg bg-white/5 p-2">
                  <Icon className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <Tag color={config.color}>{item.type}</Tag>
                  </div>
                  <p className="mt-1 text-sm text-alygo-text-muted">{item.description}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.timestamp)}</p>
                </div>
              </div>
            </List.Item>
          )
        }}
      />
    </div>
  )
}
