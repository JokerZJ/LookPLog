import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Save,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { FittingCanvas } from '../fitting/FittingCanvas'
import { Modal } from '../ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { useLooks } from '../../contexts/LooksContext'
import { uploadOutfitImage } from '../../services/clothing'
import type { ClothingItem, FittingItemTransform } from '../../types'
import { CATEGORY_DEFAULTS } from '../../types'
import { captureElement } from '../../utils/captureCanvas'

interface FittingModalProps {
  open: boolean
  onClose: () => void
  selectedIds: string[]
  items: ClothingItem[]
  idsToAppend?: string[]
  onAppended?: () => void
  onCanvasChange?: (ids: string[]) => void
  onAddMore?: () => void
  onSaved: () => void
}

function buildTransform(
  id: string,
  item: ClothingItem,
  index: number,
): FittingItemTransform {
  const defaults = CATEGORY_DEFAULTS[item.category]
  return {
    clothingId: id,
    x: defaults.x + index * 4,
    y: defaults.y,
    scale: defaults.scale,
    zIndex: defaults.zIndex + index,
  }
}

export function FittingModal({
  open,
  onClose,
  selectedIds,
  items,
  idsToAppend = [],
  onAppended,
  onCanvasChange,
  onAddMore,
  onSaved,
}: FittingModalProps) {
  const { user } = useAuth()
  const { addLook } = useLooks()
  const canvasRef = useRef<HTMLDivElement>(null)

  const [canvasItems, setCanvasItems] = useState<FittingItemTransform[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lookName, setLookName] = useState('')
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [tip, setTip] = useState('')
  const [saving, setSaving] = useState(false)

  const clothesMap = useMemo(() => new Map(items.map((c) => [c.id, c])), [items])
  const selected = canvasItems.find((t) => t.clothingId === selectedId)

  const layerSorted = useMemo(
    () => [...canvasItems].sort((a, b) => a.zIndex - b.zIndex),
    [canvasItems],
  )
  const selectedLayerIndex = selectedId
    ? layerSorted.findIndex((t) => t.clothingId === selectedId)
    : -1
  const canBringForward =
    selectedLayerIndex >= 0 && selectedLayerIndex < layerSorted.length - 1
  const canSendBackward = selectedLayerIndex > 0

  useEffect(() => {
    if (!open || selectedIds.length === 0) return
    const transforms: FittingItemTransform[] = selectedIds
      .map((id, index) => {
        const item = clothesMap.get(id)
        if (!item) return null
        return buildTransform(id, item, index)
      })
      .filter((t): t is FittingItemTransform => Boolean(t))
    setCanvasItems(transforms)
    setSelectedId(transforms[0]?.clothingId ?? null)
    setLookName('')
    setNameDialogOpen(false)
    setTip('')
  }, [open, selectedIds, clothesMap])

  useEffect(() => {
    if (!open || idsToAppend.length === 0) return
    setCanvasItems((prev) => {
      const existing = new Set(prev.map((t) => t.clothingId))
      const maxZ = prev.reduce((m, t) => Math.max(m, t.zIndex), 0)
      const additions = idsToAppend
        .filter((id) => !existing.has(id))
        .map((id, i) => {
          const item = clothesMap.get(id)
          if (!item) return null
          const t = buildTransform(id, item, prev.length + i)
          return { ...t, zIndex: maxZ + 1 + i }
        })
        .filter((t): t is FittingItemTransform => Boolean(t))
      return [...prev, ...additions]
    })
    onAppended?.()
  }, [open, idsToAppend, clothesMap, onAppended])

  useEffect(() => {
    if (!open) return
    onCanvasChange?.(canvasItems.map((t) => t.clothingId))
  }, [canvasItems, open, onCanvasChange])

  const handleClose = () => {
    setCanvasItems([])
    setSelectedId(null)
    setLookName('')
    setNameDialogOpen(false)
    setTip('')
    onClose()
  }

  const updateItem = (id: string, patch: Partial<FittingItemTransform>) => {
    setCanvasItems((prev) =>
      prev.map((t) => (t.clothingId === id ? { ...t, ...patch } : t)),
    )
  }

  const swapLayers = (aId: string, bId: string) => {
    setCanvasItems((prev) => {
      const a = prev.find((t) => t.clothingId === aId)
      const b = prev.find((t) => t.clothingId === bId)
      if (!a || !b) return prev
      return prev.map((t) => {
        if (t.clothingId === aId) return { ...t, zIndex: b.zIndex }
        if (t.clothingId === bId) return { ...t, zIndex: a.zIndex }
        return t
      })
    })
  }

  const bringForward = () => {
    if (!selectedId || !canBringForward) return
    const above = layerSorted[selectedLayerIndex + 1]
    if (above) swapLayers(selectedId, above.clothingId)
  }

  const sendBackward = () => {
    if (!selectedId || !canSendBackward) return
    const below = layerSorted[selectedLayerIndex - 1]
    if (below) swapLayers(selectedId, below.clothingId)
  }

  const removeSelected = () => {
    if (!selectedId) return
    setCanvasItems((prev) => prev.filter((t) => t.clothingId !== selectedId))
    setSelectedId(null)
  }

  const totalPrice = canvasItems.reduce((sum, t) => {
    const item = clothesMap.get(t.clothingId)
    return sum + (item?.price ?? 0)
  }, 0)

  const openNameDialog = () => {
    if (canvasItems.length === 0) {
      setTip('请至少保留一件单品')
      return
    }
    setTip('')
    setNameDialogOpen(true)
  }

  const handleSave = async () => {
    if (!lookName.trim()) {
      setTip('请输入穿搭名称')
      return
    }
    if (canvasItems.length === 0) {
      setTip('请至少保留一件单品')
      return
    }
    if (!canvasRef.current || !user) {
      setTip('无法保存，请重试')
      return
    }

    setSaving(true)
    setTip('')
    try {
      const blob = await captureElement(canvasRef.current)
      const imageUrl = await uploadOutfitImage(blob, user.id)
      await addLook({
        name: lookName.trim(),
        imageUrl,
        totalPrice,
        items: canvasItems,
      })
      onSaved()
      handleClose()
    } catch (err) {
      setTip(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="试衣间"
      fullScreen
      zClass="z-[100]"
      headerExtra={
        <button
          type="button"
          disabled={saving}
          onClick={openNameDialog}
          className="flex h-8 items-center gap-1 rounded-full bg-neutral-900 px-3 text-xs font-medium text-white disabled:opacity-60"
        >
          <Save size={13} />
          提交
        </button>
      }
    >
      <div className="relative flex flex-col p-4">
        <FittingCanvas
          canvasRef={canvasRef}
          items={canvasItems}
          clothesMap={clothesMap}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdate={updateItem}
        />

        {onAddMore && (
          <button
            type="button"
            onClick={onAddMore}
            className="mb-3 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-neutral-300 py-2.5 text-sm text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            <Plus size={16} />
            添加单品
          </button>
        )}

        {selected && (
          <div className="mb-3 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-xs text-neutral-700">
                {clothesMap.get(selected.clothingId)?.name}
              </span>
              <button
                type="button"
                onClick={removeSelected}
                className="flex shrink-0 items-center gap-1 text-xs text-neutral-500 hover:text-red-500"
              >
                <Trash2 size={12} />
                移除
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  updateItem(selected.clothingId, {
                    scale: Math.max(0.4, +(selected.scale - 0.1).toFixed(2)),
                  })
                }
                className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600"
                aria-label="缩小"
              >
                <ZoomOut size={16} />
              </button>
              <span className="flex-1 text-center text-xs text-neutral-500">
                缩放 {selected.scale.toFixed(2)}x
              </span>
              <button
                type="button"
                onClick={() =>
                  updateItem(selected.clothingId, {
                    scale: Math.min(2, +(selected.scale + 0.1).toFixed(2)),
                  })
                }
                className="rounded-lg border border-neutral-200 bg-white p-2 text-neutral-600"
                aria-label="放大"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canSendBackward}
                onClick={sendBackward}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white py-2 text-xs text-neutral-700 disabled:opacity-40"
              >
                <ArrowDown size={14} />
                下移一层
              </button>
              <button
                type="button"
                disabled={!canBringForward}
                onClick={bringForward}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white py-2 text-xs text-neutral-700 disabled:opacity-40"
              >
                <ArrowUp size={14} />
                上移一层
              </button>
            </div>
          </div>
        )}

        {tip && !nameDialogOpen && (
          <p className="text-xs text-neutral-500">{tip}</p>
        )}

        {nameDialogOpen && (
          <div className="absolute inset-0 z-20 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div
              className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-1 text-sm font-semibold text-neutral-900">为穿搭命名</h3>
              <p className="mb-3 text-xs text-neutral-500">
                共 {canvasItems.length} 件 · 总价 ¥{totalPrice.toFixed(2)}
              </p>
              <input
                autoFocus
                value={lookName}
                onChange={(e) => setLookName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave()
                }}
                placeholder="例如：周末通勤"
                className="mb-3 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
              />
              {tip && <p className="mb-2 text-xs text-neutral-500">{tip}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNameDialogOpen(false)
                    setTip('')
                  }}
                  className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm text-neutral-600"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Save size={14} />
                  {saving ? '保存中…' : '确认保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
