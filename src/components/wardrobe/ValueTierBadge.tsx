import type { ValueTierKey } from '../../types/savings'
import { VALUE_TIER_LABELS } from '../../types/savings'

const TIER_STYLES: Record<ValueTierKey, string> = {
  break_even: 'border-amber-200 bg-amber-50 text-amber-800',
  net_gain: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  great_gain: 'border-rose-200 bg-rose-50 text-rose-800',
}

interface ValueTierBadgeProps {
  tier: ValueTierKey | null
  size?: 'sm' | 'xs'
}

export function ValueTierBadge({ tier, size = 'sm' }: ValueTierBadgeProps) {
  if (!tier) return null

  const sizeClass =
    size === 'xs' ? 'px-1 py-0 text-[9px] leading-tight' : 'px-1.5 py-0.5 text-[10px]'

  return (
    <span
      className={[
        'shrink-0 rounded border font-medium',
        sizeClass,
        TIER_STYLES[tier],
      ].join(' ')}
    >
      {VALUE_TIER_LABELS[tier]}
    </span>
  )
}
