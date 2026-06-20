import { useGetComplianceOverviewQuery } from '@/services/complianceCenterApi'

export function ComplianceOverviewCards() {
  const { data, isLoading } = useGetComplianceOverviewQuery()

  const metrics = [
    { label: 'Pending Background Checks', value: data?.pendingBackgroundChecks ?? '—' },
    { label: 'Expired Documents', value: data?.expiredDocuments ?? '—' },
    { label: 'Restricted Drivers', value: data?.restrictedDrivers ?? '—' },
    { label: 'Pending Reviews', value: data?.pendingReviews ?? '—' },
    {
      label: 'Compliance Score',
      value: data ? `${data.complianceScore}%` : '—',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">{m.label}</p>
          <p className={`mt-2 text-2xl font-semibold text-white ${isLoading ? 'opacity-50' : ''}`}>
            {m.value}
          </p>
        </div>
      ))}
    </div>
  )
}
