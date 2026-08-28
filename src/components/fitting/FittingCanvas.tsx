import { useCallback, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ClothingItem, FittingItemTransform } from '../../types'
import { formatPrice } from '../../utils/calc'

interface FittingCanvasProps {
  items: FittingItemTransform[]
  clothesMap: Map<string, ClothingItem>
  selectedId: string | null
  onSelect: (id: string | null) => void
  onUpdate: (id: string, patch: Partial<FittingItemTransform>) => void
  canvasRef?: RefObject<HTMLDivElement | null>
}

export function FittingCanvas({
  items,
  clothesMap,
  selectedId,
  onSelect,
  onUpdate,
  canvasRef,
}: FittingCanvasProps) {
  const innerRef = useRef<HTMLDivElement>(null)
  const ref = canvasRef ?? innerRef
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const pinchRef = useRef<{ id: string; dist: number; scale: number } | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const totalPrice = items.reduce((sum, t) => {
    const item = clothesMap.get(t.clothingId)
    return sum + (item?.price ?? 0)
  }, 0)

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, t: FittingItemTransform) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      onSelect(t.clothingId)
      dragRef.current = {
        id: t.clothingId,
        startX: e.clientX,
        startY: e.clientY,
        origX: t.x,
        origY: t.y,
      }
      setDraggingId(t.clothingId)
    },
    [onSelect],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent, t: FittingItemTransform) => {
      if (!dragRef.current || dragRef.current.id !== t.clothingId) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      onUpdate(t.clothingId, {
        x: Math.max(0, Math.min(260, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(280, dragRef.current.origY + dy)),
      })
    },
    [onUpdate],
  )

  const handlePointerUp = useCallback(() => {
    dragRef.current = null
    setDraggingId(null)
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, t: FittingItemTransform) => {
      if (e.touches.length === 2) {
        const [a, b] = [e.touches[0], e.touches[1]]
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
        pinchRef.current = { id: t.clothingId, dist, scale: t.scale }
        onSelect(t.clothingId)
      }
    },
    [onSelect],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent, t: FittingItemTransform) => {
      if (e.touches.length === 2 && pinchRef.current?.id === t.clothingId) {
        const [a, b] = [e.touches[0], e.touches[1]]
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
        const ratio = dist / pinchRef.current.dist
        const next = Math.max(0.4, Math.min(2, pinchRef.current.scale * ratio))
        onUpdate(t.clothingId, { scale: +next.toFixed(2) })
      }
    },
    [onUpdate],
  )

  const handleTouchEnd = useCallback(() => {
    pinchRef.current = null
  }, [])

  const handleWheel = useCallback(
    (e: React.WheelEvent, t: FittingItemTransform) => {
      if (selectedId !== t.clothingId) return
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      onUpdate(t.clothingId, {
        scale: Math.max(0.4, Math.min(2, +(t.scale + delta).toFixed(2))),
      })
    },
    [selectedId, onUpdate],
  )

  return (
    <div
      ref={ref}
      className="relative mb-3 h-80 touch-none overflow-hidden rounded-2xl border border-neutral-200 bg-[linear-gradient(180deg,#fafafa_0%,#ffffff_100%)]"
      onClick={() => onSelect(null)}
    >
      <div className="absolute left-3 top-3 z-10 rounded bg-white/90 px-2 py-1 text-[10px] text-neutral-600 shadow-sm">
        搭配区 · 总价 {formatPrice(totalPrice)}
      </div>
      <p className="absolute right-3 top-3 z-10 text-[10px] text-neutral-400">
        拖拽 · 缩放 · 选中后调图层
      </p>

      {items.map((t) => {
        const item = clothesMap.get(t.clothingId)
        if (!item) return null
        const isSelected = t.clothingId === selectedId
        const isDragging = t.clothingId === draggingId
        return (
          <div
            key={t.clothingId}
            role="button"
            tabIndex={0}
            onPointerDown={(e) => handlePointerDown(e, t)}
            onPointerMove={(e) => handlePointerMove(e, t)}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={(e) => handleTouchStart(e, t)}
            onTouchMove={(e) => handleTouchMove(e, t)}
            onTouchEnd={handleTouchEnd}
            onWheel={(e) => handleWheel(e, t)}
            onClick={(e) => e.stopPropagation()}
            style={{
              left: t.x,
              top: t.y,
              transform: `scale(${t.scale})`,
              zIndex: t.zIndex,
            }}
            className={[
              'absolute h-36 w-28 origin-top-left select-none overflow-hidden rounded-lg border bg-white shadow-md',
              isSelected ? 'border-neutral-900 ring-2 ring-neutral-900' : 'border-neutral-200',
              isDragging ? 'cursor-grabbing opacity-95' : 'cursor-grab',
            ].join(' ')}
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              crossOrigin="anonymous"
              className="pointer-events-none h-full w-full object-cover"
              draggable={false}
            />
          </div>
        )
      })}

      {items.length === 0 && (
        <div className="flex h-full items-center justify-center text-sm text-neutral-400">
          从下方选择单品开始搭配
        </div>
      )}
    </div>
  )
}
