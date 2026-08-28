import type { Look } from '../../types'
import { formatPrice } from '../../utils/calc'

interface LookCardProps {
  look: Look
}

export function LookCard({ look }: LookCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="relative aspect-[3/4] bg-neutral-100">
        <img
          src={look.imageUrl}
          alt={look.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
          <h3 className="text-sm font-medium text-white">{look.name}</h3>
          <p className="mt-0.5 text-xs text-neutral-200">
            {look.items.length} 件 · 总价 {formatPrice(look.totalPrice)}
          </p>
        </div>
      </div>
    </article>
  )
}
