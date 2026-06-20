export type DriverRewardsEntityStatus = 'active' | 'inactive'

export interface DriverRewardsAuditFields {
  createdBy?: string
  updatedBy?: string
  createdAt?: string
  updatedAt?: string
}

export type DriverLevelName = 'journey' | 'pro' | 'pro_go' | 'elite' | 'platinum' | 'diamond' | string

export type TierStandingStatus = 'good_standing' | 'at_risk' | 'under_review' | 'suspended'

export type PointsRuleType = 'earn' | 'deduct' | 'neutral'

export type PromotionType =
  | 'weekend_bonus'
  | 'airport_bonus'
  | 'event_bonus'
  | 'peak_hour_bonus'
  | 'diamond_bonus'
  | 'black_driver_bonus'
  | 'black_suv_bonus'
  | 'referral_bonus'
  | 'diamond_driver_bonus'

export type PromotionStatus = 'active' | 'paused' | 'scheduled' | 'ended'

export type BonusCampaignType = 'tier_based' | 'city_based' | 'driver_based' | 'event_based' | 'demand_based'

export type IncentiveRewardType = 'fixed_cash' | 'percentage' | 'points' | 'multiplier'

export type LeaderboardScope = 'global' | 'city' | 'region' | 'country'

export type DriverPerformanceStatus = 'active' | 'at_risk' | 'inactive' | 'suspended'

export type NotificationCategory =
  | 'level_up'
  | 'level_down'
  | 'points_earned'
  | 'bonus_unlocked'
  | 'achievement_earned'
  | 'promotion_activated'

export type TierHistoryReason = 'auto_promotion' | 'auto_demotion' | 'manual_promotion' | 'manual_demotion' | 'compliance' | 'safety' | 'fraud'

export interface TierRequirements {
  completedTrips: number
  driverRating: number
  acceptanceRate: number
  cancellationRate: number
  onlineHours: number
  consecutiveActiveDays: number
  customerSatisfactionScore: number
  safetyScore: number
  complianceScore: number
  fraudScore: number
  incidentCount: number
}

export interface TierBenefitFlags {
  priorityDispatch: boolean
  priorityMatching: boolean
  premiumRideAccess: boolean
  airportQueuePriority: boolean
  eventQueuePriority: boolean
  vipRideAccess: boolean
  luxuryRideAccess: boolean
  bonusMultiplier: number
  surgeMultiplier: number
  dedicatedSupport: boolean
  reducedPlatformFees: number
  reservationPriority: boolean
  earlyFeatureAccess: boolean
}

export type DispatchPriorityLevel = 'low' | 'medium' | 'high' | 'highest'

export interface TierBenefitRules {
  destinationFilter: {
    enabled: boolean
    filtersAllowed: number
    dailyLimit: number
    weeklyLimit: number
    unlimited: boolean
  }
  priorityDispatch: {
    enabled: boolean
    priorityLevel: DispatchPriorityLevel
  }
  reservationAccess: {
    enabled: boolean
    advanceBookingHours: number
  }
  premiumRideAccess: {
    enabled: boolean
    allowedCategories: string[]
  }
  airportQueuePriority: {
    enabled: boolean
    queuePriorityLevel: number
  }
  bonusMultiplier: {
    enabled: boolean
    multiplierValue: number
  }
  vipSupport: {
    enabled: boolean
  }
}

export type ReservationAccessLevel = 'none' | 'standard' | 'priority' | 'exclusive'

export type CustomerSupportLevel = 'standard' | 'priority' | 'vip'

