import { useMemo, useState } from 'react'
import { Segmented, Table, Tag } from 'antd'
import {
  LEVEL_LABELS,
  useGetDriverPerformanceQuery,
} from '@/services/driverRewardsApi'
import type { DriverPerformanceRecord, LeaderboardScope } from '@/types/driverRewards'
import { formatCurrency } from '@/utils/format'

type Criteria = 'trips' | 'revenue' | 'rating' | 'acceptance' | 'safety'

const scopeOptions = [
  { label: 'Global', value: 'global' },
  { label: 'City', value: 'city' },
  { label: 'Region', value: 'region' },
  { label: 'Country', value: 'country' },
] as const

const criteriaOptions = [
  { label: 'Trips', value: 'trips' },
  { label: 'Revenue', value: 'revenue' },
  { label: 'Rating', value: 'rating' },
  { label: 'Acceptance Rate', value: 'acceptance' },
  { label: 'Safety Score', value: 'safety' },
] as const

function filterByScope(rows: DriverPerformanceRecord[], scope: LeaderboardScope) {
  if (scope === 'global') return rows
  if (scope === 'city') return rows.filter((r) => r.city === 'San Francisco')
  if (scope === 'region') return rows.filter((r) => r.region === 'Bay Area')
  return rows.filter((r) => r.country === 'United States')
}

function sortByCriteria(rows: DriverPerformanceRecord[], criteria: Criteria) {
  const sorted = [...rows]
  switch (criteria) {
    case 'trips':
      return sorted.sort((a, b) => b.totalTrips - a.totalTrips)
    case 'revenue':
      return sorted.sort((a, b) => b.weeklyEarnings - a.weeklyEarnings)
    case 'rating':
      return sorted.sort((a, b) => b.driverRating - a.driverRating)
    case 'acceptance':
      return sorted.sort((a, b) => b.acceptanceRate - a.acceptanceRate)
    case 'safety':
      return sorted.sort((a, b) => b.safetyScore - a.safetyScore)
    default:
      return sorted
  }
}

export function DriverRankingsPanel() {
  const { data = [], isLoading } = useGetDriverPerformanceQuery()
  const [scope, setScope] = useState<LeaderboardScope>('global')
  const [criteria, setCriteria] = useState<Criteria>('trips')

  const ranked = useMemo(() => {
    return sortByCriteria(filterByScope(data, scope), criteria).map((row, index) => ({
      ...row,
      rank: index + 1,
    }))
  }, [data, scope, criteria])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <Segmented options={[...scopeOptions]} value={scope} onChange={(v) => setScope(v as LeaderboardScope)} />
        <Segmented options={[...criteriaOptions]} value={criteria} onChange={(v) => setCriteria(v as Criteria)} />
      </div>

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={ranked}
        columns={[
          { title: 'Rank', dataIndex: 'rank', width: 70 },
          { title: 'Driver', dataIndex: 'driverName' },
          {
            title: 'Tier',
            dataIndex: 'currentLevel',
            render: (level: string) => <Tag>{LEVEL_LABELS[level] ?? level}</Tag>,
          },
          { title: 'Trips', dataIndex: 'totalTrips' },
          { title: 'Revenue', dataIndex: 'weeklyEarnings', render: (v: number) => formatCurrency(v) },
          { title: 'Rating', dataIndex: 'driverRating', render: (v: number) => `${v} ★` },
          { title: 'Acceptance', dataIndex: 'acceptanceRate', render: (v: number) => `${v}%` },
          { title: 'Safety', dataIndex: 'safetyScore' },
        ]}
      />
    </div>
  )
}
