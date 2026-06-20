import type {
  Achievement,
  BonusCampaign,
  BonusRule,
  DemotionRule,
  DriverLevel,
  DriverPerformanceRecord,
  DriverPointsHistoryEntry,
  DriverRewardsOverview,
  DriverRewardsOverviewCharts,
  DriverRewardsPublicConfig,
  DriverRewardsWallet,
  DriverTierHistory,
  EarningsAnalyticsData,
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
  RulesEngineAnalytics,
} from '@/types/driverRewards'
import type {
  DriverRewardsListParams,
  DriverRewardsListResponse,
  RewardsConfigOverview,
} from '@/types/driverRewardsConfig'
import type { TierDistributionItem, TierManagementOverview } from '@/types/tierManagement'
import type { TierHistoryReason } from '@/types/driverRewards'
import { createDefaultLevel, createPointsRule } from '@/features/driver-rewards/utils/tierDefaults'

export let mockDriverLevels: DriverLevel[] = [
  createDefaultLevel('lvl-journey', 'journey', 'Journey', 'Entry tier for new drivers starting their Alygo career.', 1, 1, { completedTrips: 0, driverRating: 4.5, acceptanceRate: 80 }, undefined, 842, 0),
  createDefaultLevel('lvl-pro-go', 'pro_go', 'Pro', 'Consistent performers with reliable service quality.', 2, 2, { completedTrips: 100, driverRating: 4.5, acceptanceRate: 85 }, undefined, 628, 1000),
  createDefaultLevel('lvl-elite', 'elite', 'Elite', 'High-performing drivers with strong ratings and trip volume.', 3, 3, { completedTrips: 500, driverRating: 4.7, acceptanceRate: 90 }, undefined, 412, 5000),
  createDefaultLevel('lvl-platinum', 'platinum', 'Platinum', 'Top-tier drivers with premium service quality.', 4, 4, { completedTrips: 2000, driverRating: 4.8, acceptanceRate: 92 }, undefined, 186, 12000),
  createDefaultLevel('lvl-diamond', 'diamond', 'Diamond', 'Elite drivers with exceptional performance across all metrics.', 5, 5, { completedTrips: 5000, driverRating: 4.9, acceptanceRate: 95 }, undefined, 74, 25000),
]

export let mockPointsRules: PointsRule[] = [
  createPointsRule('pr-1', 'Standard Ride Completion', 'standard_ride_complete', 5, 'ride_completion'),
  createPointsRule('pr-2', 'Comfort Ride Completion', 'comfort_ride_complete', 8, 'ride_completion'),
  createPointsRule('pr-3', 'Black Ride Completion', 'black_ride_complete', 12, 'ride_completion'),
  createPointsRule('pr-4', 'Black SUV Ride Completion', 'black_suv_ride_complete', 15, 'ride_completion'),
  createPointsRule('pr-5', 'Airport Ride', 'airport_ride', 10, 'airport'),
  createPointsRule('pr-6', 'Scheduled Ride', 'scheduled_ride', 8, 'scheduled'),
  createPointsRule('pr-7', 'Peak Hour Ride', 'peak_hour_ride', 5, 'peak_hour'),
  createPointsRule('pr-8', '5-Star Rating', 'five_star_rating', 2, 'rating'),
  createPointsRule('pr-9', 'Passenger Tip Received', 'passenger_tip', 1, 'bonus'),
]

