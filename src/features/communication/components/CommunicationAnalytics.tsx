import { useEffect } from 'react'
import { Clock, MessageSquare, Star, TrendingUp, Users } from 'lucide-react'
import {
  BarTrendChart,
  ChartCard,
  LineTrendChart,
} from '@/components/charts/AnalyticsCharts'
import { useGetCommunicationAnalyticsQuery } from '@/services/communicationApi'
import { socketService } from '@/services/socket'
import { formatNumber } from '@/utils/format'

const kpiConfig = [
  { key: 'totalConversations', label: 'Total Conversations', icon: MessageSquare },
  { key: 'averageResolutionTimeHours', label: 'Avg Resolution Time', icon: Clock, suffix: ' hrs' },
  { key: 'firstResponseTimeMinutes', label: 'First Response Time', icon: TrendingUp, suffix: ' min' },
  { key: 'escalationRate', label: 'Escalation Rate', icon: Users, suffix: '%' },
  { key: 'satisfactionScore', label: 'Satisfaction Score', icon: Star, suffix: '/5' },
]

export function CommunicationAnalytics() {
  const { data, isLoading, refetch } = useGetCommunicationAnalyticsQuery()

  useEffect(() => {
    const handler = () => refetch()
    socketService.on('communication:stats-update', handler)
    return () => socketService.off('communication:stats-update', handler)
  }, [refetch])

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading analytics...</div>
  }

  const { summary, conversationsPerDay, responseTimeTrend, resolutionRate, safetyCasesTrend, agentPerformance, satisfactionTrend } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiConfig.map(({ key, label, icon: Icon, suffix = '' }) => {
          const value = summary[key as keyof typeof summary]
          return (
            <div key={key} className="glass-card p-5">
              <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="mt-4">
                <p className="text-sm text-alygo-text-muted">{label}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {typeof value === 'number' && key !== 'satisfactionScore' && key !== 'escalationRate'
                    ? formatNumber(value)
                    : value}
                  {suffix}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Conversations Per Day" subtitle="Daily conversation volume this week">
          <BarTrendChart data={conversationsPerDay} />
        </ChartCard>
        <ChartCard title="Response Time Trends" subtitle="Average response time vs first response time">
          <LineTrendChart data={responseTimeTrend} />
        </ChartCard>
        <ChartCard title="Resolution Rate" subtitle="Percentage of conversations resolved same day">
          <LineTrendChart data={resolutionRate} />
        </ChartCard>
        <ChartCard title="Safety Cases Trend" subtitle="Daily safety-related communications">
          <BarTrendChart data={safetyCasesTrend} />
        </ChartCard>
        <ChartCard title="Agent Performance" subtitle="Resolution score by support agent">
          <BarTrendChart data={agentPerformance} />
        </ChartCard>
        <ChartCard title="User Satisfaction" subtitle="Average satisfaction score trend">
          <LineTrendChart data={satisfactionTrend} />
        </ChartCard>
      </div>
    </div>
  )
}