/** Single source of truth for all tier-scoped platform benefits. */
export interface TierBenefitsConfig {
  destinationFilters: number
  dailyUsageLimit: number
  weeklyUsageLimit: number
  filterExpirationHours: number
  filterCooldownHours: number
  filterCooldownRule: string
  reservationAccess: ReservationAccessLevel
  advanceBookingAccess: boolean
  reservationPriority: number
  maxReservationDistanceMiles: number
  reservationQueuePriority: number
  dispatchPriorityLevel: number
  rideMatchingPriority: number
  preferredRideAllocation: boolean
  bonusMultiplier: number
  peakHourMultiplier: number
  airportRideBonusEnabled: boolean
  scheduledRideBonusEnabled: boolean
  referralBonusMultiplier: number
  cancellationProtection: boolean
  disputePriority: boolean
  customerSupportLevel: CustomerSupportLevel
  vipSupportAccess: boolean
  minimumAcceptanceRate: number
  minimumCompletionRate: number
  minimumDriverRating: number
  maximumComplaintThreshold: number
  promotionEligibility: boolean
  campaignAccess: boolean
  specialEventBonuses: boolean
  seasonalIncentives: boolean
  destinationFiltersUnlimited?: boolean
  destinationFilterActive?: boolean
  advanceBookingHours?: number
  premiumRideCategories?: string[]
  airportQueuePriorityLevel?: number
  /** Legacy dispatch/reward flags kept in sync for existing consumers. */
  flags: TierBenefitFlags
}

export interface DriverLevel {
  id: string
  name: DriverLevelName
  slug: string
  label: string
  description: string
  level: number
  icon: string
  requiredPoints: number
  requiredRating: number
  requiredTrips: number
  requiredOnlineHours: number
  requiredAcceptanceRate: number
  requiredCompletionRate: number
  requirements: TierRequirements
  benefits: TierBenefitsConfig
  tierColor: string
  tierBadge: string
  benefitsCount: number
  driverCount: number
  status: DriverRewardsEntityStatus
  sortOrder: number
}

export interface PointsRule extends DriverRewardsAuditFields {
  id: string
  ruleName: string
  action: string
  actionType: string
  category: PointsRuleCategory
  points: number
  type: PointsRuleType
  description?: string
  status: DriverRewardsEntityStatus
  lastUpdated: string
}

export type PointsRuleCategory =
  | 'ride_completion'
  | 'rating'
  | 'airport'
  | 'scheduled'
  | 'peak_hour'
  | 'performance'
  | 'penalty'
  | 'bonus'
  | 'other'

export type PerformanceMetricKey =
  | 'acceptance_rate'
  | 'completion_rate'
  | 'customer_rating'
  | 'on_time_arrival'
  | 'complaint_free_period'
  | 'safe_driving_score'

export type RuleEvaluationPeriod = 'daily' | 'weekly' | 'monthly' | 'period'

export interface PerformanceRule extends DriverRewardsAuditFields {
  id: string
  metric: PerformanceMetricKey
  metricLabel: string
  threshold: number
  thresholdLabel: string
  points: number
  period: RuleEvaluationPeriod
  periodDays?: number
  status: DriverRewardsEntityStatus
  lastUpdated: string
}

export interface PenaltyRule extends DriverRewardsAuditFields {
  id: string
  ruleName: string
  actionType: string
  points: number
  status: DriverRewardsEntityStatus
  lastUpdated: string
}

export interface QualificationRule {
  id: string
  tier: DriverLevelName
  tierLabel: string
  requiredTrips: number
  requiredRating: number
  requiredAcceptanceRate: number
  requiredCompletionRate: number
  requiredSafetyScore: number
  requiredComplianceScore: number
  requiredPoints: number
  status: DriverRewardsEntityStatus
  lastUpdated: string
}

export interface DriverPointsHistoryEntry {
  id: string
  driverId: string
  driverName: string
  ruleId: string
  ruleName: string
  points: number
  reason: string
  createdAt: string
}

export interface DriverRewardsWallet {
  driverId: string
  driverName: string
  lifetimePoints: number
  currentPoints: number
  pointsEarned: number
  pointsLost: number
}

export interface PointsRulesOverview {
  totalActiveRules: number
  pointsAwardedToday: number
  pointsDeductedToday: number
  activeBonusCampaigns: number
}

