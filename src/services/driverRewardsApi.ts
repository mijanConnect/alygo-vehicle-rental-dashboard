import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  Achievement,
  BonusCampaign,
  BonusRule,
  DemotionRule,
  DriverLevel,
  DriverMyTierSnapshot,
  DriverPerformanceRecord,
  DriverPointsHistoryEntry,
  DriverRewardsOverview,
  DriverRewardsOverviewCharts,
  DriverRewardsPublicConfig,
  DriverRewardsWallet,
  DriverTierHistory,
  EarningsAnalyticsData,
  EarningsPeriod,
  IncentiveProgram,
  LevelAnalyticsData,
  LevelBenefit,
  PenaltyRule,
  PerformanceRule,
  PointsRule,
  PointsRulesOverview,
  ProgressionRule,
  Promotion,
  PromotionEngineSettings,
  QualificationRule,
  RewardNotificationTemplate,
  RewardsSearchResult,
  RulesEngineAnalytics,
} from '@/types/driverRewards'
import type { DriverLevelName } from '@/types/driverRewards'
import {
  computeDriverRewardsOverview,
  getEarningsAnalytics,
  mockAchievements,
  mockBonusCampaigns,
  mockBonusRules,
  mockDemotionRules,
  mockDriverLevels,
  mockDriverPerformance,
  mockDriverPointsHistory,
  mockDriverRewardsWallets,
  mockDriverTierHistory,
  mockIncentivePrograms,
  mockLevelAnalytics,
  mockLevelBenefits,
  mockNotificationTemplates,
  mockOverviewCharts,
  mockPenaltyRules,
  mockPerformanceRules,
  mockPointsRules,
  mockProgressionRules,
  mockPromotionEngineSettings,
  mockPromotions,
  mockQualificationRules,
  buildDriverRewardsPublicConfig,
  computePointsRulesOverview,
  computeTierDistribution,
  computeTierManagementOverview,
  computeRewardsConfigOverview,
  computeRulesEngineAnalytics,
  paginateBonusPrograms,
  paginateDriverRewardsList,
  syncTierBenefitAssignments,
} from '@/services/mock/driverRewardsData'
import type {
  DriverRewardsListParams,
  DriverRewardsListResponse,
  RewardsConfigOverview,
} from '@/types/driverRewardsConfig'
import type { TierDistributionItem, TierManagementOverview } from '@/types/tierManagement'
import type { DriverRewardsAuditFields } from '@/types/driverRewards'
import {
  deriveActiveBenefitLabels,
  deriveLockedBenefitLabels,
  syncBenefitFlags,
} from '@/features/driver-rewards/utils/tierConfigHelpers'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function stampCreate<T extends DriverRewardsAuditFields>(
  entity: T,
  changedBy = 'Admin',
): T {
  const now = new Date().toISOString()
  return {
    ...entity,
    createdBy: changedBy,
    updatedBy: changedBy,
    createdAt: now,
    updatedAt: now,
  }
}

function stampUpdate<T extends DriverRewardsAuditFields>(
  entity: T,
  changedBy = 'Admin',
): T {
  const now = new Date().toISOString()
  return {
    ...entity,
    updatedBy: changedBy,
    updatedAt: now,
  }
}

const levelOrder: DriverLevelName[] = ['journey', 'pro_go', 'elite', 'platinum', 'diamond']

function normalizeLevelName(level: DriverLevelName) {
  return level === 'pro' ? 'pro_go' : level
}

function getLevelByName(name: DriverLevelName) {
  const normalized = normalizeLevelName(name)
  return mockDriverLevels.find((l) => l.name === normalized || l.name === name)
}

function getNextLevel(current: DriverLevelName) {
  const normalized = normalizeLevelName(current)
  const idx = levelOrder.indexOf(normalized)
  return idx >= 0 && idx < levelOrder.length - 1 ? getLevelByName(levelOrder[idx + 1]) : undefined
}

function syncLevelBenefitsCount() {
  mockDriverLevels.forEach((level) => {
    level.benefitsCount = deriveActiveBenefitLabels(level).length
  })
}

function syncProgressionFromLevel(level: DriverLevel) {
  const progIndex = mockProgressionRules.findIndex((p) => p.level === level.name || p.level === normalizeLevelName(level.name))
  if (progIndex !== -1) {
    mockProgressionRules[progIndex] = {
      ...mockProgressionRules[progIndex],
      requiredPoints: level.requiredPoints,
      requiredRating: level.requiredRating,
      requiredTrips: level.requiredTrips,
      requiredOnlineHours: level.requiredOnlineHours,
      requiredAcceptanceRate: level.requiredAcceptanceRate,
      requiredCompletionRate: level.requiredCompletionRate,
    }
  }
}

function syncQualificationFromLevel(level: DriverLevel) {
  const qualIndex = mockQualificationRules.findIndex(
    (q) => q.tier === level.name || q.tier === normalizeLevelName(level.name),
  )
  if (qualIndex === -1) return
  mockQualificationRules[qualIndex] = {
    ...mockQualificationRules[qualIndex],
    tierLabel: level.label,
    requiredTrips: level.requirements.completedTrips,
    requiredRating: level.requirements.driverRating,
    requiredAcceptanceRate: level.requirements.acceptanceRate,
    requiredCompletionRate: level.requiredCompletionRate,
    requiredSafetyScore: level.requirements.safetyScore,
    requiredComplianceScore: level.requirements.complianceScore,
    requiredPoints: level.requiredPoints,
    status: level.status,
    lastUpdated: new Date().toISOString(),
  }
}

