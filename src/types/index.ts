/** 服装品类 */
export type ClothingCategory = 'top' | 'bottom' | 'outerwear' | 'dress'

/** 季节 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/** 衣橱单品 */
export interface ClothingItem {
  id: string
  name: string
  imageUrl: string
  price: number
  wearCount: number
  category: ClothingCategory
  seasons: Season[]
  tempMin: number | null
  tempMax: number | null
  valueMeta: Record<string, unknown>
  createdAt: string
}

/** 试衣间画布上的单品变换 */
export interface FittingItemTransform {
  clothingId: string
  x: number
  y: number
  scale: number
  zIndex: number
}

/** 保存的穿搭 Look */
export interface Look {
  id: string
  name: string
  imageUrl: string
  totalPrice: number
  items: FittingItemTransform[]
  createdAt: string
}

export const ALL_CATEGORIES: ClothingCategory[] = ['top', 'bottom', 'outerwear', 'dress']

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  top: '上装',
  bottom: '下装',
  outerwear: '外套',
  dress: '连衣裙',
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春',
  summer: '夏',
  autumn: '秋',
  winter: '冬',
}

/** 试衣间默认摆放位置 */
export const CATEGORY_DEFAULTS: Record<
  ClothingCategory,
  { x: number; y: number; scale: number; zIndex: number }
> = {
  top: { x: 90, y: 40, scale: 1, zIndex: 2 },
  bottom: { x: 95, y: 230, scale: 1, zIndex: 1 },
  outerwear: { x: 85, y: 25, scale: 1.05, zIndex: 3 },
  dress: { x: 88, y: 35, scale: 1.1, zIndex: 2 },
}
