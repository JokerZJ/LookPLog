import { X } from 'lucide-react'
import type { ClothingItem } from '../../types'
import { CATEGORY_LABELS, SEASON_LABELS } from '../../types'
import type { SavingsValueConfig } from '../../types/savings'
import { formatCostPerWear, formatPrice } from '../../utils/calc'
import { calcItemSavings, formatSavings, getValueTier } from '../../utils/savings'
import { ValueTierBadge } from './ValueTierBadge'

interface ClothingImagePreviewProps {
  item: ClothingItem | null
  savingsConfig: SavingsValueConfig
  onClose: () => void
  onEdit: () => void
  onStartOutfit?: () => void
}

export function ClothingImagePreview({
  item,
  savingsConfig,
  onClose,
  onEdit,
  onStartOutfit,
}: ClothingImagePreviewProps) {
  if (!item) return null

  const tier = getValueTier(item.price, item.wearCount, savingsConfig)
  const savings = calcItemSavings(item.price, item.wearCount, savingsConfig)

  return (
    <div
      className="fixed inset-0 z-[110] flex flex-col bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white">
        <h2 className="truncate text-sm font-medium">{item.name}</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
          aria-label="关闭"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="relative mx-4 flex flex-1 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="max-h-[60dvh] max-w-full object-contain"
        />
        {tier && (
          <span className="absolute right-2 top-2">
            <ValueTierBadge tier={tier} />
          </span>
        )}
      </div>

      <div
        className="shrink-0 space-y-2 rounded-t-2xl bg-white px-4 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center gap-1">
          <span className="rounded border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600">
            {CATEGORY_LABELS[item.category]}
          </span>
          {item.seasons.map((s) => (
            <span
              key={s}
              className="rounded border border-neutral-200 px-2 py-0.5 text-xs text-neutral-600"
            >
              {SEASON_LABELS[s]}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="rounded-lg bg-neutral-50 py-2">
            <p className="text-neutral-400">总价</p>
            <p className="font-medium text-neutral-900">{formatPrice(item.price)}</p>
          </div>
          <div className="rounded-lg bg-neutral-50 py-2">
            <p className="text-neutral-400">已穿</p>
            <p className="font-medium text-neutral-900">{item.wearCount} 次</p>
          </div>
          <div className="rounded-lg bg-neutral-50 py-2">
            <p className="text-neutral-400">均价</p>
            <p className="font-medium text-neutral-900">
              {formatCostPerWear(item.price, item.wearCount)}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 py-2">
            <p className="text-emerald-600">已省</p>
            <p className="font-medium text-emerald-800">{formatSavings(savings)}</p>
          </div>
        </div>
        {item.tempMin != null && item.tempMax != null && (
          <p className="text-center text-xs text-neutral-500">
            推荐穿着温度 {item.tempMin}~{item.tempMax}°C
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {onStartOutfit && (
            <button
              type="button"
              onClick={onStartOutfit}
              className="rounded-xl border border-neutral-200 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              开始穿搭
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className={[
              'rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white',
              onStartOutfit ? '' : 'col-span-2',
            ].join(' ')}
          >
            编辑单品
          </button>
        </div>
      </div>
    </div>
  )
}
