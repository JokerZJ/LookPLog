import { ChevronDown, ChevronUp } from 'lucide-react'
import { ClothingCard, type ClothingViewMode } from './ClothingCard'
import { SwipeableRow } from './SwipeableRow'
import type { ClothingCategory, ClothingItem } from '../../types'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../types'
import type { SavingsValueConfig } from '../../types/savings'
import { getViewContainerClass } from './ViewModeSwitcher'

interface CategoryGroupListProps {
  items: ClothingItem[]
  viewMode: ClothingViewMode
  savingsConfig: SavingsValueConfig
  collapsed: Record<ClothingCategory, boolean>
  onToggleGroup: (category: ClothingCategory) => void
  onWearOnce: (id: string) => void
  wearingId: string | null
  onEdit: (id: string) => void
  onPreview: (item: ClothingItem) => void
  onDelete: (id: string) => void
}

export function CategoryGroupList({
  items,
  viewMode,
  savingsConfig,
  collapsed,
  onToggleGroup,
  onWearOnce,
  wearingId,
  onEdit,
  onPreview,
  onDelete,
}: CategoryGroupListProps) {
  const grouped = ALL_CATEGORIES.map((category) => ({
    category,
    items: items.filter((i) => i.category === category),
  })).filter((g) => g.items.length > 0)

  if (grouped.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {grouped.map(({ category, items: groupItems }) => {
        const isCollapsed = collapsed[category]
        return (
          <section key={category}>
            <button
              type="button"
              onClick={() => onToggleGroup(category)}
              className="mb-2 flex w-full items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-left"
            >
              <span className="text-sm font-medium text-neutral-900">
                {CATEGORY_LABELS[category]}
                <span className="ml-2 text-xs font-normal text-neutral-400">
                  {groupItems.length} 件
                </span>
              </span>
              {isCollapsed ? (
                <ChevronDown size={16} className="text-neutral-400" />
              ) : (
                <ChevronUp size={16} className="text-neutral-400" />
              )}
            </button>
            {!isCollapsed && (
              <div className={getViewContainerClass(viewMode)}>
                {groupItems.map((item) => (
                  <SwipeableRow key={item.id} onDelete={() => onDelete(item.id)}>
                    <ClothingCard
                      item={item}
                      variant={viewMode}
                      savingsConfig={savingsConfig}
                      onWearOnce={onWearOnce}
                      wearing={wearingId === item.id}
                      onEdit={() => onEdit(item.id)}
                      onImageClick={() => onPreview(item)}
                    />
                  </SwipeableRow>
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

export function createDefaultCollapsed(): Record<ClothingCategory, boolean> {
  return {
    top: false,
    bottom: false,
    outerwear: false,
    dress: false,
  }
}
