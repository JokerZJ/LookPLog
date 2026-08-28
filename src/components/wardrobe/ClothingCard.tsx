import type { ClothingItem } from '../../types'
import { CATEGORY_LABELS, SEASON_LABELS } from '../../types'
import type { SavingsValueConfig } from '../../types/savings'
import { formatCostPerWear, formatPrice } from '../../utils/calc'
import { calcItemSavings, formatSavings, getValueTier } from '../../utils/savings'
import { ValueTierBadge } from './ValueTierBadge'
import { Plus } from 'lucide-react'

export type ClothingViewMode = 'grid-full' | 'grid-compact' | 'list-full' | 'list-compact'

export const VIEW_MODE_LABELS: Record<ClothingViewMode, string> = {
  'grid-full': '宫格完整',
  'grid-compact': '宫格简约',
  'list-full': '列表详细',
  'list-compact': '列表简约',
}

interface ClothingCardProps {
  item: ClothingItem
  variant?: ClothingViewMode
  savingsConfig: SavingsValueConfig
  onWearOnce?: (id: string) => void
  wearing?: boolean
  onEdit?: () => void
  onImageClick?: () => void
}

function ValueInfo({
  item,
  savingsConfig,
  compact,
}: {
  item: ClothingItem
  savingsConfig: SavingsValueConfig
  compact?: boolean
}) {
  const savings = calcItemSavings(item.price, item.wearCount, savingsConfig)
  if (savings <= 0) return null

  if (compact) {
    return <span className="text-[8px] text-emerald-600">省{formatSavings(savings)}</span>
  }

  return (
    <span className="inline-block rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">
      已省 {formatSavings(savings)}
    </span>
  )
}

function WearButton({
  onClick,
  wearing,
  compact,
}: {
  onClick: (e: React.MouseEvent) => void
  wearing?: boolean
  compact?: boolean
}) {
  if (compact) {
    return (
      <button
        type="button"
        disabled={wearing}
        onClick={onClick}
        aria-label={wearing ? '更新中' : '穿一次'}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
      >
        <Plus size={12} />
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={wearing}
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 py-2 text-xs text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-100 disabled:opacity-50"
    >
      <Plus size={14} />
      {wearing ? '更新中…' : '穿一次'}
    </button>
  )
}

function ImageArea({
  item,
  savingsConfig,
  onImageClick,
  className,
  badgeClassName,
  tierClassName,
  imgClassName,
}: {
  item: ClothingItem
  savingsConfig: SavingsValueConfig
  onImageClick?: () => void
  className?: string
  badgeClassName?: string
  tierClassName?: string
  imgClassName?: string
}) {
  const tier = getValueTier(item.price, item.wearCount, savingsConfig)

  return (
    <div
      className={['relative overflow-hidden bg-neutral-100', className].join(' ')}
      onClick={(e) => {
        e.stopPropagation()
        onImageClick?.()
      }}
      role={onImageClick ? 'button' : undefined}
      tabIndex={onImageClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onImageClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          e.stopPropagation()
          onImageClick()
        }
      }}
    >
      <img
        src={item.imageUrl}
        alt={item.name}
        className={['h-full w-full object-cover', imgClassName].join(' ')}
        loading="lazy"
      />
      <span
        className={[
          'absolute left-2 top-2 rounded bg-white/90 text-neutral-700 shadow-sm',
          badgeClassName,
        ].join(' ')}
      >
        {CATEGORY_LABELS[item.category]}
      </span>
      {tier && (
        <span className={['absolute right-2 top-2', tierClassName].join(' ')}>
          <ValueTierBadge tier={tier} size={tierClassName?.includes('7px') ? 'xs' : 'sm'} />
        </span>
      )}
    </div>
  )
}

