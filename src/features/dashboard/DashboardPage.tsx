import { Button, Table, Tag } from 'antd'
import { Download, RefreshCw } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/dashboard/KpiCard'
import {
  BarTrendChart,
  CategoryPieChart,
  ChartCard,
  LineTrendChart,
  RevenueTrendChart,
} from '@/components/charts/AnalyticsCharts'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  getTripActionItems,
  handleTripAction,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetCategoryUsageQuery,
  useGetDashboardKpisQuery,
  useGetDemandTrendQuery,
  useGetGrowthTrendQuery,
  useGetRevenueTrendQuery,
  useGetTopAirportsQuery,
  useGetTopCitiesQuery,
  useGetTripsQuery,
} from '@/services/api'
import { SafetyDashboardSummary } from '@/features/dashboard/components/SafetyDashboardSummary'
import { useAppSelector } from '@/store/hooks'
import { formatCurrency } from '@/utils/format'
import type { Trip } from '@/types'

export default function DashboardPage() {
  useDocumentTitle('Executive Dashboard')
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const liveKpis = useAppSelector((state) => state.auth.liveKpis)
  const { data: kpis = [], isFetching, refetch } = useGetDashboardKpisQuery()
  const { data: revenueTrend = [] } = useGetRevenueTrendQuery()
  const { data: demandTrend = [] } = useGetDemandTrendQuery()
  const { data: growthTrend = [] } = useGetGrowthTrendQuery()
  const { data: categoryUsage = [] } = useGetCategoryUsageQuery()
  const { data: topCities = [] } = useGetTopCitiesQuery()
  const { data: topAirports = [] } = useGetTopAirportsQuery()
  const { data: liveTrips = [] } = useGetTripsQuery({ status: 'in_progress' })

  return (
    <PageShell
      title="Executive Dashboard"
      description="Real-time overview of platform performance, operations, and compliance health."
      actions={
        <>
          <Button icon={<RefreshCw className="h-4 w-4" />} onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
          <Button type="primary" icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Report exported')}>
            Export Report
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {kpis.map((metric) => (
          <KpiCard key={metric.key} metric={metric} liveValue={liveKpis[metric.key]} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Revenue Trend" subtitle="Daily revenue vs forecast" className="xl:col-span-2">
          <RevenueTrendChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Demand Trend" subtitle="Hourly ride requests">
          <LineTrendChart data={demandTrend} color="#22d3ee" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Driver Growth">
          <LineTrendChart data={growthTrend} />
        </ChartCard>
        <ChartCard title="Passenger Growth">
          <LineTrendChart data={growthTrend.map((d) => ({ ...d, value: d.value * 6 }))} color="#10b981" />
        </ChartCard>
        <ChartCard title="Category Usage">
          <CategoryPieChart data={categoryUsage} />
        </ChartCard>
        <ChartCard title="Top Cities" subtitle="Revenue by market">
          <BarTrendChart data={topCities.slice(0, 5)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Top Airports" subtitle="Trip volume" className="xl:col-span-1">
          <BarTrendChart data={topAirports} />
        </ChartCard>
        <div className="xl:col-span-2">
          <SafetyDashboardSummary />
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Live Trip Overview</h3>
        <Table
          size="small"
          pagination={false}
          dataSource={liveTrips.slice(0, 5)}
          rowKey="id"
          {...createTableRowProps<Trip>((record) => navigate(`/operations/live-trips/${record.id}`))}
          columns={[
            {
              title: 'Trip',
              dataIndex: 'id',
              render: (id: string) => (
                <Link to={`/operations/live-trips/${id}`} onClick={(e) => e.stopPropagation()}>
                  {id}
                </Link>
              ),
            },
            { title: 'Driver', dataIndex: 'driverName' },
            { title: 'City', dataIndex: 'city' },
            { title: 'Category', dataIndex: 'category', render: (c: string) => <Tag>{c}</Tag> },
            { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
            { title: 'Fare', dataIndex: 'fare', render: (f: number) => formatCurrency(f) },
            createActionsColumn<Trip>(
              () => getTripActionItems(),
              (key, record) => handleTripAction(key, record, adminActions, { onNavigate: navigate }),
            ),
          ]}
        />
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
