import { useMemo } from 'react'
import { Plus } from 'lucide-react'
import { LookCard } from '../components/looks/LookCard'
import { useClothing } from '../contexts/ClothingContext'
import { useLooks } from '../contexts/LooksContext'
import { useOutfitEditor } from '../hooks/useOutfitEditor'
import { formatPrice } from '../utils/calc'

export function OutfitsPage() {
  const { items, loading: clothesLoading } = useClothing()
  const { looks, loading: looksLoading, error } = useLooks()
  const { modals, openPicker } = useOutfitEditor({ items })

  const totalLooksPrice = useMemo(
    () => looks.reduce((sum, look) => sum + look.totalPrice, 0),
    [looks],
  )

  const loading = clothesLoading || looksLoading

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-400">加载中…</div>
  }

  return (
    <div className="relative px-4 pt-4 pb-24">
      <header className="mb-4">
        <p className="text-xs tracking-widest text-neutral-400">OUTFITS</p>
        <h1 className="text-xl font-semibold text-neutral-900">我的穿搭</h1>
        <p className="mt-1 text-xs text-neutral-500">
          共 {looks.length} 套 · 累计 {formatPrice(totalLooksPrice)}
        </p>
      </header>

      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        {looks.map((look) => (
          <LookCard key={look.id} look={look} />
        ))}
      </div>

      {looks.length === 0 && (
        <div className="py-16 text-center text-sm text-neutral-400">
          还没有穿搭案例，点击右下角开始搭配
        </div>
      )}

      <button
        type="button"
        onClick={openPicker}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-800"
        aria-label="新建搭配"
      >
        <Plus size={24} />
      </button>

      {modals}
    </div>
  )
}
