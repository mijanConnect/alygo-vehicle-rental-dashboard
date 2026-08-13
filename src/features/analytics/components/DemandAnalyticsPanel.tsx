import { LineTrendChart } from '@/components/charts/AnalyticsCharts'
import { useGetDemandAnalyticsQuery } from '@/redux/api/analyticsApi'
import { ChartPanelWrapper } from './ChartPanelWrapper'

export function DemandAnalyticsPanel() {
  const { data = [], isLoading, error } = useGetDemandAnalyticsQuery()

  const chartData = data.map((item) => ({
    label: item.label,
    value: item.demand,
  }))

  return (
    <ChartPanelWrapper
      title="Demand by Hour"
      subtitle="Demand patterns and forecasting insights"
      isLoading={isLoading}
      error={error}
      loadingMessage="Loading demand analytics..."
      errorMessage="Failed to load demand analytics data."
    >
      <LineTrendChart data={chartData} color="#22d3ee" name="Demand" />
    </ChartPanelWrapper>
  )
}
