export interface DriverRewardsListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}

export interface DriverRewardsListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface RewardsConfigOverview {
  totalRewardRules: number
  totalBonusPrograms: number
  totalPenaltyRules: number
  highestRewardAction: string
  highestPenaltyRule: string
  activeConfigurations: number
}
