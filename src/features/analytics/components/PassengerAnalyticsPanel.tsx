import { LineTrendChart } from '@/components/charts/AnalyticsCharts'
import { useGetPassengerAnalyticsQuery } from '@/redux/api/analyticsApi'
import { ChartPanelWrapper } from './ChartPanelWrapper'

export function PassengerAnalyticsPanel() {
  const { data = [], isLoading, error } = useGetPassengerAnalyticsQuery()

  const chartData = data.map((item) => ({
    label: item.month,
    period: item.period,
    value: item.cumulative,
    secondary: item.count,
  }))

  return (
    <ChartPanelWrapper
      title="Passenger Growth"
      subtitle="Passenger acquisition and engagement"
      isLoading={isLoading}
      error={error}
      loadingMessage="Loading passenger analytics..."
      errorMessage="Failed to load passenger analytics data."
    >
      <LineTrendChart
        data={chartData}
        color="#10b981"
        name="Cumulative Passengers"
        secondaryColor="#22d3ee"
        secondaryName="New Passengers"
      />
    </ChartPanelWrapper>
  )
}
