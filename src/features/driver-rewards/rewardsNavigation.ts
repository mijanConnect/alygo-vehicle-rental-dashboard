export const REWARDS_TAB_KEYS = ['reward-rules', 'bonus-programs', 'penalty-rules'] as const

export type RewardsTabKey = (typeof REWARDS_TAB_KEYS)[number]

export const REWARDS_TAB_LABELS: Record<RewardsTabKey, string> = {
  'reward-rules': 'Reward Rules',
  'bonus-programs': 'Bonus Programs',
  'penalty-rules': 'Penalty Rules',
}

export const DEFAULT_REWARDS_TAB: RewardsTabKey = 'reward-rules'

export function rewardsTabPath(tab: RewardsTabKey) {
  return `/driver-rewards?tab=${tab}`
}

const LEGACY_TAB_MAP: Record<string, RewardsTabKey> = {
  overview: 'reward-rules',
  'points-rules': 'reward-rules',
  'performance-rewards': 'reward-rules',
  'performance-rules': 'reward-rules',
  'bonus-campaigns': 'bonus-programs',
  'penalty-rules': 'penalty-rules',
}

export function resolveRewardsTab(tab: string | null): RewardsTabKey {
  if (!tab) return DEFAULT_REWARDS_TAB
  if (REWARDS_TAB_KEYS.includes(tab as RewardsTabKey)) return tab as RewardsTabKey
  return LEGACY_TAB_MAP[tab] ?? DEFAULT_REWARDS_TAB
}

/** Legacy tier tabs consolidated into /drivers/tiers */
export const LEGACY_TIER_REWARDS_TABS = ['tier-management', 'tier-benefits', 'qualification-rules'] as const

export function isLegacyTierRewardsTab(tab: string | null) {
  return LEGACY_TIER_REWARDS_TABS.includes(tab as (typeof LEGACY_TIER_REWARDS_TABS)[number])
}
