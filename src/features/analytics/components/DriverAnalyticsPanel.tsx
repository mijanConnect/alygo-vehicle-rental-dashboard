import { LineTrendChart } from '@/components/charts/AnalyticsCharts'
import { useGetDriverAnalyticsQuery } from '@/redux/api/analyticsApi'
import { ChartPanelWrapper } from './ChartPanelWrapper'

export function DriverAnalyticsPanel() {
  const { data = [], isLoading, error } = useGetDriverAnalyticsQuery()

  const chartData = data.map((item) => ({
    label: item.month,
    period: item.period,
    value: item.cumulative,
    secondary: item.count,
  }))

  return (
    <ChartPanelWrapper
      title="Driver Growth"
      subtitle="Driver acquisition and retention"
      isLoading={isLoading}
      error={error}
      loadingMessage="Loading driver analytics..."
      errorMessage="Failed to load driver analytics data."
    >
      <LineTrendChart
        data={chartData}
        name="Cumulative Drivers"
        secondaryColor="#22d3ee"
        secondaryName="New Drivers"
      />
    </ChartPanelWrapper>
  )
}