export interface RulesEngineAnalytics {
  mostTriggeredRules: DriverRewardsStatPoint[]
  mostEarnedRewards: DriverRewardsStatPoint[]
  mostUsedBonusCampaigns: DriverRewardsStatPoint[]
  topDriversByPoints: DriverRewardsStatPoint[]
  pointsByRideCategory: DriverRewardsStatPoint[]
  pointsByTier: DriverRewardsStatPoint[]
  promotionRatePercent: number
  demotionRatePercent: number
}

export interface DriverRewardsPublicConfig {
  rideRewards: Array<{ ruleName: string; points: number; category: string }>
  performanceRewards: Array<{ metricLabel: string; thresholdLabel: string; points: number }>
  bonusOpportunities: Array<{ name: string; description: string; rewardPoints: number; tripTarget: number }>
  penaltyRules: Array<{ ruleName: string; points: number }>
}

export interface LevelBenefit {
  id: string
  name: string
  description: string
  assignedTiers: DriverLevelName[]
  category: string
  status: DriverRewardsEntityStatus
}

export interface BonusRule {
  id: string
  name: string
  type: string
  amount: number
  description: string
  status: DriverRewardsEntityStatus
}

export interface BonusCampaign extends DriverRewardsAuditFields {
  id: string
  name: string
  requirement: string
  campaignType: BonusCampaignType
  targetTier?: DriverLevelName
  targetTiers: DriverLevelName[]
  targetCity?: string
  targetCities: string[]
  targetDrivers?: number
  tripTarget: number
  rewardPoints: number
  budget: number
  spent: number
  startDate: string
  endDate: string
  status: PromotionStatus
  enabled: boolean
  description: string
}

export interface IncentiveProgram {
  id: string
  title: string
  description: string
  rewardType: IncentiveRewardType
  rewardValue: number
  tripTarget: number
  startDate: string
  endDate: string
  status: DriverRewardsEntityStatus
  eligibleTiers: DriverLevelName[]
}

export interface DemotionRule {
  id: string
  name: string
  metric: keyof TierRequirements | 'rating' | 'acceptance' | 'compliance' | 'fraud' | 'safety'
  threshold: number
  operator: 'below' | 'above'
  enabled: boolean
  description: string
}

export interface PromotionEngineSettings {
  autoPromotionEnabled: boolean
  autoDemotionEnabled: boolean
  evaluationIntervalHours: number
  notifyPush: boolean
  notifyInApp: boolean
  notifyEmail: boolean
  promotionTemplate: string
  demotionTemplate: string
}

export interface DriverTierHistory {
  id: string
  driverId: string
  driverName: string
  previousTierId: string
  previousTierLabel: string
  newTierId: string
  newTierLabel: string
  reason: TierHistoryReason
  createdAt: string
}

export interface DriverPerformanceRecord {
  id: string
  driverId: string
  driverName: string
  currentLevel: DriverLevelName
  currentPoints: number
  driverRating: number
  totalTrips: number
  onlineHours: number
  totalMileage: number
  weeklyEarnings: number
  acceptanceRate: number
  completionRate: number
  cancellationRate: number
  safetyScore: number
  complianceScore: number
  customerSatisfactionScore: number
  nextTierProgress: number
  nextTierLabel: string
  tierStatus: TierStandingStatus
  city: string
  region: string
  country: string
  rewardsSuspended: boolean
  status: DriverPerformanceStatus
  levelHistory: Array<{ level: DriverLevelName; date: string; reason?: TierHistoryReason }>
  pointsHistory: Array<{ action: string; points: number; date: string }>
  bonusHistory: Array<{ name: string; amount: number; date: string }>
  achievementHistory: Array<{ name: string; date: string }>
  earningsHistory: Array<{ period: string; amount: number }>
  ratingHistory: Array<{ period: string; rating: number }>
}

export interface Promotion {
  id: string
  name: string
  type: PromotionType
  amount: number
  startDate: string
  endDate: string
  status: PromotionStatus
}

export interface Achievement {
  id: string
  name: string
  reward: string
  pointsAwarded: number
  criteria: string
  icon: string
  status: DriverRewardsEntityStatus
}