export let mockPerformanceRules: PerformanceRule[] = [
  { id: 'perf-1', metric: 'acceptance_rate', metricLabel: 'Acceptance Rate', threshold: 95, thresholdLabel: '95%+', points: 50, period: 'monthly', status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
  { id: 'perf-2', metric: 'acceptance_rate', metricLabel: 'Acceptance Rate', threshold: 90, thresholdLabel: '90%+', points: 25, period: 'monthly', status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
  { id: 'perf-3', metric: 'completion_rate', metricLabel: 'Completion Rate', threshold: 98, thresholdLabel: '98%+', points: 40, period: 'monthly', status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
  { id: 'perf-4', metric: 'customer_rating', metricLabel: 'Customer Rating', threshold: 4.9, thresholdLabel: '4.9+', points: 50, period: 'monthly', status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
  { id: 'perf-5', metric: 'on_time_arrival', metricLabel: 'On-Time Arrival', threshold: 95, thresholdLabel: '95%+', points: 30, period: 'monthly', status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
  { id: 'perf-6', metric: 'complaint_free_period', metricLabel: 'Complaint-Free Period', threshold: 30, thresholdLabel: '30 days', points: 100, period: 'period', periodDays: 30, status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
  { id: 'perf-7', metric: 'safe_driving_score', metricLabel: 'Safe Driving Score', threshold: 90, thresholdLabel: '90+', points: 35, period: 'monthly', status: 'active', lastUpdated: '2026-06-01T00:00:00Z' },
]

export let mockPenaltyRules: PenaltyRule[] = [
  { id: 'pen-1', ruleName: 'Ride Cancellation', actionType: 'ride_cancelled', points: -10, status: 'active', lastUpdated: '2026-06-01T00:00:00Z', createdBy: 'Admin', updatedBy: 'Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pen-2', ruleName: 'Late Arrival', actionType: 'late_arrival', points: -15, status: 'active', lastUpdated: '2026-06-01T00:00:00Z', createdBy: 'Admin', updatedBy: 'Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pen-3', ruleName: 'Passenger Complaint', actionType: 'passenger_complaint', points: -25, status: 'active', lastUpdated: '2026-06-01T00:00:00Z', createdBy: 'Admin', updatedBy: 'Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pen-4', ruleName: 'Fraud Warning', actionType: 'fraud_warning', points: -50, status: 'active', lastUpdated: '2026-06-01T00:00:00Z', createdBy: 'Admin', updatedBy: 'Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pen-5', ruleName: 'Compliance Violation', actionType: 'compliance_violation', points: -100, status: 'active', lastUpdated: '2026-06-01T00:00:00Z', createdBy: 'Admin', updatedBy: 'Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pen-6', ruleName: 'Safety Incident', actionType: 'safety_incident', points: -150, status: 'active', lastUpdated: '2026-06-01T00:00:00Z', createdBy: 'Admin', updatedBy: 'Admin', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
]

export let mockQualificationRules: QualificationRule[] = mockDriverLevels.map((level) => ({
  id: `qual-${level.id}`,
  tier: level.name,
  tierLabel: level.label,
  requiredTrips: level.requirements.completedTrips,
  requiredRating: level.requirements.driverRating,
  requiredAcceptanceRate: level.requirements.acceptanceRate,
  requiredCompletionRate: level.requiredCompletionRate,
  requiredSafetyScore: level.requirements.safetyScore,
  requiredComplianceScore: level.requirements.complianceScore,
  requiredPoints: level.requiredPoints,
  status: level.status,
  lastUpdated: '2026-06-01T00:00:00Z',
}))

export let mockDriverPointsHistory: DriverPointsHistoryEntry[] = [
  { id: 'ph-1', driverId: 'DR-1000', driverName: 'Marcus Johnson', ruleId: 'pr-1', ruleName: 'Standard Ride Completion', points: 5, reason: 'Trip TR-5021 completed', createdAt: '2026-06-13T14:00:00Z' },
  { id: 'ph-2', driverId: 'DR-1000', driverName: 'Marcus Johnson', ruleId: 'pr-8', ruleName: '5-Star Rating', points: 2, reason: 'Passenger rated 5 stars', createdAt: '2026-06-13T14:30:00Z' },
  { id: 'ph-3', driverId: 'DR-1000', driverName: 'Marcus Johnson', ruleId: 'pr-5', ruleName: 'Airport Ride', points: 10, reason: 'Airport trip TR-5018', createdAt: '2026-06-12T09:00:00Z' },
  { id: 'ph-4', driverId: 'DR-1000', driverName: 'Marcus Johnson', ruleId: 'pen-1', ruleName: 'Accepted Ride Cancellation', points: -10, reason: 'Cancelled accepted trip TR-5002', createdAt: '2026-06-10T08:00:00Z' },
  { id: 'ph-5', driverId: 'DR-1001', driverName: 'Elena Rodriguez', ruleId: 'pr-3', ruleName: 'Black Ride Completion', points: 12, reason: 'Black ride TR-5030', createdAt: '2026-06-13T16:00:00Z' },
  { id: 'ph-6', driverId: 'DR-1003', driverName: 'Lisa Martinez', ruleId: 'perf-4', ruleName: 'Customer Rating 4.9+', points: 50, reason: 'Monthly performance bonus', createdAt: '2026-06-01T00:00:00Z' },
]

export let mockDriverRewardsWallets: DriverRewardsWallet[] = [
  { driverId: 'DR-1000', driverName: 'Marcus Johnson', lifetimePoints: 8420, currentPoints: 1820, pointsEarned: 1920, pointsLost: 100 },
  { driverId: 'DR-1001', driverName: 'Elena Rodriguez', lifetimePoints: 12400, currentPoints: 3240, pointsEarned: 3380, pointsLost: 140 },
  { driverId: 'DR-1002', driverName: 'David Kim', lifetimePoints: 2100, currentPoints: 620, pointsEarned: 680, pointsLost: 60 },
  { driverId: 'DR-1003', driverName: 'Lisa Martinez', lifetimePoints: 18600, currentPoints: 5420, pointsEarned: 5580, pointsLost: 160 },
  { driverId: 'DR-1004', driverName: 'Carlos Ruiz', lifetimePoints: 980, currentPoints: 180, pointsEarned: 220, pointsLost: 40 },
  { driverId: 'DR-1005', driverName: 'Jennifer Park', lifetimePoints: 7200, currentPoints: 1680, pointsEarned: 1780, pointsLost: 100 },
]

export let mockBonusRules: BonusRule[] = [
  { id: 'br-1', name: 'Weekend Completion Bonus', type: 'weekend_bonus', amount: 50, description: 'Complete 20 trips on weekends', status: 'active' },
  { id: 'br-2', name: 'Airport Streak Bonus', type: 'airport_bonus', amount: 25, description: 'Complete 5 airport rides in a week', status: 'active' },
  { id: 'br-3', name: 'Peak Hour Multiplier', type: 'peak_hour_bonus', amount: 15, description: 'Drive during peak hours', status: 'active' },
  { id: 'br-4', name: 'Diamond Tier Bonus', type: 'diamond_bonus', amount: 100, description: 'Monthly diamond driver bonus', status: 'active' },
]

export let mockLevelBenefits: LevelBenefit[] = [
  {
    id: 'ben-1',
    name: 'Destination Filter',
    description: 'Configure destination filters for eligible rides.',
    assignedTiers: ['pro_go', 'elite', 'platinum', 'diamond'],
    category: 'filters',
    status: 'active',
  },
  {
    id: 'ben-2',
    name: 'Priority Dispatch',
    description: 'Higher priority in trip dispatch queue.',
    assignedTiers: ['platinum', 'diamond'],
    category: 'dispatch',
    status: 'active',
  },
  {
    id: 'ben-3',
    name: 'Airport Priority Queue',
    description: 'Priority access at airport pickup zones.',
    assignedTiers: ['diamond'],
    category: 'queue',
    status: 'active',
  },
  {
    id: 'ben-4',
    name: 'Reservation Access',
    description: 'Access scheduled reservation requests.',
    assignedTiers: ['elite', 'platinum', 'diamond'],
    category: 'reservations',
    status: 'active',
  },
  {
    id: 'ben-5',
    name: 'Premium Ride Access',
    description: 'Eligible for premium ride categories.',
    assignedTiers: ['elite', 'platinum', 'diamond'],
    category: 'rides',
    status: 'active',
  },
  {
    id: 'ben-6',
    name: 'Bonus Multiplier',
    description: 'Increased bonus point multipliers.',
    assignedTiers: ['platinum', 'diamond'],
    category: 'rewards',
    status: 'active',
  },
  {
    id: 'ben-7',
    name: 'VIP Support',
    description: 'Dedicated VIP driver support line.',
    assignedTiers: ['platinum', 'diamond'],
    category: 'support',
    status: 'active',
  },
  {
    id: 'ben-8',
    name: 'Exclusive Promotions',
    description: 'Access to tier-exclusive bonus campaigns.',
    assignedTiers: ['diamond'],
    category: 'rewards',
    status: 'active',
  },
]

const rawDriverPerformance = [
  {
    id: 'dp-1',
    driverId: 'DR-1000',
    driverName: 'Marcus Johnson',
    currentLevel: 'elite',
    currentPoints: 1820,
    driverRating: 4.92,
    totalTrips: 412,
    onlineHours: 186,
    totalMileage: 8420,
    weeklyEarnings: 1240,
    status: 'active',
    levelHistory: [
      { level: 'journey', date: '2025-01-15T00:00:00Z' },
      { level: 'pro_go', date: '2025-04-20T00:00:00Z' },
      { level: 'elite', date: '2025-10-05T00:00:00Z' },
    ],
    pointsHistory: [
      { action: 'Complete Trip', points: 5, date: '2026-06-12T14:00:00Z' },
      { action: 'Receive 5-Star Rating', points: 2, date: '2026-06-12T14:30:00Z' },
      { action: 'Airport Ride', points: 3, date: '2026-06-11T09:00:00Z' },
    ],
    earningsHistory: [
      { period: 'Week 1', amount: 1180 },
      { period: 'Week 2', amount: 1240 },
      { period: 'Week 3', amount: 1310 },
      { period: 'Week 4', amount: 1240 },
    ],
    ratingHistory: [
      { period: 'Jan', rating: 4.88 },
      { period: 'Feb', rating: 4.90 },
      { period: 'Mar', rating: 4.91 },
      { period: 'Apr', rating: 4.92 },
    ],
  },
  {
    id: 'dp-2',
    driverId: 'DR-1001',
    driverName: 'Elena Rodriguez',
    currentLevel: 'platinum',
    currentPoints: 3240,
    driverRating: 4.95,
    totalTrips: 680,
    onlineHours: 320,
    totalMileage: 12400,
    weeklyEarnings: 1580,
    status: 'active',
    levelHistory: [
      { level: 'journey', date: '2024-06-01T00:00:00Z' },
      { level: 'pro_go', date: '2024-09-15T00:00:00Z' },
      { level: 'elite', date: '2025-03-01T00:00:00Z' },
      { level: 'platinum', date: '2025-11-20T00:00:00Z' },
    ],
    pointsHistory: [
      { action: 'Complete Trip', points: 5, date: '2026-06-12T16:00:00Z' },
      { action: 'Black Ride', points: 3, date: '2026-06-12T12:00:00Z' },
    ],
    earningsHistory: [
      { period: 'Week 1', amount: 1520 },
      { period: 'Week 2', amount: 1580 },
      { period: 'Week 3', amount: 1620 },
      { period: 'Week 4', amount: 1580 },
    ],
    ratingHistory: [
      { period: 'Jan', rating: 4.93 },
      { period: 'Feb', rating: 4.94 },
      { period: 'Mar', rating: 4.95 },
      { period: 'Apr', rating: 4.95 },
    ],
  },
  {
    id: 'dp-3',
    driverId: 'DR-1002',
    driverName: 'David Kim',
    currentLevel: 'pro_go',
    currentPoints: 620,
    driverRating: 4.78,
    totalTrips: 145,
    onlineHours: 72,
    totalMileage: 3200,
    weeklyEarnings: 890,
    status: 'active',
    levelHistory: [
      { level: 'journey', date: '2025-08-01T00:00:00Z' },
      { level: 'pro_go', date: '2026-02-15T00:00:00Z' },
    ],
    pointsHistory: [
      { action: 'Complete Trip', points: 5, date: '2026-06-12T10:00:00Z' },
    ],
    earningsHistory: [
      { period: 'Week 1', amount: 820 },
      { period: 'Week 2', amount: 890 },
      { period: 'Week 3', amount: 910 },
      { period: 'Week 4', amount: 890 },
    ],
    ratingHistory: [
      { period: 'Jan', rating: 4.75 },
      { period: 'Feb', rating: 4.76 },
      { period: 'Mar', rating: 4.78 },
      { period: 'Apr', rating: 4.78 },
    ],
  },
  {
    id: 'dp-4',
    driverId: 'DR-1003',
    driverName: 'Lisa Martinez',
    currentLevel: 'diamond',
    currentPoints: 5420,
    driverRating: 4.97,
    totalTrips: 1120,
    onlineHours: 540,
    totalMileage: 18600,
    weeklyEarnings: 1920,
    status: 'active',
    levelHistory: [
      { level: 'journey', date: '2023-03-01T00:00:00Z' },
      { level: 'pro_go', date: '2023-08-01T00:00:00Z' },
      { level: 'elite', date: '2024-02-01T00:00:00Z' },
      { level: 'platinum', date: '2024-10-01T00:00:00Z' },
      { level: 'diamond', date: '2025-06-01T00:00:00Z' },
    ],
    pointsHistory: [
      { action: 'Complete Trip', points: 5, date: '2026-06-12T18:00:00Z' },
      { action: 'Peak Hour Ride', points: 2, date: '2026-06-12T17:00:00Z' },
    ],
    earningsHistory: [
      { period: 'Week 1', amount: 1850 },
      { period: 'Week 2', amount: 1920 },
      { period: 'Week 3', amount: 1980 },
      { period: 'Week 4', amount: 1920 },
    ],
    ratingHistory: [
      { period: 'Jan', rating: 4.96 },
      { period: 'Feb', rating: 4.96 },
      { period: 'Mar', rating: 4.97 },
      { period: 'Apr', rating: 4.97 },
    ],
  },
  {
    id: 'dp-5',
    driverId: 'DR-1004',
    driverName: 'Carlos Ruiz',
    currentLevel: 'journey',
    currentPoints: 180,
    driverRating: 4.62,
    totalTrips: 42,
    onlineHours: 18,
    totalMileage: 980,
    weeklyEarnings: 420,
    status: 'at_risk',
    levelHistory: [{ level: 'journey', date: '2026-03-01T00:00:00Z' }],
    pointsHistory: [
      { action: 'Accepted Ride Cancelled', points: -10, date: '2026-06-10T08:00:00Z' },
      { action: 'Complete Trip', points: 5, date: '2026-06-11T14:00:00Z' },
    ],
    earningsHistory: [
      { period: 'Week 1', amount: 480 },
      { period: 'Week 2', amount: 420 },
      { period: 'Week 3', amount: 390 },
      { period: 'Week 4', amount: 420 },
    ],
    ratingHistory: [
      { period: 'Jan', rating: 4.70 },
      { period: 'Feb', rating: 4.68 },
      { period: 'Mar', rating: 4.65 },
      { period: 'Apr', rating: 4.62 },
    ],
  },
  {
    id: 'dp-6',
    driverId: 'DR-1005',
    driverName: 'Jennifer Park',
    currentLevel: 'elite',
    currentPoints: 1680,
    driverRating: 4.88,
    totalTrips: 358,
    onlineHours: 165,
    totalMileage: 7200,
    weeklyEarnings: 1120,
    status: 'active',
    levelHistory: [
      { level: 'journey', date: '2025-02-01T00:00:00Z' },
      { level: 'pro_go', date: '2025-06-01T00:00:00Z' },
      { level: 'elite', date: '2025-12-01T00:00:00Z' },
    ],
    pointsHistory: [
      { action: 'Scheduled Ride', points: 2, date: '2026-06-12T11:00:00Z' },
    ],
    earningsHistory: [
      { period: 'Week 1', amount: 1080 },
      { period: 'Week 2', amount: 1120 },
      { period: 'Week 3', amount: 1150 },
      { period: 'Week 4', amount: 1120 },
    ],
    ratingHistory: [
      { period: 'Jan', rating: 4.85 },
      { period: 'Feb', rating: 4.86 },
      { period: 'Mar', rating: 4.87 },
      { period: 'Apr', rating: 4.88 },
    ],
  },
]

export let mockDriverPerformance: DriverPerformanceRecord[] = rawDriverPerformance.map((d, i) => ({
  ...d,
  status: d.status as DriverPerformanceRecord['status'],
  acceptanceRate: [94, 97, 89, 98, 82, 93][i],
  completionRate: [96, 98, 94, 99, 88, 95][i],
  cancellationRate: [4, 2, 8, 1, 12, 5][i],
  safetyScore: [92, 96, 88, 98, 78, 91][i],
  complianceScore: [95, 98, 90, 99, 82, 94][i],
  customerSatisfactionScore: [91, 95, 86, 97, 80, 92][i],
  nextTierProgress: [78, 82, 45, 100, 22, 58][i],
  nextTierLabel: ['Platinum', 'Diamond', 'Elite', 'Diamond', 'Pro', 'Platinum'][i],
  tierStatus: (['good_standing', 'good_standing', 'good_standing', 'good_standing', 'at_risk', 'good_standing'] as const)[i],
  city: ['San Francisco', 'San Francisco', 'Oakland', 'San Jose', 'San Francisco', 'Berkeley'][i],
  region: 'Bay Area',
  country: 'United States',
  rewardsSuspended: false,
  bonusHistory: [
    { name: 'Weekend Warrior Bonus', amount: 50, date: '2026-06-07T00:00:00Z' },
    { name: 'Airport Rush Bonus', amount: 25, date: '2026-06-03T00:00:00Z' },
  ],
  achievementHistory: [
    { name: '100 Trips Completed', date: '2025-06-01T00:00:00Z' },
    { name: '4.90 Rating', date: '2025-12-01T00:00:00Z' },
  ],
}))

export let mockPromotions: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Weekend Warrior Bonus',
    type: 'weekend_bonus',
    amount: 50,
    startDate: '2026-06-07T00:00:00Z',
    endDate: '2026-06-08T23:59:59Z',
    status: 'active',
  },
  {
    id: 'promo-2',
    name: 'Airport Rush Bonus',
    type: 'airport_bonus',
    amount: 25,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
  },
  {
    id: 'promo-3',
    name: 'Summer Event Surge',
    type: 'event_bonus',
    amount: 75,
    startDate: '2026-06-15T00:00:00Z',
    endDate: '2026-06-22T23:59:59Z',
    status: 'scheduled',
  },
  {
    id: 'promo-4',
    name: 'Peak Hour Boost',
    type: 'peak_hour_bonus',
    amount: 15,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
  },
  {
    id: 'promo-5',
    name: 'Black Driver Premium',
    type: 'black_driver_bonus',
    amount: 40,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'paused',
  },
  {
    id: 'promo-6',
    name: 'Diamond Elite Bonus',
    type: 'diamond_driver_bonus',
    amount: 100,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
  },
]

export let mockAchievements: Achievement[] = [
  { id: 'ach-1', name: '100 Trips Completed', reward: 'Bronze Badge', pointsAwarded: 50, criteria: 'Complete 100 trips', icon: 'route', status: 'active' },
  { id: 'ach-2', name: '500 Trips Completed', reward: 'Silver Badge', pointsAwarded: 150, criteria: 'Complete 500 trips', icon: 'route', status: 'active' },
  { id: 'ach-3', name: '1000 Trips Completed', reward: 'Gold Badge', pointsAwarded: 300, criteria: 'Complete 1000 trips', icon: 'route', status: 'active' },
  { id: 'ach-4', name: '5000 Trips Completed', reward: 'Platinum Badge', pointsAwarded: 750, criteria: 'Complete 5000 trips', icon: 'route', status: 'active' },
  { id: 'ach-5', name: 'Top Rated Driver', reward: 'Top Rated Badge', pointsAwarded: 175, criteria: 'Maintain 4.95+ rating for 30 days', icon: 'star', status: 'active' },
  { id: 'ach-6', name: 'Elite Driver', reward: 'Elite Badge', pointsAwarded: 200, criteria: 'Reach Elite tier', icon: 'award', status: 'active' },
  { id: 'ach-7', name: 'Diamond Driver', reward: 'Diamond Crown', pointsAwarded: 500, criteria: 'Reach Diamond tier', icon: 'crown', status: 'active' },
  { id: 'ach-8', name: '5-Star Streak', reward: 'Five Star Pro', pointsAwarded: 100, criteria: 'Receive 50 consecutive 5-star ratings', icon: 'star', status: 'active' },
  { id: 'ach-9', name: 'Safe Driver', reward: 'Safety Shield', pointsAwarded: 125, criteria: 'Zero safety incidents for 90 days', icon: 'shield', status: 'active' },
  { id: 'ach-10', name: 'Airport Specialist', reward: 'Airport Expert', pointsAwarded: 125, criteria: 'Complete 100 airport trips', icon: 'plane', status: 'active' },
  { id: 'ach-11', name: 'Peak Hour Champion', reward: 'Peak Badge', pointsAwarded: 90, criteria: 'Complete 30 peak hour trips in a week', icon: 'zap', status: 'active' },
  { id: 'ach-12', name: 'Weekend Warrior', reward: 'Weekend Badge', pointsAwarded: 80, criteria: 'Complete 20 weekend trips', icon: 'calendar', status: 'active' },
  { id: 'ach-13', name: 'Black Elite Driver', reward: 'Black Elite Badge', pointsAwarded: 250, criteria: 'Complete 50 Black rides with 4.9+ rating', icon: 'car', status: 'active' },
]

export let mockProgressionRules: ProgressionRule[] = mockDriverLevels.map((level) => ({
  id: `prog-${level.id}`,
  level: level.name,
  requiredPoints: level.requiredPoints,
  requiredRating: level.requiredRating,
  requiredTrips: level.requiredTrips,
  requiredOnlineHours: level.requiredOnlineHours,
  requiredAcceptanceRate: level.requiredAcceptanceRate,
  requiredCompletionRate: level.requiredCompletionRate,
}))

export let mockIncentivePrograms: IncentiveProgram[] = [
  {
    id: 'inc-1',
    title: 'Peak Hour Bonus',
    description: 'Complete 20 trips during peak hours',
    rewardType: 'fixed_cash',
    rewardValue: 50,
    tripTarget: 20,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
    eligibleTiers: ['journey', 'pro_go', 'elite', 'platinum', 'diamond'],
  },
  {
    id: 'inc-2',
    title: 'Weekend Challenge',
    description: 'Complete 50 trips on weekends',
    rewardType: 'fixed_cash',
    rewardValue: 150,
    tripTarget: 50,
    startDate: '2026-06-07T00:00:00Z',
    endDate: '2026-06-28T23:59:59Z',
    status: 'active',
    eligibleTiers: ['pro_go', 'elite', 'platinum', 'diamond'],
  },
  {
    id: 'inc-3',
    title: 'Airport Bonus',
    description: 'Complete 10 airport trips',
    rewardType: 'fixed_cash',
    rewardValue: 30,
    tripTarget: 10,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
    eligibleTiers: ['journey', 'pro_go', 'elite', 'platinum', 'diamond'],
  },
  {
    id: 'inc-4',
    title: 'Diamond Retention Boost',
    description: 'Maintain Diamond tier for 30 consecutive days',
    rewardType: 'multiplier',
    rewardValue: 1.25,
    tripTarget: 0,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    status: 'active',
    eligibleTiers: ['diamond'],
  },
]

export let mockBonusCampaigns: BonusCampaign[] = [
  {
    id: 'bc-1',
    name: 'Weekend Bonus',
    requirement: 'Complete 20 rides',
    campaignType: 'demand_based',
    targetTiers: ['journey', 'pro_go', 'elite', 'platinum', 'diamond'],
    targetCities: ['San Francisco', 'Oakland'],
    tripTarget: 20,
    rewardPoints: 100,
    budget: 25000,
    spent: 8420,
    startDate: '2026-06-07T00:00:00Z',
    endDate: '2026-06-08T23:59:59Z',
    status: 'active',
    enabled: true,
    description: 'Complete 20 rides on weekend — earn 100 points.',
  },
  {
    id: 'bc-2',
    name: 'Airport Challenge',
    requirement: 'Complete 10 airport rides',
    campaignType: 'city_based',
    targetTier: 'pro_go',
    targetTiers: ['pro_go', 'elite', 'platinum', 'diamond'],
    targetCity: 'San Francisco',
    targetCities: ['San Francisco'],
    tripTarget: 10,
    rewardPoints: 75,
    budget: 15000,
    spent: 4200,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
    enabled: true,
    description: 'Complete 10 airport rides — earn 75 points.',
  },
  {
    id: 'bc-3',
    name: 'Peak Hour Challenge',
    requirement: 'Complete 15 peak rides',
    campaignType: 'demand_based',
    targetTiers: ['elite', 'platinum', 'diamond'],
    targetCities: ['San Francisco', 'San Jose', 'Oakland'],
    tripTarget: 15,
    rewardPoints: 50,
    budget: 8000,
    spent: 1200,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
    enabled: true,
    description: 'Complete 15 peak-hour rides — earn 50 points.',
  },
  {
    id: 'bc-4',
    name: 'Diamond Tier Exclusive',
    requirement: 'Monthly retention reward',
    campaignType: 'tier_based',
    targetTier: 'diamond',
    targetTiers: ['diamond'],
    targetCities: [],
    targetDrivers: 74,
    tripTarget: 0,
    rewardPoints: 200,
    budget: 12000,
    spent: 6800,
    startDate: '2026-06-01T00:00:00Z',
    endDate: '2026-06-30T23:59:59Z',
    status: 'active',
    enabled: true,
    description: 'Monthly retention bonus for Diamond tier drivers.',
  },
]

export let mockDemotionRules: DemotionRule[] = [
  { id: 'dr-1', name: 'Rating Drop Below Threshold', metric: 'rating', threshold: 4.5, operator: 'below', enabled: true, description: 'Demote when driver rating falls below tier minimum.' },
  { id: 'dr-2', name: 'Low Acceptance Rate', metric: 'acceptance', threshold: 80, operator: 'below', enabled: true, description: 'Demote when acceptance rate drops below configured threshold.' },
  { id: 'dr-3', name: 'Compliance Violation', metric: 'compliance', threshold: 85, operator: 'below', enabled: true, description: 'Demote on compliance score violations.' },
  { id: 'dr-4', name: 'Fraud Incident', metric: 'fraud', threshold: 90, operator: 'below', enabled: true, description: 'Demote when fraud score drops after incident review.' },
  { id: 'dr-5', name: 'Safety Incident', metric: 'safety', threshold: 80, operator: 'below', enabled: false, description: 'Demote after verified safety incidents.' },
]

export let mockPromotionEngineSettings: PromotionEngineSettings = {
  autoPromotionEnabled: true,
  autoDemotionEnabled: true,
  evaluationIntervalHours: 24,
  notifyPush: true,
  notifyInApp: true,
  notifyEmail: true,
  promotionTemplate: 'Congratulations! You have been promoted from {previousTier} to {newTier}.',
  demotionTemplate: 'Your tier has changed from {previousTier} to {newTier}. Review requirements to regain status.',
}

export let mockDriverTierHistory: DriverTierHistory[] = [
  {
    id: 'th-1',
    driverId: 'DR-1000',
    driverName: 'Marcus Johnson',
    previousTierId: 'lvl-elite',
    previousTierLabel: 'Elite',
    newTierId: 'lvl-platinum',
    newTierLabel: 'Platinum',
    reason: 'auto_promotion',
    createdAt: '2026-05-12T08:00:00Z',
  },
  {
    id: 'th-2',
    driverId: 'DR-1004',
    driverName: 'Carlos Ruiz',
    previousTierId: 'lvl-pro',
    previousTierLabel: 'Pro',
    newTierId: 'lvl-journey',
    newTierLabel: 'Journey',
    reason: 'auto_demotion',
    createdAt: '2026-06-02T14:30:00Z',
  },
  {
    id: 'th-3',
    driverId: 'DR-1003',
    driverName: 'Lisa Martinez',
    previousTierId: 'lvl-platinum',
    previousTierLabel: 'Platinum',
    newTierId: 'lvl-diamond',
    newTierLabel: 'Diamond',
    reason: 'auto_promotion',
    createdAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 'th-4',
    driverId: 'DR-1001',
    driverName: 'Elena Rodriguez',
    previousTierId: 'lvl-pro-go',
    previousTierLabel: 'Pro',
    newTierId: 'lvl-elite',
    newTierLabel: 'Elite',
    reason: 'auto_promotion',
    createdAt: '2026-06-08T16:20:00Z',
  },
  {
    id: 'th-5',
    driverId: 'DR-1005',
    driverName: 'Jennifer Park',
    previousTierId: 'lvl-elite',
    previousTierLabel: 'Elite',
    newTierId: 'lvl-pro-go',
    newTierLabel: 'Pro',
    reason: 'auto_demotion',
    createdAt: '2026-06-05T09:15:00Z',
  },
  {
    id: 'th-6',
    driverId: 'DR-1002',
    driverName: 'David Kim',
    previousTierId: 'lvl-journey',
    previousTierLabel: 'Journey',
    newTierId: 'lvl-pro-go',
    newTierLabel: 'Pro',
    reason: 'manual_promotion',
    createdAt: '2026-06-01T11:45:00Z',
  },
]

export let mockNotificationTemplates: RewardNotificationTemplate[] = [
  {
    id: 'nt-1',
    name: 'Level Up',
    template: 'Congratulations! You reached {level} Level.',
    category: 'level_up',
    status: 'active',
  },
  {
    id: 'nt-2',
    name: 'Points Earned',
    template: 'You earned +{points} points.',
    category: 'points_earned',
    status: 'active',
  },
  {
    id: 'nt-3',
    name: 'Bonus Unlocked',
    template: 'You unlocked a {bonusName} bonus worth ${amount}.',
    category: 'bonus_unlocked',
    status: 'active',
  },
  {
    id: 'nt-4',
    name: 'Achievement Earned',
    template: 'Achievement unlocked: {achievementName}!',
    category: 'achievement_earned',
    status: 'active',
  },
  {
    id: 'nt-5',
    name: 'Promotion Activated',
    template: '{promotionName} Activated.',
    category: 'promotion_activated',
    status: 'active',
  },
]

export function computeDriverRewardsOverview(): DriverRewardsOverview {
  const active = mockDriverPerformance.filter((d) => d.status === 'active')
  const nearPromotion = mockDriverPerformance.filter((d) => {
    const nextLevel = mockDriverLevels.find((l) => l.requiredPoints > d.currentPoints)
    if (!nextLevel) return false
    const gap = nextLevel.requiredPoints - d.currentPoints
    return gap <= 200
  }).length

  return {
    totalDrivers: mockDriverLevels.reduce((sum, l) => sum + l.driverCount, 0),
    totalDriversEnrolled: mockDriverPerformance.length + 184,
    totalActiveDrivers: active.length + 178,
    totalPointsIssued: mockDriverPerformance.reduce((sum, d) => sum + d.currentPoints, 0) + 84200,
    totalBonusesPaid: 42800,
    driversNearPromotion: nearPromotion,
    driversAtRiskOfDemotion: mockDriverPerformance.filter((d) => d.tierStatus === 'at_risk').length,
    averageDriverRating: mockDriverPerformance.reduce((sum, d) => sum + d.driverRating, 0) / mockDriverPerformance.length,
    averageWeeklyEarnings: mockDriverPerformance.reduce((sum, d) => sum + d.weeklyEarnings, 0) / mockDriverPerformance.length,
    journeyDrivers: mockDriverLevels.find((l) => l.name === 'journey')?.driverCount ?? 0,
    proDrivers: mockDriverLevels.find((l) => l.name === 'pro_go')?.driverCount ?? 0,
    proGoDrivers: mockDriverLevels.find((l) => l.name === 'pro_go')?.driverCount ?? 0,
    eliteDrivers: mockDriverLevels.find((l) => l.name === 'elite')?.driverCount ?? 0,
    platinumDrivers: mockDriverLevels.find((l) => l.name === 'platinum')?.driverCount ?? 0,
    diamondDrivers: mockDriverLevels.find((l) => l.name === 'diamond')?.driverCount ?? 0,
  }
}

export const mockOverviewCharts: DriverRewardsOverviewCharts = {
  levelDistribution: [
    { label: 'Journey', value: 842 },
    { label: 'Pro', value: 628 },
    { label: 'Elite', value: 412 },
    { label: 'Platinum', value: 186 },
    { label: 'Diamond', value: 74 },
  ],
  monthlyPointsIssued: [
    { label: 'Jan', value: 12400 },
    { label: 'Feb', value: 13200 },
    { label: 'Mar', value: 14100 },
    { label: 'Apr', value: 14800 },
    { label: 'May', value: 15600 },
    { label: 'Jun', value: 16200 },
  ],
  driverProgressTrend: [
    { label: 'Week 1', value: 82 },
    { label: 'Week 2', value: 85 },
    { label: 'Week 3', value: 88 },
    { label: 'Week 4', value: 91 },
  ],
  weeklyEarningsTrend: [
    { label: 'Week 1', value: 980 },
    { label: 'Week 2', value: 1020 },
    { label: 'Week 3', value: 1050 },
    { label: 'Week 4', value: 1080 },
  ],
}

const periodData: Record<string, Omit<EarningsAnalyticsData, 'totalPromotionsPaid' | 'promotionTrend'>> = {
  daily: {
    totalDriverEarnings: 48200,
    totalBonusesPaid: 3200,
    totalTipsEarned: 8400,
    averageEarningsPerDriver: 185,
    weeklyEarnings: 48200,
    monthlyEarnings: 48200,
    earningsTrend: [
      { label: 'Mon', value: 6200 },
      { label: 'Tue', value: 6800 },
      { label: 'Wed', value: 7100 },
      { label: 'Thu', value: 7400 },
      { label: 'Fri', value: 8200 },
      { label: 'Sat', value: 6800 },
      { label: 'Sun', value: 5700 },
    ],
    bonusTrend: [
      { label: 'Mon', value: 420 },
      { label: 'Tue', value: 480 },
      { label: 'Wed', value: 510 },
      { label: 'Thu', value: 520 },
      { label: 'Fri', value: 680 },
      { label: 'Sat', value: 490 },
      { label: 'Sun', value: 380 },
    ],
    tipsTrend: [
      { label: 'Mon', value: 1100 },
      { label: 'Tue', value: 1200 },
      { label: 'Wed', value: 1250 },
      { label: 'Thu', value: 1300 },
      { label: 'Fri', value: 1450 },
      { label: 'Sat', value: 1180 },
      { label: 'Sun', value: 920 },
    ],
    weeklyDriverIncome: [
      { label: 'Mon', value: 6200 },
      { label: 'Tue', value: 6800 },
      { label: 'Wed', value: 7100 },
      { label: 'Thu', value: 7400 },
      { label: 'Fri', value: 8200 },
      { label: 'Sat', value: 6800 },
      { label: 'Sun', value: 5700 },
    ],
    topEarningDrivers: [
      { label: 'Lisa Martinez', value: 420 },
      { label: 'Elena Rodriguez', value: 380 },
      { label: 'Marcus Johnson', value: 320 },
      { label: 'Jennifer Park', value: 280 },
      { label: 'David Kim', value: 220 },
    ],
  },
  weekly: {
    totalDriverEarnings: 482000,
    totalBonusesPaid: 32000,
    totalTipsEarned: 84000,
    averageEarningsPerDriver: 1280,
    weeklyEarnings: 482000,
    monthlyEarnings: 482000,
    earningsTrend: [
      { label: 'W1', value: 112000 },
      { label: 'W2', value: 118000 },
      { label: 'W3', value: 122000 },
      { label: 'W4', value: 130000 },
    ],
    bonusTrend: [
      { label: 'W1', value: 7200 },
      { label: 'W2', value: 7800 },
      { label: 'W3', value: 8200 },
      { label: 'W4', value: 8800 },
    ],
    tipsTrend: [
      { label: 'W1', value: 19000 },
      { label: 'W2', value: 20500 },
      { label: 'W3', value: 21200 },
      { label: 'W4', value: 23300 },
    ],
    weeklyDriverIncome: [
      { label: 'W1', value: 112000 },
      { label: 'W2', value: 118000 },
      { label: 'W3', value: 122000 },
      { label: 'W4', value: 130000 },
    ],
    topEarningDrivers: [
      { label: 'Lisa Martinez', value: 1920 },
      { label: 'Elena Rodriguez', value: 1580 },
      { label: 'Marcus Johnson', value: 1240 },
      { label: 'Jennifer Park', value: 1120 },
      { label: 'David Kim', value: 890 },
    ],
  },
  monthly: {
    totalDriverEarnings: 1928000,
    totalBonusesPaid: 128000,
    totalTipsEarned: 336000,
    averageEarningsPerDriver: 5120,
    weeklyEarnings: 482000,
    monthlyEarnings: 1928000,
    earningsTrend: [
      { label: 'Jan', value: 1680000 },
      { label: 'Feb', value: 1740000 },
      { label: 'Mar', value: 1800000 },
      { label: 'Apr', value: 1860000 },
      { label: 'May', value: 1900000 },
      { label: 'Jun', value: 1928000 },
    ],
    bonusTrend: [
      { label: 'Jan', value: 98000 },
      { label: 'Feb', value: 102000 },
      { label: 'Mar', value: 108000 },
      { label: 'Apr', value: 115000 },
      { label: 'May', value: 122000 },
      { label: 'Jun', value: 128000 },
    ],
    tipsTrend: [
      { label: 'Jan', value: 280000 },
      { label: 'Feb', value: 295000 },
      { label: 'Mar', value: 308000 },
      { label: 'Apr', value: 318000 },
      { label: 'May', value: 328000 },
      { label: 'Jun', value: 336000 },
    ],
    weeklyDriverIncome: [
      { label: 'W1', value: 112000 },
      { label: 'W2', value: 118000 },
      { label: 'W3', value: 122000 },
      { label: 'W4', value: 130000 },
    ],
    topEarningDrivers: [
      { label: 'Lisa Martinez', value: 7680 },
      { label: 'Elena Rodriguez', value: 6320 },
      { label: 'Marcus Johnson', value: 4960 },
      { label: 'Jennifer Park', value: 4480 },
      { label: 'David Kim', value: 3560 },
    ],
  },
  yearly: {
    totalDriverEarnings: 23136000,
    totalBonusesPaid: 1536000,
    totalTipsEarned: 4032000,
    averageEarningsPerDriver: 61440,
    weeklyEarnings: 482000,
    monthlyEarnings: 1928000,
    earningsTrend: [
      { label: '2022', value: 18200000 },
      { label: '2023', value: 20100000 },
      { label: '2024', value: 21800000 },
      { label: '2025', value: 22600000 },
      { label: '2026', value: 23136000 },
    ],
    bonusTrend: [
      { label: '2022', value: 980000 },
      { label: '2023', value: 1120000 },
      { label: '2024', value: 1280000 },
      { label: '2025', value: 1420000 },
      { label: '2026', value: 1536000 },
    ],
    tipsTrend: [
      { label: '2022', value: 2800000 },
      { label: '2023', value: 3200000 },
      { label: '2024', value: 3600000 },
      { label: '2025', value: 3840000 },
      { label: '2026', value: 4032000 },
    ],
    weeklyDriverIncome: [
      { label: 'Q1', value: 4200000 },
      { label: 'Q2', value: 4800000 },
      { label: 'Q3', value: 5200000 },
      { label: 'Q4', value: 5600000 },
    ],
    topEarningDrivers: [
      { label: 'Lisa Martinez', value: 92160 },
      { label: 'Elena Rodriguez', value: 75840 },
      { label: 'Marcus Johnson', value: 59520 },
      { label: 'Jennifer Park', value: 53760 },
      { label: 'David Kim', value: 42720 },
    ],
  },
}

export function getEarningsAnalytics(period: string): EarningsAnalyticsData {
  const base = periodData[period] ?? periodData.monthly
  return {
    ...base,
    totalPromotionsPaid: Math.round(base.totalBonusesPaid * 0.42),
    promotionTrend: base.bonusTrend.map((point) => ({
      ...point,
      value: Math.round(point.value * 0.65),
    })),
  }
}

export const mockLevelAnalytics: LevelAnalyticsData = {
  driversPromotedThisMonth: 24,
  driversDemotedThisMonth: 3,
  driversNearNextLevel: 18,
  driversNearDemotion: 7,
  averagePointsPerDriver: 1420,
  averageDriverRating: 4.87,
  promotionRatePercent: 8.2,
  demotionRatePercent: 1.1,
  retentionRatePercent: 93,
  averageRevenuePerTier: [
    { label: 'Journey', value: 820 },
    { label: 'Pro', value: 980 },
    { label: 'Elite', value: 1180 },
    { label: 'Platinum', value: 1480 },
    { label: 'Diamond', value: 1920 },
  ],
  acceptanceRateByTier: [
    { label: 'Journey', value: 86 },
    { label: 'Pro', value: 89 },
    { label: 'Elite', value: 92 },
    { label: 'Platinum', value: 94 },
    { label: 'Diamond', value: 96 },
  ],
  destinationFilterUsage: [
    { label: 'Journey', value: 1240 },
    { label: 'Pro', value: 2180 },
    { label: 'Elite', value: 3420 },
    { label: 'Platinum', value: 4680 },
    { label: 'Diamond', value: 5920 },
  ],
  bonusUsage: [
    { label: 'Peak Hour', value: 420 },
    { label: 'Weekend', value: 280 },
    { label: 'Airport', value: 190 },
    { label: 'Event', value: 120 },
    { label: 'Tier', value: 340 },
  ],
  levelDistribution: mockOverviewCharts.levelDistribution,
  promotionRate: [
    { label: 'Jan', value: 18 },
    { label: 'Feb', value: 20 },
    { label: 'Mar', value: 22 },
    { label: 'Apr', value: 21 },
    { label: 'May', value: 23 },
    { label: 'Jun', value: 24 },
  ],
  demotionRate: [
    { label: 'Jan', value: 5 },
    { label: 'Feb', value: 4 },
    { label: 'Mar', value: 3 },
    { label: 'Apr', value: 4 },
    { label: 'May', value: 2 },
    { label: 'Jun', value: 3 },
  ],
  pointsGrowthTrend: mockOverviewCharts.monthlyPointsIssued,
  driverRetention: [
    { label: 'Jan', value: 88 },
    { label: 'Feb', value: 89 },
    { label: 'Mar', value: 90 },
    { label: 'Apr', value: 91 },
    { label: 'May', value: 92 },
    { label: 'Jun', value: 93 },
  ],
  leaderboardPoints: [
    { label: 'Lisa Martinez', value: 5420 },
    { label: 'Elena Rodriguez', value: 3240 },
    { label: 'Marcus Johnson', value: 1820 },
    { label: 'Jennifer Park', value: 1680 },
    { label: 'David Kim', value: 620 },
  ],
  leaderboardTrips: [
    { label: 'Lisa Martinez', value: 1120 },
    { label: 'Elena Rodriguez', value: 680 },
    { label: 'Marcus Johnson', value: 412 },
    { label: 'Jennifer Park', value: 358 },
    { label: 'David Kim', value: 145 },
  ],
  leaderboardEarnings: [
    { label: 'Lisa Martinez', value: 1920 },
    { label: 'Elena Rodriguez', value: 1580 },
    { label: 'Marcus Johnson', value: 1240 },
    { label: 'Jennifer Park', value: 1120 },
    { label: 'David Kim', value: 890 },
  ],
  leaderboardRating: [
    { label: 'Lisa Martinez', value: 497 },
    { label: 'Elena Rodriguez', value: 495 },
    { label: 'Marcus Johnson', value: 492 },
    { label: 'Jennifer Park', value: 488 },
    { label: 'David Kim', value: 478 },
  ],
  leaderboardSafety: [
    { label: 'Lisa Martinez', value: 98 },
    { label: 'Elena Rodriguez', value: 96 },
    { label: 'Marcus Johnson', value: 92 },
    { label: 'Jennifer Park', value: 91 },
    { label: 'David Kim', value: 88 },
  ],
}

export function computePointsRulesOverview(): PointsRulesOverview {
  const today = new Date().toISOString().slice(0, 10)
  const todayHistory = mockDriverPointsHistory.filter((h) => h.createdAt.startsWith(today))
  return {
    totalActiveRules:
      mockPointsRules.filter((r) => r.status === 'active').length +
      mockPerformanceRules.filter((r) => r.status === 'active').length +
      mockPenaltyRules.filter((r) => r.status === 'active').length,
    pointsAwardedToday: todayHistory.filter((h) => h.points > 0).reduce((s, h) => s + h.points, 0) || 1842,
    pointsDeductedToday: Math.abs(todayHistory.filter((h) => h.points < 0).reduce((s, h) => s + h.points, 0)) || 120,
    activeBonusCampaigns: mockBonusCampaigns.filter((c) => c.enabled && c.status === 'active').length,
  }
}

export function computeRulesEngineAnalytics(): RulesEngineAnalytics {
  return {
    mostTriggeredRules: [
      { label: 'Standard Ride Completion', value: 8420 },
      { label: '5-Star Rating', value: 3180 },
      { label: 'Airport Ride', value: 1240 },
      { label: 'Black Ride Completion', value: 980 },
      { label: 'Peak Hour Ride', value: 760 },
    ],
    mostEarnedRewards: [
      { label: 'Ride Completion', value: 12400 },
      { label: 'Performance Bonuses', value: 4200 },
      { label: 'Bonus Campaigns', value: 2800 },
      { label: 'Rating Rewards', value: 2100 },
    ],
    mostUsedBonusCampaigns: [
      { label: 'Weekend Bonus', value: 420 },
      { label: 'Airport Challenge', value: 280 },
      { label: 'Peak Hour Challenge', value: 190 },
      { label: 'Diamond Tier Exclusive', value: 74 },
    ],
    topDriversByPoints: mockDriverRewardsWallets
      .sort((a, b) => b.currentPoints - a.currentPoints)
      .slice(0, 5)
      .map((w) => ({ label: w.driverName, value: w.currentPoints })),
    pointsByRideCategory: [
      { label: 'Standard', value: 4200 },
      { label: 'Comfort', value: 2800 },
      { label: 'Black', value: 1900 },
      { label: 'Black SUV', value: 1200 },
      { label: 'Airport', value: 2400 },
    ],
    pointsByTier: [
      { label: 'Journey', value: 8420 },
      { label: 'Pro', value: 12400 },
      { label: 'Elite', value: 18600 },
      { label: 'Platinum', value: 9200 },
      { label: 'Diamond', value: 4800 },
    ],
    promotionRatePercent: mockLevelAnalytics.promotionRatePercent,
    demotionRatePercent: mockLevelAnalytics.demotionRatePercent,
  }
}

export function buildDriverRewardsPublicConfig(): DriverRewardsPublicConfig {
  return {
    rideRewards: mockPointsRules
      .filter((r) => r.status === 'active' && r.points > 0 && r.category !== 'penalty')
      .map((r) => ({ ruleName: r.ruleName, points: r.points, category: r.category })),
    performanceRewards: mockPerformanceRules
      .filter((r) => r.status === 'active')
      .map((r) => ({ metricLabel: r.metricLabel, thresholdLabel: r.thresholdLabel, points: r.points })),
    bonusOpportunities: mockBonusCampaigns
      .filter((c) => c.enabled && c.status === 'active')
      .map((c) => ({
        name: c.name,
        description: c.description,
        rewardPoints: c.rewardPoints,
        tripTarget: c.tripTarget,
      })),
    penaltyRules: mockPenaltyRules
      .filter((r) => r.status === 'active')
      .map((r) => ({ ruleName: r.ruleName, points: r.points })),
  }
}

export function paginateDriverRewardsList<T extends object>(
  items: T[],
  params: DriverRewardsListParams,
  searchFields: (keyof T)[],
  statusField: keyof T = 'status' as keyof T,
): DriverRewardsListResponse<T> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const status = (params.status ?? '').trim()

  let filtered = [...items]

  if (search) {
    filtered = filtered.filter((item) =>
      searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(search)),
    )
  }

  if (status) {
    filtered = filtered.filter((item) => String(item[statusField] ?? '') === status)
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export function paginateBonusPrograms(
  items: BonusCampaign[],
  params: DriverRewardsListParams,
): DriverRewardsListResponse<BonusCampaign> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const status = (params.status ?? '').trim()

  let filtered = [...items]

  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.requirement.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search),
    )
  }

  if (status === 'active') {
    filtered = filtered.filter((item) => item.enabled && item.status === 'active')
  } else if (status === 'inactive') {
    filtered = filtered.filter((item) => !item.enabled || item.status !== 'active')
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export function computeRewardsConfigOverview(): RewardsConfigOverview {
  const highestReward = mockPointsRules.reduce(
    (max, rule) => (rule.points > max.points ? rule : max),
    mockPointsRules[0],
  )
  const highestPenalty = mockPenaltyRules.reduce(
    (min, rule) => (rule.points < min.points ? rule : min),
    mockPenaltyRules[0],
  )

  const activeConfigurations =
    mockPointsRules.filter((r) => r.status === 'active').length +
    mockPerformanceRules.filter((r) => r.status === 'active').length +
    mockBonusCampaigns.filter((c) => c.enabled && c.status === 'active').length +
    mockPenaltyRules.filter((r) => r.status === 'active').length

  return {
    totalRewardRules: mockPointsRules.length,
    totalBonusPrograms: mockBonusCampaigns.length,
    totalPenaltyRules: mockPenaltyRules.length,
    highestRewardAction: highestReward
      ? `${highestReward.ruleName} (+${highestReward.points} pts)`
      : '—',
    highestPenaltyRule: highestPenalty
      ? `${highestPenalty.ruleName} (${highestPenalty.points} pts)`
      : '—',
    activeConfigurations,
  }
}

export function computeTierDistribution(): TierDistributionItem[] {
  const overview = computeDriverRewardsOverview()
  const total = overview.totalDrivers || 1
  const tiers = [
    { label: 'Journey', count: overview.journeyDrivers },
    { label: 'Pro', count: overview.proDrivers },
    { label: 'Elite', count: overview.eliteDrivers },
    { label: 'Platinum', count: overview.platinumDrivers },
    { label: 'Diamond', count: overview.diamondDrivers },
  ]
  return tiers.map((tier) => ({
    ...tier,
    percent: Math.round((tier.count / total) * 100),
  }))
}

export function syncTierBenefitAssignments(tierName: string, benefitIds: string[]) {
  mockLevelBenefits.forEach((benefit) => {
    const tiers = new Set(benefit.assignedTiers)
    if (benefitIds.includes(benefit.id)) {
      tiers.add(tierName)
    } else {
      tiers.delete(tierName)
    }
    benefit.assignedTiers = [...tiers]
  })
}

export function getTierBenefitIds(tierName: string): string[] {
  return mockLevelBenefits
    .filter((benefit) => benefit.assignedTiers.includes(tierName))
    .map((benefit) => benefit.id)
}

const BENEFIT_DISPLAY_LABELS: Record<string, string> = {
  'Destination Filter': 'Destination Filter',
  'Priority Dispatch': 'Priority Dispatch',
  'Airport Priority Queue': 'Airport Queue',
  'Reservation Access': 'Reservation Access',
  'Premium Ride Access': 'Premium Access',
  'Bonus Multiplier': 'Bonus Multiplier',
  'VIP Support': 'VIP Support',
  'Exclusive Promotions': 'Promotions',
}

function formatTierChangeType(reason: TierHistoryReason): string {
  switch (reason) {
    case 'auto_promotion':
      return 'Promotion'
    case 'auto_demotion':
      return 'Demotion'
    case 'manual_promotion':
      return 'Manual Promotion'
    case 'manual_demotion':
      return 'Manual Demotion'
    case 'compliance':
      return 'Compliance'
    case 'safety':
      return 'Safety'
    case 'fraud':
      return 'Fraud'
    default:
      return String(reason).replace(/_/g, ' ')
  }
}

export function computeTierManagementOverview(): TierManagementOverview {
  const overview = computeDriverRewardsOverview()
  const activeTiers = mockDriverLevels.filter((level) => level.status === 'active').length
  const activeBenefits = mockLevelBenefits.filter((benefit) => benefit.status === 'active')

  const recentTierChanges = [...mockDriverTierHistory]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((entry) => ({
      id: entry.id,
      driverName: entry.driverName,
      previousTier: entry.previousTierLabel,
      newTier: entry.newTierLabel,
      changeType: formatTierChangeType(entry.reason),
      date: entry.createdAt,
    }))

  return {
    totalDrivers: overview.totalDrivers,
    activeTiers,
    promotionCandidates: overview.driversNearPromotion,
    demotionCandidates: overview.driversAtRiskOfDemotion,
    recentTierChanges,
    tierDistribution: computeTierDistribution(),
    benefitsSummary: {
      totalBenefits: activeBenefits.length,
      assignedAcrossTiers: activeBenefits.reduce((sum, benefit) => sum + benefit.assignedTiers.length, 0),
      benefitLabels: activeBenefits.map((benefit) => BENEFIT_DISPLAY_LABELS[benefit.name] ?? benefit.name),
    },
  }
}
