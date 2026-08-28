import type { ClothingCategory, ClothingItem, Season } from '../types'

function currentSeason(month: number): Season {
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

function scoreByTemp(item: ClothingItem, temp: number): number {
  if (item.tempMin != null && item.tempMax != null) {
    if (temp < item.tempMin || temp > item.tempMax) return -1
    const mid = (item.tempMin + item.tempMax) / 2
    return 100 - Math.abs(temp - mid)
  }
  return 30
}

function scoreBySeason(item: ClothingItem, season: Season): number {
  return item.seasons.includes(season) ? 20 : 0
}

function scoreItem(item: ClothingItem, temp: number, season: Season): number {
  const tempScore = scoreByTemp(item, temp)
  if (tempScore < 0 && item.tempMin != null && item.tempMax != null) return -1
  return tempScore + scoreBySeason(item, season)
}

function pickBest(items: ClothingItem[], temp: number, season: Season): ClothingItem | null {
  let best: ClothingItem | null = null
  let bestScore = -1
  for (const item of items) {
    const score = scoreItem(item, temp, season)
    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }
  return best
}

/** 根据气温从衣橱中推荐今日穿搭 */
export function recommendOutfit(items: ClothingItem[], temp: number, date = new Date()) {
  const season = currentSeason(date.getMonth() + 1)
  const byCategory = (cat: ClothingCategory) => items.filter((i) => i.category === cat)

  const dress = pickBest(byCategory('dress'), temp, season)
  const top = pickBest(byCategory('top'), temp, season)
  const bottom = pickBest(byCategory('bottom'), temp, season)
  const outerwear = temp <= 18 ? pickBest(byCategory('outerwear'), temp, season) : null

  if (dress && scoreItem(dress, temp, season) >= 40) {
    const result = [dress]
    if (outerwear) result.unshift(outerwear)
    return result
  }

  const result: ClothingItem[] = []
  if (outerwear) result.push(outerwear)
  if (top) result.push(top)
  if (bottom) result.push(bottom)
  return result
}
