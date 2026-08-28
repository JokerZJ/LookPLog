/** 单次穿着成本 = 总价 ÷ 穿着次数（次数为 0 时返回总价） */
export function calcCostPerWear(price: number, wearCount: number): number {
  if (wearCount <= 0) return price
  return price / wearCount
}

export function formatPrice(value: number): string {
  return `¥${value.toFixed(2)}`
}

export function formatCostPerWear(price: number, wearCount: number): string {
  const cost = calcCostPerWear(price, wearCount)
  return `${formatPrice(cost)}/次`
}
