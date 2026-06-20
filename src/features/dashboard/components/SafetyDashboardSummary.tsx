import { AlertTriangle, Shield, Siren } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Table, Tag } from 'antd'
import { useGetSafetyDashboardSummaryQuery } from '@/services/safetyIncidentApi'
import {
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
  typeLabel,
} from '@/features/safety-incidents/safetyIncidentHelpers'
import { formatNumber } from '@/utils/format'

export function SafetyDashboardSummary() {
  const { data, isLoading } = useGetSafetyDashboardSummaryQuery()

  if (isLoading || !data) {
    return (
      <div className="glass-card p-5">
        <div className="h-48 animate-pulse rounded-lg bg-white/5" />
      </div>
    )
  }

  const summaryCards = [
    { key: 'openCases', label: 'Open Cases', icon: AlertTriangle, value: data.openCases },
    { key: 'criticalCases', label: 'Critical Cases', icon: Siren, value: data.criticalCases },
    { key: 'sosAlerts', label: 'SOS Alerts', icon: Shield, value: data.sosAlerts },
  ] as const

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Safety Overview</h3>
          <p className="text-sm text-alygo-text-muted">Active safety cases requiring attention</p>
        </div>
        <Link
          to="/operations/safety-incidents"
          className="text-sm text-indigo-400 hover:text-indigo-300"
        >
          Manage Cases →
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaryCards.map(({ key, label, icon: Icon, value }) => (
          <div key={key} className="rounded-lg border border-white/5 p-4">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-indigo-400" />
              <span className="text-sm text-alygo-text-muted">{label}</span>
            </div>
            <p className="mt-2 text-xl font-semibold text-white">{formatNumber(value)}</p>
          </div>
        ))}
      </div>

      <h4 className="mb-3 text-sm font-medium text-white">Recent Incidents</h4>
      <Table
        size="small"
        pagination={false}
        rowKey="id"
        dataSource={data.recentIncidents}
        columns={[
          {
            title: 'Case ID',
            dataIndex: 'caseId',
            render: (id: string) => (
              <Link to="/operations/safety-incidents" onClick={(e) => e.stopPropagation()}>
                {id}
              </Link>
            ),
          },
          { title: 'Type', dataIndex: 'type', render: (t: string) => <Tag>{typeLabel(t)}</Tag> },
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Priority', dataIndex: 'priority', render: (p: string) => <Tag color={priorityColor(p)}>{priorityLabel(p)}</Tag> },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColor(s)}>{statusLabel(s)}</Tag> },
          { title: 'Created', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleDateString() },
        ]}
      />
    </div>
  )
}
