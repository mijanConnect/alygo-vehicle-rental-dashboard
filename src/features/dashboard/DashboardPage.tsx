import { Button, Table, Tag } from 'antd'
// import { Download, RefreshCw } from 'lucide-react'
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
  createTableRowProps,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetDashboardCategoryUsageQuery,
  useGetDashboardDemandChartQuery,
  useGetDashboardDriverGrowthQuery,
  useGetDashboardPassengerGrowthQuery,
  useGetDashboardRevenueChartQuery,
  useGetDashboardSummaryQuery,
  useGetDashboardTopAirportsQuery,
  useGetDashboardTopCitiesQuery,
} from '@/redux/api/dashboardOverviewApi'
import { useGetLiveTripsQuery, type LiveTrip } from '@/redux/api/liveTripApi'
import { useAppSelector } from '@/store/hooks'
import { formatCurrency, formatDateTime } from '@/utils/format'

export default function DashboardPage() {
  useDocumentTitle('Executive Dashboard')
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const liveKpis = useAppSelector((state) => state.auth.liveKpis)

  const summaryQuery = useGetDashboardSummaryQuery()
  const revenueQuery = useGetDashboardRevenueChartQuery()
  const demandQuery = useGetDashboardDemandChartQuery()
  const driverGrowthQuery = useGetDashboardDriverGrowthQuery()
  const passengerGrowthQuery = useGetDashboardPassengerGrowthQuery()
  const categoryQuery = useGetDashboardCategoryUsageQuery()
  const citiesQuery = useGetDashboardTopCitiesQuery()
  const airportsQuery = useGetDashboardTopAirportsQuery()
  const liveTripsQuery = useGetLiveTripsQuery({ page: 1, limit: 5 })

  const kpis = summaryQuery.data ?? []
  const revenueTrend = revenueQuery.data ?? []
  const demandTrend = demandQuery.data ?? []
  const driverGrowth = driverGrowthQuery.data ?? []
  const passengerGrowth = passengerGrowthQuery.data ?? []
  const categoryUsage = categoryQuery.data ?? []
  const topCities = citiesQuery.data ?? []
  const topAirports = airportsQuery.data ?? []
  const liveTrips = liveTripsQuery.data?.data ?? []


  const getLiveValue = (key: string) => {
    if (liveKpis[key] !== undefined) return liveKpis[key]
    if (key === 'revenueThisMonth') return liveKpis.revenueMonth
    if (key === 'revenueMonth') return liveKpis.revenueThisMonth
    if (key === 'driverApprovalQueue') return liveKpis.approvalQueue
    if (key === 'approvalQueue') return liveKpis.driverApprovalQueue
    if (key === 'airportQueueCount') return liveKpis.airportQueue
    if (key === 'airportQueue') return liveKpis.airportQueueCount
    return undefined
  }

  return (
    <PageShell
      title="Executive Dashboard"
      description="Real-time overview of platform performance, operations, and compliance health."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {kpis.slice(0, 8).map((metric) => (
          <KpiCard
            key={metric.key}
            metric={metric}
            liveValue={getLiveValue(metric.key)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard title="Revenue Trend" subtitle="Daily revenue" className="xl:col-span-2">
          <RevenueTrendChart data={revenueTrend} />
        </ChartCard>
        <ChartCard title="Demand Trend" subtitle="Hourly ride requests">
          <LineTrendChart data={demandTrend} color="#22d3ee" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Driver Growth">
          <LineTrendChart data={driverGrowth} />
        </ChartCard>
        <ChartCard title="Passenger Growth">
          <LineTrendChart data={passengerGrowth} color="#10b981" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ChartCard title="Top Cities" subtitle="Revenue by market">
          <BarTrendChart data={topCities.slice(0, 5)} />
        </ChartCard>
        <ChartCard title="Category Usage">
          <CategoryPieChart data={categoryUsage} />
        </ChartCard>
        <ChartCard title="Top Airports" subtitle="Trip volume">
          <BarTrendChart data={topAirports} />
        </ChartCard>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Live Trip Overview</h3>
        <Table
          size="small"
          loading={liveTripsQuery.isLoading || liveTripsQuery.isFetching}
          pagination={false}
          dataSource={liveTrips}
          rowKey="_id"
          {...createTableRowProps<LiveTrip>((record) =>
            navigate(`/operations/live-trips/${record._id}`),
          )}
          columns={[
            {
              title: 'Trip',
              dataIndex: '_id',
              render: (id: string) => (
                <Link to={`/operations/live-trips/${id}`} onClick={(e) => e.stopPropagation()}>
                  <span className="font-mono text-xs">{id.slice(-8)}</span>
                </Link>
              ),
            },
            {
              title: 'Driver',
              key: 'driver',
              render: (_: unknown, record: LiveTrip) =>
                record.driver?.name?.trim() || 'Unassigned',
            },
            {
              title: 'City',
              dataIndex: 'city',
              render: (city: string) => city?.trim() || '—',
            },
            {
              title: 'Category',
              dataIndex: 'category',
              render: (c: string) => <Tag>{c || '—'}</Tag>,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: string) => <StatusBadge status={s} />,
            },
            {
              title: 'Fare',
              dataIndex: 'fare',
              render: (f: number) => formatCurrency(f),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              render: (createdAt: string) => formatDateTime(createdAt),
            },
            {
              title: 'Action',
              key: 'action',
              width: 100,
              render: (_: unknown, record: LiveTrip) => (
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/operations/live-trips/${record._id}`)
                  }}
                >
                  Details
                </Button>
              ),
            },
          ]}
        />
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
