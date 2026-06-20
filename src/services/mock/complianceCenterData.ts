import { mockComplianceDocs, mockDrivers } from '@/services/mock/data'
import type {
  BackgroundCheckRecord,
  BackgroundCheckStatus,
  ComplianceListParams,
  ComplianceListResponse,
  ComplianceOverview,
  DocumentMonitorRecord,
  DriverRestrictionRecord,
} from '@/types/complianceCenter'

const providers = ['Checkr', 'Sterling', 'HireRight', 'Accurate Background']

export const mockBackgroundCheckRecords: BackgroundCheckRecord[] = mockDrivers.slice(0, 18).map(
  (driver, i) => {
    const status = (['pending', 'in_review', 'approved', 'rejected'] as BackgroundCheckStatus[])[
      i % 4
    ]
    const submittedAt = new Date(Date.now() - i * 86400000 * 4).toISOString()
    const completedAt =
      status === 'approved' || status === 'rejected'
        ? new Date(Date.now() - i * 86400000 * 2).toISOString()
        : undefined

    return {
      id: `BC-${3000 + i}`,
      driverId: driver.id,
      driverName: driver.name,
      provider: providers[i % providers.length],
      status,
      submittedAt,
      completedAt,
    }
  },
)

export const mockDriverRestrictions: DriverRestrictionRecord[] = [
  {
    id: 'DR-1',
    driverId: mockDrivers[0].id,
    driverName: mockDrivers[0].name,
    reason: 'Expired vehicle inspection',
    restrictedCategories: ['Black', 'Black SUV'],
    restrictionEndDate: '2026-06-20T00:00:00Z',
    status: 'active',
  },
  {
    id: 'DR-2',
    driverId: mockDrivers[2].id,
    driverName: mockDrivers[2].name,
    reason: 'Background check pending review',
    restrictedCategories: ['Black', 'Priority'],
    status: 'active',
  },
  {
    id: 'DR-3',
    driverId: mockDrivers[5].id,
    driverName: mockDrivers[5].name,
    reason: 'Commercial insurance expired',
    restrictedCategories: ['XL', 'Black SUV'],
    restrictionEndDate: '2026-07-01T00:00:00Z',
    status: 'active',
  },
  {
    id: 'DR-4',
    driverId: mockDrivers[8].id,
    driverName: mockDrivers[8].name,
    reason: 'Document verification failed',
    restrictedCategories: ['Comfort'],
    restrictionEndDate: '2026-05-30T00:00:00Z',
    status: 'inactive',
  },
]

function daysUntil(date?: string): number | null {
  if (!date) return null
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
}

export function buildDocumentMonitorRecords(): DocumentMonitorRecord[] {
  return mockComplianceDocs
    .filter((doc) => doc.type !== 'Background Check')
    .map((doc) => ({
      id: doc.id,
      driverId: doc.driverId,
      driverName: doc.driverName,
      documentType: doc.type,
      expiryDate: doc.expiresAt,
      daysRemaining: daysUntil(doc.expiresAt),
      status: doc.status,
    }))
}

export function computeComplianceOverview(): ComplianceOverview {
  const pendingBackgroundChecks = mockBackgroundCheckRecords.filter(
    (b) => b.status === 'pending' || b.status === 'in_review',
  ).length
  const expiredDocuments = mockComplianceDocs.filter((d) => d.status === 'expired').length
  const restrictedDrivers = mockDriverRestrictions.filter((r) => r.status === 'active').length
  const pendingReviews = mockComplianceDocs.filter((d) => d.status === 'pending').length
  const approved = mockComplianceDocs.filter((d) => d.status === 'approved').length
  const complianceScore = Math.round((approved / mockComplianceDocs.length) * 100)

  return {
    pendingBackgroundChecks,
    expiredDocuments,
    restrictedDrivers,
    pendingReviews,
    complianceScore,
  }
}

export function paginateComplianceList<T>(
  items: T[],
  params: ComplianceListParams,
  searchFields: (keyof T)[],
): ComplianceListResponse<T> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()

  let filtered = [...items]

  if (search) {
    filtered = filtered.filter((item) =>
      searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(search)),
    )
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}