export const driverRewardsApi = createApi({
  reducerPath: 'driverRewardsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'RewardsOverview',
    'DriverLevels',
    'PointsRules',
    'PerformanceRules',
    'PenaltyRules',
    'QualificationRules',
    'RewardsWallet',
    'PointsHistory',
    'RulesEngineAnalytics',
    'LevelBenefits',
    'DriverPerformance',
    'Promotions',
    'Achievements',
    'ProgressionRules',
    'NotificationTemplates',
    'BonusRules',
    'IncentivePrograms',
    'BonusCampaigns',
    'DemotionRules',
    'PromotionEngine',
    'TierHistory',
    'EarningsAnalytics',
    'LevelAnalytics',
  ],
  endpoints: (builder) => ({
    getRewardsOverview: builder.query<
      { overview: DriverRewardsOverview; charts: DriverRewardsOverviewCharts },
      void
    >({
      queryFn: async () => ({
        data: { overview: computeDriverRewardsOverview(), charts: mockOverviewCharts },
      }),
      providesTags: ['RewardsOverview'],
    }),
    getTierDistribution: builder.query<TierDistributionItem[], void>({
      queryFn: async () => {
        await delay()
        return { data: computeTierDistribution() }
      },
      providesTags: ['RewardsOverview', 'DriverLevels'],
    }),
    getTierManagementOverview: builder.query<TierManagementOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeTierManagementOverview() }
      },
      providesTags: ['RewardsOverview', 'DriverLevels', 'LevelBenefits', 'TierHistory'],
    }),
    getDriverLevels: builder.query<DriverLevel[], void>({
      queryFn: async () => {
        syncLevelBenefitsCount()
        return { data: [...mockDriverLevels] }
      },
      providesTags: ['DriverLevels'],
    }),
    updateDriverLevel: builder.mutation<DriverLevel, Partial<DriverLevel> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockDriverLevels.findIndex((l) => l.id === id)
        if (index === -1) return { error: { status: 404, data: 'Level not found' } }
        const merged = { ...mockDriverLevels[index], ...updates }
        if (updates.benefits) {
          merged.benefits = syncBenefitFlags({ ...mockDriverLevels[index].benefits, ...updates.benefits })
        }
        mockDriverLevels[index] = merged
        syncProgressionFromLevel(mockDriverLevels[index])
        syncQualificationFromLevel(mockDriverLevels[index])
        return { data: mockDriverLevels[index] }
      },
      invalidatesTags: ['DriverLevels', 'ProgressionRules', 'QualificationRules', 'RewardsOverview', 'LevelAnalytics'],
    }),
    createDriverLevel: builder.mutation<DriverLevel, Omit<DriverLevel, 'id' | 'benefitsCount' | 'driverCount'>>({
      queryFn: async (payload) => {
        await delay()
        const level: DriverLevel = {
          ...payload,
          id: `lvl-${Date.now()}`,
          benefitsCount: 0,
          driverCount: 0,
          sortOrder: mockDriverLevels.length + 1,
        }
        mockDriverLevels.push(level)
        mockProgressionRules.push({
          id: `prog-${level.id}`,
          level: level.name,
          requiredPoints: level.requiredPoints,
          requiredRating: level.requiredRating,
          requiredTrips: level.requiredTrips,
          requiredOnlineHours: level.requiredOnlineHours,
          requiredAcceptanceRate: level.requiredAcceptanceRate,
          requiredCompletionRate: level.requiredCompletionRate,
        })
        return { data: level }
      },
      invalidatesTags: ['DriverLevels', 'ProgressionRules', 'RewardsOverview'],
    }),
    reorderDriverLevels: builder.mutation<DriverLevel[], string[]>({
      queryFn: async (orderedIds) => {
        await delay()
        const reordered = orderedIds
          .map((id, index) => {
            const level = mockDriverLevels.find((l) => l.id === id)
            if (!level) return null
            return { ...level, sortOrder: index + 1, level: index + 1 }
          })
          .filter(Boolean) as DriverLevel[]
        mockDriverLevels.splice(0, mockDriverLevels.length, ...reordered)
        return { data: [...mockDriverLevels] }
      },
      invalidatesTags: ['DriverLevels'],
    }),
    duplicateDriverLevel: builder.mutation<DriverLevel, string>({
      queryFn: async (id) => {
        await delay()
        const source = mockDriverLevels.find((l) => l.id === id)
        if (!source) return { error: { status: 404, data: 'Tier not found' } }
        const duplicate: DriverLevel = {
          ...source,
          id: `lvl-${Date.now()}`,
          name: `${source.name}_copy`,
          slug: `${source.slug}-copy`,
          label: `${source.label} (Copy)`,
          status: 'inactive',
          driverCount: 0,
          sortOrder: mockDriverLevels.length + 1,
          tierBadge: `${source.tierBadge}*`,
        }
        mockDriverLevels.push(duplicate)
        return { data: duplicate }
      },
      invalidatesTags: ['DriverLevels', 'ProgressionRules'],
    }),
    deleteDriverLevel: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockDriverLevels.findIndex((l) => l.id === id)
        if (index === -1) return { error: { status: 404, data: 'Tier not found' } }
        if (mockDriverLevels[index].driverCount > 0) {
          return { error: { status: 400, data: 'Cannot delete a tier with assigned drivers' } }
        }
        const tierName = mockDriverLevels[index].name
        mockDriverLevels.splice(index, 1)
        syncTierBenefitAssignments(tierName, [])
        syncLevelBenefitsCount()
        return { data: undefined }
      },
      invalidatesTags: ['DriverLevels', 'LevelBenefits', 'ProgressionRules', 'QualificationRules', 'RewardsOverview'],
    }),
    syncTierBenefitAssignments: builder.mutation<void, { tierName: string; benefitIds: string[] }>({
      queryFn: async ({ tierName, benefitIds }) => {
        await delay()
        syncTierBenefitAssignments(tierName, benefitIds)
        syncLevelBenefitsCount()
        return { data: undefined }
      },
      invalidatesTags: ['LevelBenefits', 'DriverLevels'],
    }),
    getPointsRulesOverview: builder.query<PointsRulesOverview, void>({
      queryFn: async () => ({ data: computePointsRulesOverview() }),
      providesTags: ['PointsRules', 'BonusCampaigns'],
    }),
    getRewardsConfigOverview: builder.query<RewardsConfigOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeRewardsConfigOverview() }
      },
      providesTags: ['PointsRules', 'PerformanceRules', 'PenaltyRules', 'BonusCampaigns'],
    }),
    getRewardRulesList: builder.query<
      DriverRewardsListResponse<PointsRule>,
      DriverRewardsListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateDriverRewardsList(mockPointsRules, params ?? {}, [
            'ruleName',
            'action',
            'actionType',
            'category',
          ]),
        }
      },
      providesTags: ['PointsRules'],
    }),
    getPerformanceRewardsList: builder.query<
      DriverRewardsListResponse<PerformanceRule>,
      DriverRewardsListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateDriverRewardsList(mockPerformanceRules, params ?? {}, [
            'metricLabel',
            'thresholdLabel',
          ]),
        }
      },
      providesTags: ['PerformanceRules'],
    }),
    getPenaltyRulesList: builder.query<
      DriverRewardsListResponse<PenaltyRule>,
      DriverRewardsListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateDriverRewardsList(mockPenaltyRules, params ?? {}, ['ruleName', 'actionType']),
        }
      },
      providesTags: ['PenaltyRules'],
    }),
    getBonusProgramsList: builder.query<
      DriverRewardsListResponse<BonusCampaign>,
      DriverRewardsListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return { data: paginateBonusPrograms(mockBonusCampaigns, params ?? {}) }
      },
      providesTags: ['BonusCampaigns'],
    }),
    getPointsRules: builder.query<PointsRule[], void>({
      queryFn: async () => ({ data: [...mockPointsRules] }),
      providesTags: ['PointsRules'],
    }),
    updatePointsRule: builder.mutation<PointsRule, Partial<PointsRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockPointsRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockPointsRules[index] = stampUpdate({
          ...mockPointsRules[index],
          ...updates,
          lastUpdated: new Date().toISOString(),
        })
        return { data: mockPointsRules[index] }
      },
      invalidatesTags: ['PointsRules'],
    }),
    createPointsRule: builder.mutation<PointsRule, Omit<PointsRule, 'id'>>({
      queryFn: async (payload) => {
        await delay()
        const rule: PointsRule = stampCreate({
          ...payload,
          id: `pr-${Date.now()}`,
          lastUpdated: new Date().toISOString(),
        })
        mockPointsRules.unshift(rule)
        return { data: rule }
      },
      invalidatesTags: ['PointsRules'],
    }),
    deletePointsRule: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockPointsRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockPointsRules.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['PointsRules'],
    }),
    duplicatePointsRule: builder.mutation<PointsRule, string>({
      queryFn: async (id) => {
        await delay()
        const source = mockPointsRules.find((r) => r.id === id)
        if (!source) return { error: { status: 404, data: 'Rule not found' } }
        const duplicate: PointsRule = {
          ...source,
          id: `pr-${Date.now()}`,
          ruleName: `${source.ruleName} (Copy)`,
          actionType: `${source.actionType}_copy`,
          status: 'inactive',
          lastUpdated: new Date().toISOString(),
        }
        mockPointsRules.unshift(duplicate)
        return { data: duplicate }
      },
      invalidatesTags: ['PointsRules'],
    }),
    getPerformanceRules: builder.query<PerformanceRule[], void>({
      queryFn: async () => ({ data: [...mockPerformanceRules] }),
      providesTags: ['PerformanceRules'],
    }),
    createPerformanceRule: builder.mutation<PerformanceRule, Omit<PerformanceRule, 'id' | 'lastUpdated'>>({
      queryFn: async (payload) => {
        await delay()
        const rule: PerformanceRule = stampCreate({
          ...payload,
          id: `perf-${Date.now()}`,
          lastUpdated: new Date().toISOString(),
        })
        mockPerformanceRules.unshift(rule)
        return { data: rule }
      },
      invalidatesTags: ['PerformanceRules', 'PointsRules'],
    }),
    updatePerformanceRule: builder.mutation<PerformanceRule, Partial<PerformanceRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockPerformanceRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockPerformanceRules[index] = stampUpdate({
          ...mockPerformanceRules[index],
          ...updates,
          lastUpdated: new Date().toISOString(),
        })
        return { data: mockPerformanceRules[index] }
      },
      invalidatesTags: ['PerformanceRules', 'PointsRules'],
    }),
    deletePerformanceRule: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockPerformanceRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockPerformanceRules.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['PerformanceRules', 'PointsRules'],
    }),
    getPenaltyRules: builder.query<PenaltyRule[], void>({
      queryFn: async () => ({ data: [...mockPenaltyRules] }),
      providesTags: ['PenaltyRules'],
    }),
    createPenaltyRule: builder.mutation<PenaltyRule, Omit<PenaltyRule, 'id' | 'lastUpdated'>>({
      queryFn: async (payload) => {
        await delay()
        const rule: PenaltyRule = stampCreate({
          ...payload,
          id: `pen-${Date.now()}`,
          lastUpdated: new Date().toISOString(),
        })
        mockPenaltyRules.unshift(rule)
        return { data: rule }
      },
      invalidatesTags: ['PenaltyRules', 'PointsRules'],
    }),
    updatePenaltyRule: builder.mutation<PenaltyRule, Partial<PenaltyRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockPenaltyRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockPenaltyRules[index] = stampUpdate({
          ...mockPenaltyRules[index],
          ...updates,
          lastUpdated: new Date().toISOString(),
        })
        return { data: mockPenaltyRules[index] }
      },
      invalidatesTags: ['PenaltyRules', 'PointsRules'],
    }),
    deletePenaltyRule: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockPenaltyRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockPenaltyRules.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['PenaltyRules', 'PointsRules'],
    }),
    getQualificationRules: builder.query<QualificationRule[], void>({
      queryFn: async () => ({ data: [...mockQualificationRules] }),
      providesTags: ['QualificationRules'],
    }),
    updateQualificationRule: builder.mutation<QualificationRule, Partial<QualificationRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockQualificationRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockQualificationRules[index] = { ...mockQualificationRules[index], ...updates, lastUpdated: new Date().toISOString() }
        const levelIndex = mockDriverLevels.findIndex((l) => l.name === mockQualificationRules[index].tier)
        if (levelIndex !== -1) {
          mockDriverLevels[levelIndex] = {
            ...mockDriverLevels[levelIndex],
            requiredPoints: mockQualificationRules[index].requiredPoints,
            requiredRating: mockQualificationRules[index].requiredRating,
            requiredTrips: mockQualificationRules[index].requiredTrips,
            requiredAcceptanceRate: mockQualificationRules[index].requiredAcceptanceRate,
            requiredCompletionRate: mockQualificationRules[index].requiredCompletionRate,
            requirements: {
              ...mockDriverLevels[levelIndex].requirements,
              completedTrips: mockQualificationRules[index].requiredTrips,
              driverRating: mockQualificationRules[index].requiredRating,
              acceptanceRate: mockQualificationRules[index].requiredAcceptanceRate,
              safetyScore: mockQualificationRules[index].requiredSafetyScore,
              complianceScore: mockQualificationRules[index].requiredComplianceScore,
            },
          }
        }
        return { data: mockQualificationRules[index] }
      },
      invalidatesTags: ['QualificationRules', 'DriverLevels'],
    }),
    getDriverRewardsWallets: builder.query<DriverRewardsWallet[], void>({
      queryFn: async () => ({ data: [...mockDriverRewardsWallets] }),
      providesTags: ['RewardsWallet'],
    }),
    getDriverRewardsWallet: builder.query<DriverRewardsWallet | null, string>({
      queryFn: async (driverId) => {
        await delay(150)
        return { data: mockDriverRewardsWallets.find((w) => w.driverId === driverId) ?? null }
      },
      providesTags: ['RewardsWallet'],
    }),
    getDriverPointsHistory: builder.query<DriverPointsHistoryEntry[], string | void>({
      queryFn: async (driverId) => {
        await delay(150)
        const data = driverId
          ? mockDriverPointsHistory.filter((h) => h.driverId === driverId)
          : [...mockDriverPointsHistory]
        return { data }
      },
      providesTags: ['PointsHistory'],
    }),
    getRulesEngineAnalytics: builder.query<RulesEngineAnalytics, void>({
      queryFn: async () => ({ data: computeRulesEngineAnalytics() }),
      providesTags: ['RulesEngineAnalytics'],
    }),
    getDriverRewardsPublicConfig: builder.query<DriverRewardsPublicConfig, void>({
      queryFn: async () => ({ data: buildDriverRewardsPublicConfig() }),
      providesTags: ['PointsRules', 'PerformanceRules', 'PenaltyRules', 'BonusCampaigns'],
    }),
    getDriverPerformance: builder.query<DriverPerformanceRecord[], void>({
      queryFn: async () => ({ data: [...mockDriverPerformance] }),
      providesTags: ['DriverPerformance'],
    }),
    getDriverPerformanceByDriverId: builder.query<DriverPerformanceRecord | null, string>({
      queryFn: async (driverId) => {
        await delay(150)
        const record = mockDriverPerformance.find((d) => d.driverId === driverId)
        return { data: record ?? null }
      },
      providesTags: ['DriverPerformance'],
    }),
    getDriverMyTierSnapshot: builder.query<DriverMyTierSnapshot | null, string>({
      queryFn: async (driverId) => {
        await delay(150)
        const record = mockDriverPerformance.find((d) => d.driverId === driverId)
        if (!record) return { data: null }
        const currentTier = getLevelByName(record.currentLevel)
        if (!currentTier) return { data: null }
        const nextTier = getNextLevel(record.currentLevel)
        return {
          data: {
            driverId: record.driverId,
            driverName: record.driverName,
            currentTier,
            nextTier,
            progressPercent: record.nextTierProgress,
            metrics: {
              trips: record.totalTrips,
              rating: record.driverRating,
              acceptanceRate: record.acceptanceRate,
              safetyScore: record.safetyScore,
            },
            activeBenefits: deriveActiveBenefitLabels(currentTier),
            lockedBenefits: nextTier ? deriveLockedBenefitLabels(currentTier, nextTier) : [],
            achievements: mockAchievements.filter((a) => a.status === 'active').slice(0, 4),
            bonusOpportunities: mockIncentivePrograms.filter((p) => p.status === 'active').slice(0, 3),
            tierHistory: mockDriverTierHistory.filter((h) => h.driverId === record.driverId),
            rewardsEarned: record.bonusHistory.reduce((sum, b) => sum + b.amount, 0),
            wallet: mockDriverRewardsWallets.find((w) => w.driverId === record.driverId),
            pointsHistory: mockDriverPointsHistory.filter((h) => h.driverId === record.driverId),
            rewardsConfig: buildDriverRewardsPublicConfig(),
          },
        }
      },
      providesTags: ['DriverPerformance', 'TierHistory'],
    }),
    adjustDriverPoints: builder.mutation<
      DriverPerformanceRecord,
      { id: string; points: number; reason: string }
    >({
      queryFn: async ({ id, points, reason }) => {
        await delay()
        const index = mockDriverPerformance.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Driver not found' } }
        mockDriverPerformance[index] = {
          ...mockDriverPerformance[index],
          currentPoints: mockDriverPerformance[index].currentPoints + points,
          pointsHistory: [
            { action: reason, points, date: new Date().toISOString() },
            ...mockDriverPerformance[index].pointsHistory,
          ],
        }
        return { data: mockDriverPerformance[index] }
      },
      invalidatesTags: ['DriverPerformance', 'RewardsOverview', 'LevelAnalytics'],
    }),
    changeDriverLevel: builder.mutation<
      DriverPerformanceRecord,
      { id: string; direction: 'upgrade' | 'downgrade' }
    >({
      queryFn: async ({ id, direction }) => {
        await delay()
        const index = mockDriverPerformance.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Driver not found' } }
        const currentIdx = levelOrder.indexOf(normalizeLevelName(mockDriverPerformance[index].currentLevel))
        const newIdx = direction === 'upgrade' ? currentIdx + 1 : currentIdx - 1
        if (newIdx < 0 || newIdx >= levelOrder.length) {
          return { error: { status: 400, data: 'Cannot change level further' } }
        }
        const newLevel = levelOrder[newIdx]
        mockDriverPerformance[index] = {
          ...mockDriverPerformance[index],
          currentLevel: newLevel,
          levelHistory: [
            { level: newLevel, date: new Date().toISOString() },
            ...mockDriverPerformance[index].levelHistory,
          ],
        }
        return { data: mockDriverPerformance[index] }
      },
      invalidatesTags: ['DriverPerformance', 'RewardsOverview', 'LevelAnalytics'],
    }),
    resetDriverTier: builder.mutation<DriverPerformanceRecord, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockDriverPerformance.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Driver not found' } }
        mockDriverPerformance[index] = {
          ...mockDriverPerformance[index],
          currentLevel: 'journey',
          levelHistory: [
            { level: 'journey', date: new Date().toISOString() },
            ...mockDriverPerformance[index].levelHistory,
          ],
        }
        return { data: mockDriverPerformance[index] }
      },
      invalidatesTags: ['DriverPerformance', 'RewardsOverview', 'LevelAnalytics'],
    }),
    suspendDriverRewards: builder.mutation<DriverPerformanceRecord, { id: string; suspended: boolean }>({
      queryFn: async ({ id, suspended }) => {
        await delay()
        const index = mockDriverPerformance.findIndex((d) => d.id === id)
        if (index === -1) return { error: { status: 404, data: 'Driver not found' } }
        mockDriverPerformance[index] = {
          ...mockDriverPerformance[index],
          rewardsSuspended: suspended,
          status: suspended ? 'suspended' : 'active',
        }
        return { data: mockDriverPerformance[index] }
      },
      invalidatesTags: ['DriverPerformance'],
    }),
    getBonusRules: builder.query<BonusRule[], void>({
      queryFn: async () => ({ data: [...mockBonusRules] }),
      providesTags: ['BonusRules'],
    }),
    createBonusRule: builder.mutation<BonusRule, Omit<BonusRule, 'id'>>({
      queryFn: async (payload) => {
        await delay()
        const rule: BonusRule = { ...payload, id: `br-${Date.now()}` }
        mockBonusRules.unshift(rule)
        return { data: rule }
      },
      invalidatesTags: ['BonusRules', 'EarningsAnalytics'],
    }),
    searchRewards: builder.query<RewardsSearchResult[], string>({
      queryFn: async (query) => {
        await delay(150)
        const q = query.trim().toLowerCase()
        if (!q) return { data: [] }
        const results: RewardsSearchResult[] = []
        mockDriverPerformance.forEach((d) => {
          if (d.driverName.toLowerCase().includes(q) || d.driverId.toLowerCase().includes(q) || String(d.currentPoints).includes(q)) {
            results.push({ type: 'driver', id: d.id, label: d.driverName, meta: `${d.driverId} · ${d.currentPoints} pts` })
          }
        })
        mockDriverLevels.forEach((l) => {
          if (l.label.toLowerCase().includes(q)) {
            results.push({ type: 'tier', id: l.id, label: l.label, meta: `${l.requiredPoints} points required` })
          }
        })
        mockAchievements.forEach((a) => {
          if (a.name.toLowerCase().includes(q)) {
            results.push({ type: 'achievement', id: a.id, label: a.name, meta: `${a.pointsAwarded} pts` })
          }
        })
        mockPromotions.forEach((p) => {
          if (p.name.toLowerCase().includes(q)) {
            results.push({ type: 'promotion', id: p.id, label: p.name, meta: p.type.replace(/_/g, ' ') })
          }
        })
        mockPointsRules.forEach((r) => {
          if (r.ruleName.toLowerCase().includes(q) || String(r.points).includes(q)) {
            results.push({ type: 'points', id: r.id, label: r.ruleName, meta: `${r.points > 0 ? '+' : ''}${r.points} pts` })
          }
        })
        return { data: results.slice(0, 12) }
      },
    }),
    getPromotions: builder.query<Promotion[], void>({
      queryFn: async () => ({ data: [...mockPromotions] }),
      providesTags: ['Promotions'],
    }),
    createPromotion: builder.mutation<Promotion, Omit<Promotion, 'id'>>({
      queryFn: async (payload) => {
        await delay()
        const promotion: Promotion = { ...payload, id: `promo-${Date.now()}` }
        mockPromotions.unshift(promotion)
        return { data: promotion }
      },
      invalidatesTags: ['Promotions', 'EarningsAnalytics'],
    }),
    updatePromotion: builder.mutation<Promotion, Partial<Promotion> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockPromotions.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Promotion not found' } }
        mockPromotions[index] = { ...mockPromotions[index], ...updates }
        return { data: mockPromotions[index] }
      },
      invalidatesTags: ['Promotions', 'EarningsAnalytics'],
    }),
    deletePromotion: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockPromotions.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Promotion not found' } }
        mockPromotions.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['Promotions'],
    }),
    getLevelBenefits: builder.query<LevelBenefit[], void>({
      queryFn: async () => ({ data: [...mockLevelBenefits] }),
      providesTags: ['LevelBenefits'],
    }),
    createLevelBenefit: builder.mutation<LevelBenefit, Omit<LevelBenefit, 'id'>>({
      queryFn: async (payload) => {
        await delay()
        const benefit: LevelBenefit = { ...payload, id: `ben-${Date.now()}` }
        mockLevelBenefits.unshift(benefit)
        syncLevelBenefitsCount()
        return { data: benefit }
      },
      invalidatesTags: ['LevelBenefits', 'DriverLevels'],
    }),
    updateLevelBenefit: builder.mutation<LevelBenefit, Partial<LevelBenefit> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockLevelBenefits.findIndex((b) => b.id === id)
        if (index === -1) return { error: { status: 404, data: 'Benefit not found' } }
        mockLevelBenefits[index] = { ...mockLevelBenefits[index], ...updates }
        syncLevelBenefitsCount()
        return { data: mockLevelBenefits[index] }
      },
      invalidatesTags: ['LevelBenefits', 'DriverLevels'],
    }),
    deleteLevelBenefit: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockLevelBenefits.findIndex((b) => b.id === id)
        if (index === -1) return { error: { status: 404, data: 'Benefit not found' } }
        mockLevelBenefits.splice(index, 1)
        syncLevelBenefitsCount()
        return { data: undefined }
      },
      invalidatesTags: ['LevelBenefits', 'DriverLevels'],
    }),
    getAchievements: builder.query<Achievement[], void>({
      queryFn: async () => ({ data: [...mockAchievements] }),
      providesTags: ['Achievements'],
    }),
    createAchievement: builder.mutation<Achievement, Omit<Achievement, 'id'>>({
      queryFn: async (payload) => {
        await delay()
        const achievement: Achievement = { ...payload, id: `ach-${Date.now()}` }
        mockAchievements.unshift(achievement)
        return { data: achievement }
      },
      invalidatesTags: ['Achievements'],
    }),
    updateAchievement: builder.mutation<Achievement, Partial<Achievement> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockAchievements.findIndex((a) => a.id === id)
        if (index === -1) return { error: { status: 404, data: 'Achievement not found' } }
        mockAchievements[index] = { ...mockAchievements[index], ...updates }
        return { data: mockAchievements[index] }
      },
      invalidatesTags: ['Achievements'],
    }),
    deleteAchievement: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockAchievements.findIndex((a) => a.id === id)
        if (index === -1) return { error: { status: 404, data: 'Achievement not found' } }
        mockAchievements.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['Achievements'],
    }),
    getProgressionRules: builder.query<ProgressionRule[], void>({
      queryFn: async () => ({ data: [...mockProgressionRules] }),
      providesTags: ['ProgressionRules'],
    }),
    updateProgressionRule: builder.mutation<ProgressionRule, Partial<ProgressionRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockProgressionRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockProgressionRules[index] = { ...mockProgressionRules[index], ...updates }
        const levelIndex = mockDriverLevels.findIndex(
          (l) => l.name === mockProgressionRules[index].level,
        )
        if (levelIndex !== -1) {
          mockDriverLevels[levelIndex] = {
            ...mockDriverLevels[levelIndex],
            requiredPoints: mockProgressionRules[index].requiredPoints,
            requiredRating: mockProgressionRules[index].requiredRating,
            requiredTrips: mockProgressionRules[index].requiredTrips,
            requiredOnlineHours: mockProgressionRules[index].requiredOnlineHours,
            requiredAcceptanceRate: mockProgressionRules[index].requiredAcceptanceRate,
            requiredCompletionRate: mockProgressionRules[index].requiredCompletionRate,
          }
        }
        return { data: mockProgressionRules[index] }
      },
      invalidatesTags: ['ProgressionRules', 'DriverLevels'],
    }),
    getNotificationTemplates: builder.query<RewardNotificationTemplate[], void>({
      queryFn: async () => ({ data: [...mockNotificationTemplates] }),
      providesTags: ['NotificationTemplates'],
    }),
    updateNotificationTemplate: builder.mutation<
      RewardNotificationTemplate,
      Partial<RewardNotificationTemplate> & { id: string }
    >({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockNotificationTemplates.findIndex((t) => t.id === id)
        if (index === -1) return { error: { status: 404, data: 'Template not found' } }
        mockNotificationTemplates[index] = { ...mockNotificationTemplates[index], ...updates }
        return { data: mockNotificationTemplates[index] }
      },
      invalidatesTags: ['NotificationTemplates'],
    }),
    getEarningsAnalytics: builder.query<EarningsAnalyticsData, EarningsPeriod>({
      queryFn: async (period) => ({ data: getEarningsAnalytics(period) }),
      providesTags: ['EarningsAnalytics'],
    }),
    getLevelAnalytics: builder.query<LevelAnalyticsData, void>({
      queryFn: async () => ({ data: mockLevelAnalytics }),
      providesTags: ['LevelAnalytics'],
    }),
    getIncentivePrograms: builder.query<IncentiveProgram[], void>({
      queryFn: async () => ({ data: [...mockIncentivePrograms] }),
      providesTags: ['IncentivePrograms'],
    }),
    createIncentiveProgram: builder.mutation<IncentiveProgram, Omit<IncentiveProgram, 'id'>>({
      queryFn: async (payload) => {
        await delay()
        const program = { ...payload, id: `inc-${Date.now()}` }
        mockIncentivePrograms.unshift(program)
        return { data: program }
      },
      invalidatesTags: ['IncentivePrograms'],
    }),
    updateIncentiveProgram: builder.mutation<IncentiveProgram, Partial<IncentiveProgram> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockIncentivePrograms.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Program not found' } }
        mockIncentivePrograms[index] = { ...mockIncentivePrograms[index], ...updates }
        return { data: mockIncentivePrograms[index] }
      },
      invalidatesTags: ['IncentivePrograms'],
    }),
    deleteIncentiveProgram: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockIncentivePrograms.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Program not found' } }
        mockIncentivePrograms.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['IncentivePrograms'],
    }),
    getBonusCampaigns: builder.query<BonusCampaign[], void>({
      queryFn: async () => ({ data: [...mockBonusCampaigns] }),
      providesTags: ['BonusCampaigns'],
    }),
    createBonusCampaign: builder.mutation<BonusCampaign, Omit<BonusCampaign, 'id' | 'spent'>>({
      queryFn: async (payload) => {
        await delay()
        const campaign: BonusCampaign = stampCreate({
          ...payload,
          id: `bc-${Date.now()}`,
          spent: 0,
          targetTiers: payload.targetTiers ?? (payload.targetTier ? [payload.targetTier] : []),
          targetCities: payload.targetCities ?? (payload.targetCity ? [payload.targetCity] : []),
          enabled: payload.enabled ?? true,
          tripTarget: payload.tripTarget ?? 0,
          rewardPoints: payload.rewardPoints ?? 0,
          requirement: payload.requirement ?? payload.description ?? '',
        })
        mockBonusCampaigns.unshift(campaign)
        return { data: campaign }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),
    updateBonusCampaign: builder.mutation<BonusCampaign, Partial<BonusCampaign> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockBonusCampaigns.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Campaign not found' } }
        mockBonusCampaigns[index] = stampUpdate({ ...mockBonusCampaigns[index], ...updates })
        return { data: mockBonusCampaigns[index] }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),
    deleteBonusCampaign: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockBonusCampaigns.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Campaign not found' } }
        mockBonusCampaigns.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),
    getDemotionRules: builder.query<DemotionRule[], void>({
      queryFn: async () => ({ data: [...mockDemotionRules] }),
      providesTags: ['DemotionRules'],
    }),
    updateDemotionRule: builder.mutation<DemotionRule, Partial<DemotionRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockDemotionRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }
        mockDemotionRules[index] = { ...mockDemotionRules[index], ...updates }
        return { data: mockDemotionRules[index] }
      },
      invalidatesTags: ['DemotionRules'],
    }),
    getPromotionEngineSettings: builder.query<PromotionEngineSettings, void>({
      queryFn: async () => ({ data: { ...mockPromotionEngineSettings } }),
      providesTags: ['PromotionEngine'],
    }),
    updatePromotionEngineSettings: builder.mutation<PromotionEngineSettings, Partial<PromotionEngineSettings>>({
      queryFn: async (updates) => {
        await delay()
        Object.assign(mockPromotionEngineSettings, updates)
        return { data: { ...mockPromotionEngineSettings } }
      },
      invalidatesTags: ['PromotionEngine'],
    }),
    getDriverTierHistory: builder.query<DriverTierHistory[], void>({
      queryFn: async () => ({ data: [...mockDriverTierHistory] }),
      providesTags: ['TierHistory'],
    }),
  }),
})

