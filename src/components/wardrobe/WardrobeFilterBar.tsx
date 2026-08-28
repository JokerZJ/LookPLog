import type { ClothingCategory, Season } from '../../types'
import { ALL_CATEGORIES, CATEGORY_LABELS, SEASON_LABELS } from '../../types'
import type { ValueTierKey } from '../../types/savings'
import { ALL_VALUE_TIERS, VALUE_TIER_LABELS } from '../../types/savings'
import { getValueTier } from '../../utils/savings'
import type { SavingsValueConfig } from '../../types/savings'

const ALL_SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']

interface WardrobeFilterBarProps {
  categories: ClothingCategory[]
  seasons: Season[]
  valueTiers: ValueTierKey[]
  onToggleCategory: (c: ClothingCategory) => void
  onToggleSeason: (s: Season) => void
  onToggleValueTier: (t: ValueTierKey) => void
}

export function WardrobeFilterBar({
  categories,
  seasons,
  valueTiers,
  onToggleCategory,
  onToggleSeason,
  onToggleValueTier,
}: WardrobeFilterBarProps) {
  return (
    <div className="mb-4 -mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex flex-nowrap items-center gap-x-1.5">
        {ALL_CATEGORIES.map((c) => {
          const active = categories.includes(c)
          return (
            <button
              key={c}
              type="button"
              onClick={() => onToggleCategory(c)}
              className={[
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] transition',
                active
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 text-neutral-500',
              ].join(' ')}
            >
              {CATEGORY_LABELS[c]}
            </button>
          )
        })}
        <span className="mx-0.5 h-3 w-px shrink-0 bg-neutral-200" aria-hidden />
        {ALL_SEASONS.map((s) => {
          const active = seasons.includes(s)
          return (
            <button
              key={s}
              type="button"
              onClick={() => onToggleSeason(s)}
              className={[
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] transition',
                active
                  ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-300'
                  : 'border border-neutral-200 text-neutral-500',
              ].join(' ')}
            >
              {SEASON_LABELS[s]}
            </button>
          )
        })}
        <span className="mx-0.5 h-3 w-px shrink-0 bg-neutral-200" aria-hidden />
        {ALL_VALUE_TIERS.map((t) => {
          const active = valueTiers.includes(t)
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggleValueTier(t)}
              className={[
                'shrink-0 rounded-full px-2.5 py-1 text-[11px] transition',
                active
                  ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-300'
                  : 'border border-neutral-200 text-neutral-500',
              ].join(' ')}
            >
              {VALUE_TIER_LABELS[t]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function matchesWardrobeFilters(
  item: { category: ClothingCategory; seasons: Season[]; name: string; price: number; wearCount: number },
  selectedCategories: ClothingCategory[],
  selectedSeasons: Season[],
  selectedValueTiers: ValueTierKey[],
  keyword: string,
  savingsConfig: SavingsValueConfig,
): boolean {
  if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) {
    return false
  }
  if (
    selectedSeasons.length > 0 &&
    !item.seasons.some((s) => selectedSeasons.includes(s))
  ) {
    return false
  }
  if (selectedValueTiers.length > 0) {
    const tier = getValueTier(item.price, item.wearCount, savingsConfig)
    if (!tier || !selectedValueTiers.includes(tier)) {
      return false
    }
  }
  if (keyword && !item.name.includes(keyword.trim())) {
    return false
  }
  return true
}
