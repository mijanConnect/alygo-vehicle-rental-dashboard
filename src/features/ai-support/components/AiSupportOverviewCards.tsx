import {
  CircleHelp,
  Clock3,
  Coins,
  MessageCircleQuestion,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import {
  useAiSupportOverviewStatsQuery,
  type AiSupportOverviewStats,
} from '@/redux/api/aiSupportApi'
import { formatNumber } from '@/utils/format'

const kpiConfig: {
  key: keyof Pick<
    AiSupportOverviewStats,
    | 'totalQuestions'
    | 'questionsToday'
    | 'avgResponseTime'
    | 'helpfulPct'
    | 'notHelpfulPct'
    | 'totalTokens'
    | 'avgTokens'
    | 'estimatedCost'
  >
  label: string
  icon: typeof MessageCircleQuestion
  format?: 'number' | 'ms' | 'percent' | 'currency'
}[] = [
  { key: 'totalQuestions', label: 'Total Questions', icon: MessageCircleQuestion },
  { key: 'questionsToday', label: 'Questions Today', icon: CircleHelp },
  { key: 'avgResponseTime', label: 'Avg Response Time', icon: Clock3, format: 'ms' },
  { key: 'helpfulPct', label: 'Helpful', icon: ThumbsUp, format: 'percent' },
  { key: 'notHelpfulPct', label: 'Not Helpful', icon: ThumbsDown, format: 'percent' },
  { key: 'totalTokens', label: 'Total Tokens', icon: Coins },
  { key: 'avgTokens', label: 'Avg Tokens', icon: Coins },
  { key: 'estimatedCost', label: 'Estimated Cost', icon: Coins, format: 'currency' },
]

function formatStatValue(
  value: number,
  format: 'number' | 'ms' | 'percent' | 'currency' = 'number',
) {
  if (format === 'ms') {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}s`
    return `${Math.round(value)}ms`
  }
  if (format === 'percent') return `${value}%`
  if (format === 'currency') return `$${value.toFixed(4)}`
  return formatNumber(value)
}

export function AiSupportOverviewCards() {
  const { data, isLoading } = useAiSupportOverviewStatsQuery()

  if (isLoading || !data) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiConfig.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="glass-card p-5">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 w-fit">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="mt-4">
              <p className="text-sm text-alygo-text-muted">{label}</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
                {formatStatValue(data[key] ?? 0, format)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-white">Top Categories</h3>
          <ul className="mt-3 space-y-2">
            {(data.topCategories ?? []).length === 0 ? (
              <li className="text-sm text-alygo-text-muted">No data yet</li>
            ) : (
              data.topCategories.map((item) => (
                <li
                  key={`${item.category}-${item.count}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-alygo-text-muted capitalize">{item.category}</span>
                  <span className="font-medium text-white">{formatNumber(item.count)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-white">Top Asked Questions</h3>
          <ul className="mt-3 space-y-2">
            {(data.topAskedQuestions ?? []).length === 0 ? (
              <li className="text-sm text-alygo-text-muted">No data yet</li>
            ) : (
              data.topAskedQuestions.map((item) => (
                <li
                  key={`${item.question}-${item.count}`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-alygo-text-muted">{item.question}</span>
                  <span className="shrink-0 font-medium text-white">
                    {formatNumber(item.count)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-medium text-white">Most Used Documents</h3>
          <ul className="mt-3 space-y-2">
            {(data.mostUsedDocuments ?? []).length === 0 ? (
              <li className="text-sm text-alygo-text-muted">No data yet</li>
            ) : (
              data.mostUsedDocuments.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className="text-alygo-text-muted">{item.title}</span>
                  <span className="shrink-0 font-medium text-white">
                    {formatNumber(item.count)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