export const {
  useGetRewardsOverviewQuery,
  useGetTierDistributionQuery,
  useGetTierManagementOverviewQuery,
  useGetDriverLevelsQuery,
  useUpdateDriverLevelMutation,
  useCreateDriverLevelMutation,
  useDeleteDriverLevelMutation,
  useSyncTierBenefitAssignmentsMutation,
  useDuplicateDriverLevelMutation,
  useGetPointsRulesOverviewQuery,
  useGetRewardsConfigOverviewQuery,
  useGetRewardRulesListQuery,
  useGetPerformanceRewardsListQuery,
  useGetPenaltyRulesListQuery,
  useGetBonusProgramsListQuery,
  useGetPointsRulesQuery,
  useDuplicatePointsRuleMutation,
  useGetPerformanceRulesQuery,
  useCreatePerformanceRuleMutation,
  useUpdatePerformanceRuleMutation,
  useDeletePerformanceRuleMutation,
  useGetPenaltyRulesQuery,
  useCreatePenaltyRuleMutation,
  useUpdatePenaltyRuleMutation,
  useDeletePenaltyRuleMutation,
  useGetQualificationRulesQuery,
  useUpdateQualificationRuleMutation,
  useGetDriverRewardsWalletsQuery,
  useGetDriverRewardsWalletQuery,
  useGetDriverPointsHistoryQuery,
  useGetRulesEngineAnalyticsQuery,
  useGetDriverRewardsPublicConfigQuery,
  useUpdatePointsRuleMutation,
  useCreatePointsRuleMutation,
  useDeletePointsRuleMutation,
  useGetLevelBenefitsQuery,
  useCreateLevelBenefitMutation,
  useUpdateLevelBenefitMutation,
  useDeleteLevelBenefitMutation,
  useGetDriverPerformanceQuery,
  useAdjustDriverPointsMutation,
  useChangeDriverLevelMutation,
  useResetDriverTierMutation,
  useSuspendDriverRewardsMutation,
  useGetBonusRulesQuery,
  useCreateBonusRuleMutation,
  useSearchRewardsQuery,
  useLazySearchRewardsQuery,
  useGetPromotionsQuery,
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetAchievementsQuery,
  useCreateAchievementMutation,
  useUpdateAchievementMutation,
  useDeleteAchievementMutation,
  useGetProgressionRulesQuery,
  useUpdateProgressionRuleMutation,
  useGetNotificationTemplatesQuery,
  useUpdateNotificationTemplateMutation,
  useGetEarningsAnalyticsQuery,
  useGetLevelAnalyticsQuery,
  useGetDriverPerformanceByDriverIdQuery,
  useGetDriverMyTierSnapshotQuery,
  useReorderDriverLevelsMutation,
  useGetIncentiveProgramsQuery,
  useCreateIncentiveProgramMutation,
  useUpdateIncentiveProgramMutation,
  useDeleteIncentiveProgramMutation,
  useGetBonusCampaignsQuery,
  useCreateBonusCampaignMutation,
  useUpdateBonusCampaignMutation,
  useDeleteBonusCampaignMutation,
  useGetDemotionRulesQuery,
  useUpdateDemotionRuleMutation,
  useGetPromotionEngineSettingsQuery,
  useUpdatePromotionEngineSettingsMutation,
  useGetDriverTierHistoryQuery,
} = driverRewardsApi

