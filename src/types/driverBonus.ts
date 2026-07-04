export type BonusCampaignType =
  | 'quest'
  | 'peak_hour'
  | 'airport'
  | 'zone_based'
  | 'event'
  | 'weekend'
  | 'consecutive_trips'
  | 'new_driver'
  | 'retention'

export type BonusCampaignStatus = 'active' | 'scheduled' | 'disabled' | 'completed'

export interface BonusCampaign {
  id: string
  name: string
  type: BonusCampaignType
  amount: number
  startDate: string
  endDate: string
  location: string // City or Zone
  tierEligibility: string[] // e.g. ['Bronze', 'Silver', 'Gold']
  rideCategoryEligibility: string[] // e.g. ['standard', 'comfort']
  budgetLimit: number
  budgetUsed: number
  status: BonusCampaignStatus
}

export interface BonusCampaignFormValues {
  name: string
  type: BonusCampaignType
  amount: number
  startDate: string
  endDate: string
  location: string
  tierEligibility: string[]
  rideCategoryEligibility: string[]
  budgetLimit: number
  status: BonusCampaignStatus
}

export interface BonusCampaignListResponse {
  data: BonusCampaign[]
  total: number
  page: number
  pageSize: number
}

export interface BonusCampaignListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}
