import { calcCostPerWear } from './calc'
import type { ClothingValueMeta, SavingsValueConfig, ValueTierKey } from '../types/savings'
import { DEFAULT_SAVINGS_CONFIG } from '../types/savings'

export function getGreatGainThreshold(
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): number {
  return config.tiers.find((t) => t.key === 'great_gain')?.maxCostPerWear ?? 1
}

/** 达到血赚所需的最低穿着次数 */
export function getMinWearForGreatGain(
  price: number,
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): number {
  const threshold = getGreatGainThreshold(config)
  if (price <= 0 || threshold <= 0) return Infinity
  return Math.floor(price / threshold) + 1
}

/** 按均价判定当前性价比档位（取最高档） */
export function getValueTier(
  price: number,
  wearCount: number,
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): ValueTierKey | null {
  if (wearCount <= 0) return null
  const cost = calcCostPerWear(price, wearCount)
  const great = config.tiers.find((t) => t.key === 'great_gain')
  const net = config.tiers.find((t) => t.key === 'net_gain')
  const breakEven = config.tiers.find((t) => t.key === 'break_even')

  if (great && cost < great.maxCostPerWear) return 'great_gain'
  if (net && cost < net.maxCostPerWear) return 'net_gain'
  if (breakEven && cost <= breakEven.maxCostPerWear) return 'break_even'
  return null
}

/**
 * 单品累计省钱：仅血赚之后，每多穿一次累计 extraWearSavings（默认 20）
 */
export function calcItemSavings(
  price: number,
  wearCount: number,
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): number {
  if (wearCount <= 0) return 0
  const minWear = getMinWearForGreatGain(price, config)
  const extraWears = Math.max(0, wearCount - minWear)
  return extraWears * config.extraWearSavings
}

/** 血赚后额外穿着次数 */
export function calcExtraWearsAfterGreatGain(
  price: number,
  wearCount: number,
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): number {
  if (wearCount <= 0) return 0
  const minWear = getMinWearForGreatGain(price, config)
  return Math.max(0, wearCount - minWear)
}

export function buildClothingValueMeta(
  price: number,
  wearCount: number,
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): ClothingValueMeta {
  const costPerWear = wearCount <= 0 ? price : calcCostPerWear(price, wearCount)
  return {
    savings: calcItemSavings(price, wearCount, config),
    tier: getValueTier(price, wearCount, config),
    greatGainThreshold: getGreatGainThreshold(config),
    extraWearSavings: config.extraWearSavings,
    costPerWear,
    computedAt: new Date().toISOString(),
  }
}

export function buildSavingsConfigFromInputs(
  greatGainThreshold: number,
  extraWearSavings: number,
  base: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): SavingsValueConfig {
  const tiers = base.tiers.map((t) =>
    t.key === 'great_gain' ? { ...t, maxCostPerWear: greatGainThreshold } : t,
  )
  return {
    ...base,
    extraWearSavings,
    tiers,
  }
}

export function calcTotalSavings(
  items: Array<{ price: number; wearCount: number }>,
  config: SavingsValueConfig = DEFAULT_SAVINGS_CONFIG,
): number {
  return items.reduce((sum, item) => sum + calcItemSavings(item.price, item.wearCount, config), 0)
}

export function formatSavings(value: number): string {
  if (value <= 0) return '¥0'
  return `¥${value.toFixed(0)}`
}