export const POINTS_RULE_CATEGORY_LABELS: Record<string, string> = {
  ride_completion: 'Ride Completion',
  rating: 'Rating',
  airport: 'Airport',
  scheduled: 'Scheduled',
  peak_hour: 'Peak Hour',
  performance: 'Performance',
  penalty: 'Penalty',
  bonus: 'Bonus',
  other: 'Other',
}

export const LEVEL_LABELS: Record<string, string> = {
  journey: 'Journey',
  pro: 'Pro Go',
  pro_go: 'Pro Go',
  elite: 'Elite',
  platinum: 'Platinum',
  diamond: 'Diamond',
}

export const PROMOTION_TYPE_LABELS: Record<string, string> = {
  weekend_bonus: 'Weekend Bonus',
  airport_bonus: 'Airport Bonus',
  event_bonus: 'Event Bonus',
  peak_hour_bonus: 'Peak Hour Bonus',
  diamond_bonus: 'Diamond Bonus',
  black_driver_bonus: 'Black Driver Bonus',
  black_suv_bonus: 'Black SUV Bonus',
  referral_bonus: 'Referral Bonus',
  diamond_driver_bonus: 'Diamond Driver Bonus',
}

export const LEVEL_OPTIONS = Object.entries(LEVEL_LABELS).map(([value, label]) => ({
  value,
  label,
}))
