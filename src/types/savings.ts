/** 性价比档位 */
export type ValueTierKey = 'break_even' | 'net_gain' | 'great_gain'

export interface SavingsTier {
  key: ValueTierKey
  label: string
  maxCostPerWear: number
}

/** 省钱价值配置 */
export interface SavingsValueConfig {
  referenceCostPerWear: number
  extraWearSavings: number
  tiers: SavingsTier[]
  display: Record<string, unknown>
}

/** 单品价值快照（存入 value_meta，便于扩展） */
export interface ClothingValueMeta {
  savings: number
  tier: ValueTierKey | null
  greatGainThreshold: number
  extraWearSavings: number
  costPerWear: number
  computedAt: string
  extra?: Record<string, unknown>
}

export const VALUE_TIER_LABELS: Record<ValueTierKey, string> = {
  break_even: '回本',
  net_gain: '净赚',
  great_gain: '血赚',
}

export const ALL_VALUE_TIERS: ValueTierKey[] = ['break_even', 'net_gain', 'great_gain']

export const DEFAULT_SAVINGS_CONFIG: SavingsValueConfig = {
  referenceCostPerWear: 20,
  extraWearSavings: 20,
  tiers: [
    { key: 'break_even', label: '回本', maxCostPerWear: 20 },
    { key: 'net_gain', label: '净赚', maxCostPerWear: 5 },
    { key: 'great_gain', label: '血赚', maxCostPerWear: 1 },
  ],
  display: {},
}
