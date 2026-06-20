import { Button } from 'antd'
import { Download } from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { CategoryPieChart, ChartCard, LineTrendChart, RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import { AdminActionHost } from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetCategoryUsageQuery,
  useGetDemandTrendQuery,
  useGetGrowthTrendQuery,
  useGetRevenueTrendQuery,
} from '@/services/api'

function AnalyticsShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const adminActions = useAdminActions()

  return (
    <PageShell
      title={title}
      description={description}
      actions={
        <>
          <Button icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported as CSV')}>Export CSV</Button>
          <Button icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported as PDF')}>Export PDF</Button>
          <Button type="primary" icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported as Excel')}>Export Excel</Button>
        </>
      }
    >
      {children}
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}

export function DriverAnalyticsPage() {
  useDocumentTitle('Driver Analytics')
  const { data = [] } = useGetGrowthTrendQuery()
  return (
    <AnalyticsShell title="Driver Analytics" description="Driver growth, retention, and performance metrics.">
      <ChartCard title="Driver Growth"><LineTrendChart data={data} /></ChartCard>
    </AnalyticsShell>
  )
}

export function PassengerAnalyticsPage() {
  useDocumentTitle('Passenger Analytics')
  const { data = [] } = useGetGrowthTrendQuery()
  return (
    <AnalyticsShell title="Passenger Analytics" description="Passenger acquisition and engagement analytics.">
      <ChartCard title="Passenger Growth"><LineTrendChart data={data.map((d) => ({ ...d, value: d.value * 6 }))} color="#10b981" /></ChartCard>
    </AnalyticsShell>
  )
}

export function RevenueAnalyticsPage() {
  useDocumentTitle('Revenue Analytics')
  const { data = [] } = useGetRevenueTrendQuery()
  return (
    <AnalyticsShell title="Revenue Analytics" description="Revenue breakdown and trend analysis.">
      <ChartCard title="Revenue Trend"><RevenueTrendChart data={data} /></ChartCard>
    </AnalyticsShell>
  )
}

export function DemandAnalyticsPage() {
  useDocumentTitle('Demand Analytics')
  const { data = [] } = useGetDemandTrendQuery()
  return (
    <AnalyticsShell title="Demand Analytics" description="Demand patterns and forecasting insights.">
      <ChartCard title="Demand by Hour"><LineTrendChart data={data} color="#22d3ee" /></ChartCard>
    </AnalyticsShell>
  )
}

export function ComplianceAnalyticsPage() {
  useDocumentTitle('Compliance Analytics')
  const { data = [] } = useGetCategoryUsageQuery()
  return (
    <AnalyticsShell title="Compliance Analytics" description="Compliance status distribution and trends.">
      <ChartCard title="Document Status Distribution"><CategoryPieChart data={data} /></ChartCard>
    </AnalyticsShell>
  )
}

export default DriverAnalyticsPage
