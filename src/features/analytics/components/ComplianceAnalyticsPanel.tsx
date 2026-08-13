import { CategoryPieChart, ChartCard } from '@/components/charts/AnalyticsCharts'
import { useGetCategoryUsageQuery } from '@/services/api'

export function ComplianceAnalyticsPanel() {
  const { data = [] } = useGetCategoryUsageQuery()

  return (
    <ChartCard title="Document Status Distribution" subtitle="Compliance status distribution and trends">
      <CategoryPieChart data={data} />
    </ChartCard>
  )
}
