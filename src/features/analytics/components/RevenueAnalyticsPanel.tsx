import { RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import { useGetRevenueAnalyticsQuery } from '@/redux/api/analyticsApi'
import { formatDate } from '@/utils/format'
import { ChartPanelWrapper } from './ChartPanelWrapper'

export function RevenueAnalyticsPanel() {
  const { data = [], isLoading, error } = useGetRevenueAnalyticsQuery()

  const chartData = data.map((item) => ({
    label: formatDate(item.date, 'MMM D'),
    value: item.revenue,
  }))

  return (
    <ChartPanelWrapper
      title="Revenue Trend"
      subtitle="Revenue breakdown and trend analysis"
      isLoading={isLoading}
      error={error}
      loadingMessage="Loading revenue analytics..."
      errorMessage="Failed to load revenue analytics data."
    >
      <RevenueTrendChart data={chartData} />
    </ChartPanelWrapper>
  )
}
