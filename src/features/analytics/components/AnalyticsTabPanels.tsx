import { CategoryPieChart, ChartCard, LineTrendChart, RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import {
  useGetCategoryUsageQuery,
  useGetDemandTrendQuery,
  useGetGrowthTrendQuery,
  useGetRevenueTrendQuery,
} from '@/services/api'

export function DriverAnalyticsPanel() {
  const { data = [] } = useGetGrowthTrendQuery()
  return (
    <ChartCard title="Driver Growth" subtitle="Driver acquisition and retention">
      <LineTrendChart data={data} />
    </ChartCard>
  )
}

export function PassengerAnalyticsPanel() {
  const { data = [] } = useGetGrowthTrendQuery()
  return (
    <ChartCard title="Passenger Growth" subtitle="Passenger acquisition and engagement">
      <LineTrendChart data={data.map((d) => ({ ...d, value: d.value * 6 }))} color="#10b981" />
    </ChartCard>
  )
}

export function RevenueAnalyticsPanel() {
  const { data = [] } = useGetRevenueTrendQuery()
  return (
    <ChartCard title="Revenue Trend" subtitle="Revenue breakdown and trend analysis">
      <RevenueTrendChart data={data} />
    </ChartCard>
  )
}

export function DemandAnalyticsPanel() {
  const { data = [] } = useGetDemandTrendQuery()
  return (
    <ChartCard title="Demand by Hour" subtitle="Demand patterns and forecasting insights">
      <LineTrendChart data={data} color="#22d3ee" />
    </ChartCard>
  )
}

export function ComplianceAnalyticsPanel() {
  const { data = [] } = useGetCategoryUsageQuery()
  return (
    <ChartCard title="Document Status Distribution" subtitle="Compliance status distribution and trends">
      <CategoryPieChart data={data} />
    </ChartCard>
  )
}
