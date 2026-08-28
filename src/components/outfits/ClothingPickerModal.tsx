import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import type { ClothingCategory, ClothingItem } from '../../types'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../../types'

interface ClothingPickerModalProps {
  open: boolean
  onClose: () => void
  items: ClothingItem[]
  initialSelectedIds?: string[]
  confirmLabel?: string
  zClass?: string
  onConfirm: (selectedIds: string[]) => void
}

export function ClothingPickerModal({
  open,
  onClose,
  items,
  initialSelectedIds = [],
  confirmLabel = '开始搭配',
  zClass,
  onConfirm,
}: ClothingPickerModalProps) {
  const [category, setCategory] = useState<ClothingCategory>('top')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    const initial = new Set(initialSelectedIds)
    setSelected(initial)
    if (initialSelectedIds.length > 0) {
      const first = items.find((i) => i.id === initialSelectedIds[0])
      if (first) setCategory(first.category)
    } else {
      setCategory('top')
    }
  }, [open, initialSelectedIds, items])

  const list = items.filter((i) => i.category === category)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleConfirm = () => {
    if (selected.size === 0) return
    onConfirm([...selected])
    setSelected(new Set())
    onClose()
  }

  const handleClose = () => {
    setSelected(new Set())
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="选择单品" zClass={zClass}>
      <div className="flex flex-col p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={[
                'rounded-full px-3 py-1.5 text-xs transition',
                category === c
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 text-neutral-500',
              ].join(' ')}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400">该品类暂无单品</p>
        ) : (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {list.map((item) => {
              const isSelected = selected.has(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  className={[
                    'relative aspect-[3/4] overflow-hidden rounded-lg border',
                    isSelected ? 'border-neutral-900 ring-2 ring-neutral-900' : 'border-neutral-200',
                  ].join(' ')}
                >
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  {isSelected && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">
                      <Check size={12} />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1 py-0.5 text-[10px] text-white">
                    {item.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <div className="sticky bottom-0 border-t border-neutral-200 bg-white pt-3">
          <p className="mb-2 text-center text-xs text-neutral-500">已选 {selected.size} 件</p>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={handleConfirm}
            className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white disabled:opacity-40"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