function CardShell({
  children,
  onEdit,
  className,
}: {
  children: React.ReactNode
  onEdit?: () => void
  className?: string
}) {
  return (
    <article
      onClick={onEdit}
      onKeyDown={(e) => {
        if (onEdit && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onEdit()
        }
      }}
      role={onEdit ? 'button' : undefined}
      tabIndex={onEdit ? 0 : undefined}
      className={[
        'overflow-hidden transition',
        onEdit ? 'cursor-pointer hover:border-neutral-300 active:scale-[0.99]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </article>
  )
}

function GridFullCard({ item, savingsConfig, onWearOnce, wearing, onEdit, onImageClick }: ClothingCardProps) {
  return (
    <CardShell onEdit={onEdit} className="rounded-xl border border-neutral-200 bg-white shadow-sm">
      <ImageArea
        item={item}
        savingsConfig={savingsConfig}
        onImageClick={onImageClick}
        className="aspect-[4/5]"
        badgeClassName="px-2 py-0.5 text-[10px]"
        tierClassName="px-1.5 py-0.5 text-[10px]"
      />
      <div className="space-y-2 p-3">
        <h3 className="truncate text-sm font-medium text-neutral-900">{item.name}</h3>
        <ValueInfo item={item} savingsConfig={savingsConfig} />
        <div className="flex flex-wrap gap-1">
          {item.seasons.map((s) => (
            <span key={s} className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">
              {SEASON_LABELS[s]}
            </span>
          ))}
          {item.tempMin != null && item.tempMax != null && (
            <span className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">
              {item.tempMin}~{item.tempMax}°C
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-y-1 text-xs text-neutral-500">
          <span>总价</span>
          <span className="text-right text-neutral-800">{formatPrice(item.price)}</span>
          <span>已穿</span>
          <span className="text-right text-neutral-800">{item.wearCount} 次</span>
          <span>均价</span>
          <span className="text-right font-medium text-neutral-900">
            {formatCostPerWear(item.price, item.wearCount)}
          </span>
        </div>
        {onWearOnce && (
          <WearButton
            onClick={(e) => {
              e.stopPropagation()
              onWearOnce(item.id)
            }}
            wearing={wearing}
          />
        )}
      </div>
    </CardShell>
  )
}

function GridCompactCard({ item, savingsConfig, onWearOnce, wearing, onEdit, onImageClick }: ClothingCardProps) {
  return (
    <CardShell onEdit={onEdit} className="rounded border border-neutral-200 bg-white">
      <ImageArea
        item={item}
        savingsConfig={savingsConfig}
        onImageClick={onImageClick}
        className="h-[72px]"
        badgeClassName="left-0.5 top-0.5 rounded-sm px-0.5 text-[7px] leading-none"
        tierClassName="right-0.5 top-0.5 rounded-sm px-0.5 text-[7px] leading-none"
      />
      <div className="space-y-0.5 p-1">
        <h3 className="truncate text-[9px] leading-tight font-medium text-neutral-900">{item.name}</h3>
        <ValueInfo item={item} savingsConfig={savingsConfig} compact />
        <div className="flex items-center justify-between gap-0.5 text-[8px] leading-tight text-neutral-600">
          <span className="truncate">{formatPrice(item.price)}</span>
          <span>{item.wearCount}次</span>
          <span className="shrink-0 font-medium text-neutral-900">
            {formatCostPerWear(item.price, item.wearCount)}
          </span>
        </div>
        {onWearOnce && (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <WearButton
              compact
              onClick={(e) => {
                e.stopPropagation()
                onWearOnce(item.id)
              }}
              wearing={wearing}
            />
          </div>
        )}
      </div>
    </CardShell>
  )
}

function ListFullCard({ item, savingsConfig, onWearOnce, wearing, onEdit, onImageClick }: ClothingCardProps) {
  return (
    <CardShell
      onEdit={onEdit}
      className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm"
    >
      <ImageArea
        item={item}
        savingsConfig={savingsConfig}
        onImageClick={onImageClick}
        className="h-28 w-24 shrink-0 rounded-lg"
        badgeClassName="left-1 top-1 px-1.5 py-0.5 text-[9px]"
        tierClassName="right-1 top-1 px-1 py-0.5 text-[9px]"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="truncate text-sm font-medium text-neutral-900">{item.name}</h3>
        <div className="mt-1">
          <ValueInfo item={item} savingsConfig={savingsConfig} />
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.seasons.map((s) => (
            <span key={s} className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">
              {SEASON_LABELS[s]}
            </span>
          ))}
          {item.tempMin != null && item.tempMax != null && (
            <span className="rounded border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">
              {item.tempMin}~{item.tempMax}°C
            </span>
          )}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-x-3 gap-y-0.5 pt-2 text-xs text-neutral-500">
          <span>总价</span>
          <span className="text-right text-neutral-800">{formatPrice(item.price)}</span>
          <span>已穿</span>
          <span className="text-right text-neutral-800">{item.wearCount} 次</span>
          <span>均价</span>
          <span className="text-right font-medium text-neutral-900">
            {formatCostPerWear(item.price, item.wearCount)}
          </span>
        </div>
        {onWearOnce && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
            <WearButton
              onClick={(e) => {
                e.stopPropagation()
                onWearOnce(item.id)
              }}
              wearing={wearing}
            />
          </div>
        )}
      </div>
    </CardShell>
  )
}

function ListCompactCard({ item, savingsConfig, onWearOnce, wearing, onEdit, onImageClick }: ClothingCardProps) {
  return (
    <CardShell
      onEdit={onEdit}
      className="flex items-center gap-2.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-2"
    >
      <ImageArea
        item={item}
        savingsConfig={savingsConfig}
        onImageClick={onImageClick}
        className="h-14 w-12 shrink-0 rounded-md"
        badgeClassName="hidden"
        tierClassName="right-0.5 top-0.5 px-0.5 text-[7px] leading-none"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-xs font-medium text-neutral-900">{item.name}</h3>
        <div className="mt-0.5">
          <ValueInfo item={item} savingsConfig={savingsConfig} compact />
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-neutral-600">
          <span>{formatPrice(item.price)}</span>
          <span className="font-medium text-neutral-900">
            {formatCostPerWear(item.price, item.wearCount)}
          </span>
        </div>
      </div>
      {onWearOnce && (
        <div onClick={(e) => e.stopPropagation()}>
          <WearButton
            compact
            onClick={(e) => {
              e.stopPropagation()
              onWearOnce(item.id)
            }}
            wearing={wearing}
          />
        </div>
      )}
    </CardShell>
  )
}

export function ClothingCard({
  item,
  variant = 'grid-full',
  savingsConfig,
  onWearOnce,
  wearing,
  onEdit,
  onImageClick,
}: ClothingCardProps) {
  const props = { item, savingsConfig, onWearOnce, wearing, onEdit, onImageClick }

  switch (variant) {
    case 'grid-compact':
      return <GridCompactCard {...props} />
    case 'list-full':
      return <ListFullCard {...props} />
    case 'list-compact':
      return <ListCompactCard {...props} />
    default:
      return <GridFullCard {...props} />
  }
}
