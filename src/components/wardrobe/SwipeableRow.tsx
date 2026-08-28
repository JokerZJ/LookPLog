import { useCallback, useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { Trash2 } from 'lucide-react'

const DELETE_WIDTH = 72
const OPEN_THRESHOLD = 36

interface SwipeableRowProps {
  children: ReactNode
  onDelete: () => void
  disabled?: boolean
}

export function SwipeableRow({ children, onDelete, disabled }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const dragging = useRef(false)

  const clamp = (value: number) => Math.max(-DELETE_WIDTH, Math.min(0, value))

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled) return
    startX.current = e.touches[0].clientX
    startOffset.current = offset
    dragging.current = true
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging.current || disabled) return
    const dx = e.touches[0].clientX - startX.current
    setOffset(clamp(startOffset.current + dx))
  }

  const handleTouchEnd = () => {
    if (!dragging.current) return
    dragging.current = false
    setOffset((prev) => (prev <= -OPEN_THRESHOLD ? -DELETE_WIDTH : 0))
  }

  const close = useCallback(() => setOffset(0), [])

  const handleDelete = () => {
    if (window.confirm('确定删除该单品？删除后已保存的穿搭案例不受影响。')) {
      onDelete()
      close()
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div
        className="absolute inset-y-0 right-0 flex w-[72px] items-center justify-center bg-red-500"
        aria-hidden={offset === 0}
      >
        <button
          type="button"
          onClick={handleDelete}
          className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-white"
          aria-label="删除"
        >
          <Trash2 size={18} />
          <span className="text-[10px]">删除</span>
        </button>
      </div>
      <div
        className="relative bg-white transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