export interface ProgressionRule {
  id: string
  level: DriverLevelName
  requiredPoints: number
  requiredRating: number
  requiredTrips: number
  requiredOnlineHours: number
  requiredAcceptanceRate: number
  requiredCompletionRate: number
}

export interface RewardNotificationTemplate {
  id: string
  name: string
  template: string
  category: NotificationCategory
  status: DriverRewardsEntityStatus
}

export interface DriverRewardsOverview {
  totalDrivers: number
  totalDriversEnrolled: number
  totalActiveDrivers: number
  totalPointsIssued: number
  totalBonusesPaid: number
  driversNearPromotion: number
  driversAtRiskOfDemotion: number
  averageDriverRating: number
  averageWeeklyEarnings: number
  journeyDrivers: number
  proDrivers: number
  proGoDrivers: number
  eliteDrivers: number
  platinumDrivers: number
  diamondDrivers: number
}

export interface DriverRewardsStatPoint {
  label: string
  value: number
  secondary?: number
}

export interface EarningsAnalyticsData {
  totalDriverEarnings: number
  totalBonusesPaid: number
  totalTipsEarned: number
  totalPromotionsPaid: number
  averageEarningsPerDriver: number
  weeklyEarnings: number
  monthlyEarnings: number
  earningsTrend: DriverRewardsStatPoint[]
  bonusTrend: DriverRewardsStatPoint[]
  tipsTrend: DriverRewardsStatPoint[]
  promotionTrend: DriverRewardsStatPoint[]
  weeklyDriverIncome: DriverRewardsStatPoint[]
  topEarningDrivers: DriverRewardsStatPoint[]
}

export interface LevelAnalyticsData {
  driversPromotedThisMonth: number
  driversDemotedThisMonth: number
  driversNearNextLevel: number
  driversNearDemotion: number
  averagePointsPerDriver: number
  averageDriverRating: number
  promotionRatePercent: number
  demotionRatePercent: number
  retentionRatePercent: number
  averageRevenuePerTier: DriverRewardsStatPoint[]
  acceptanceRateByTier: DriverRewardsStatPoint[]
  destinationFilterUsage: DriverRewardsStatPoint[]
  bonusUsage: DriverRewardsStatPoint[]
  levelDistribution: DriverRewardsStatPoint[]
  promotionRate: DriverRewardsStatPoint[]
  demotionRate: DriverRewardsStatPoint[]
  pointsGrowthTrend: DriverRewardsStatPoint[]
  driverRetention: DriverRewardsStatPoint[]
  leaderboardPoints: DriverRewardsStatPoint[]
  leaderboardTrips: DriverRewardsStatPoint[]
  leaderboardEarnings: DriverRewardsStatPoint[]
  leaderboardRating: DriverRewardsStatPoint[]
  leaderboardSafety: DriverRewardsStatPoint[]
}

export interface DriverRewardsOverviewCharts {
  levelDistribution: DriverRewardsStatPoint[]
  monthlyPointsIssued: DriverRewardsStatPoint[]
  driverProgressTrend: DriverRewardsStatPoint[]
  weeklyEarningsTrend: DriverRewardsStatPoint[]
}

export type EarningsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RewardsSearchResult {
  type: 'driver' | 'tier' | 'achievement' | 'promotion' | 'points'
  id: string
  label: string
  meta: string
}

export interface DriverMyTierSnapshot {
  driverId: string
  driverName: string
  currentTier: DriverLevel
  nextTier?: DriverLevel
  progressPercent: number
  metrics: {
    trips: number
    rating: number
    acceptanceRate: number
    safetyScore: number
  }
  activeBenefits: string[]
  lockedBenefits?: string[]
  achievements: Achievement[]
  bonusOpportunities: IncentiveProgram[]
  tierHistory: DriverTierHistory[]
  rewardsEarned: number
  wallet?: DriverRewardsWallet
  pointsHistory: DriverPointsHistoryEntry[]
  rewardsConfig: DriverRewardsPublicConfig
}
