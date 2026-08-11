import {
  CheckCircle2,
  Clock,
  Package,
  PackageCheck,
  PackageX,
  Search,
  Truck,
} from 'lucide-react'
import {
  useGetLostAndFoundOverviewQuery,
  type LostFoundOverviewSummary,
} from '@/redux/api/lostandfound/lostAndFoundApi'
import { formatNumber } from '@/utils/format'

const overviewConfig: {
  key: keyof LostFoundOverviewSummary
  label: string
  icon: typeof Package
}[] = [
  { key: 'totalReports', label: 'Total Reports', icon: Package },
  { key: 'pendingDriverReview', label: 'Pending Driver Review', icon: Clock },
  { key: 'itemsFound', label: 'Items Found', icon: PackageCheck },
  { key: 'itemsNotFound', label: 'Items Not Found', icon: PackageX },
  { key: 'pickupScheduled', label: 'Pickup Scheduled', icon: Search },
  { key: 'deliveryScheduled', label: 'Delivery Scheduled', icon: Truck },
  { key: 'completedReturns', label: 'Completed Returns', icon: CheckCircle2 },
]

export function LostFoundOverviewCards() {
  const { data, isLoading } = useGetLostAndFoundOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5">
              <Icon className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
