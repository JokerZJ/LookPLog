import { useCallback, useRef, useState } from 'react'
import { ClothingPickerModal } from '../components/outfits/ClothingPickerModal'
import { FittingModal } from '../components/outfits/FittingModal'
import type { ClothingItem } from '../types'

interface UseOutfitEditorOptions {
  items: ClothingItem[]
  onSaved?: () => void
}

export function useOutfitEditor({ items, onSaved }: UseOutfitEditorOptions) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [fittingOpen, setFittingOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pickerInitialIds, setPickerInitialIds] = useState<string[]>([])
  const [pickerMode, setPickerMode] = useState<'start' | 'add'>('start')
  const [idsToAppend, setIdsToAppend] = useState<string[]>([])
  const canvasIdsRef = useRef<string[]>([])

  const openFitting = useCallback((ids: string[]) => {
    setSelectedIds(ids)
    canvasIdsRef.current = ids
    setFittingOpen(true)
  }, [])

  const startWithItem = useCallback(
    (id: string) => {
      openFitting([id])
    },
    [openFitting],
  )

  const openPicker = useCallback(() => {
    setPickerMode('start')
    setPickerInitialIds([])
    setPickerOpen(true)
  }, [])

  const handleAddMore = useCallback(() => {
    setPickerMode('add')
    setPickerInitialIds(canvasIdsRef.current)
    setPickerOpen(true)
  }, [])

  const handlePickerConfirm = useCallback(
    (ids: string[]) => {
      if (pickerMode === 'start') {
        openFitting(ids)
      } else {
        const existing = new Set(canvasIdsRef.current)
        const newIds = ids.filter((id) => !existing.has(id))
        if (newIds.length > 0) {
          setIdsToAppend(newIds)
        }
        canvasIdsRef.current = [...new Set([...canvasIdsRef.current, ...ids])]
      }
      setPickerOpen(false)
    },
    [pickerMode, openFitting],
  )

  const handleCanvasChange = useCallback((ids: string[]) => {
    canvasIdsRef.current = ids
  }, [])

  const handleFittingClose = useCallback(() => {
    setFittingOpen(false)
    setSelectedIds([])
    canvasIdsRef.current = []
  }, [])

  const modals = (
    <>
      <FittingModal
        open={fittingOpen}
        onClose={handleFittingClose}
        selectedIds={selectedIds}
        items={items}
        idsToAppend={idsToAppend}
        onAppended={() => setIdsToAppend([])}
        onCanvasChange={handleCanvasChange}
        onAddMore={handleAddMore}
        onSaved={onSaved ?? (() => {})}
      />
      <ClothingPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        items={items}
        initialSelectedIds={pickerInitialIds}
        confirmLabel={pickerMode === 'add' ? '确认添加' : '开始搭配'}
        zClass={fittingOpen ? 'z-[120]' : 'z-[100]'}
        onConfirm={handlePickerConfirm}
      />
    </>
  )

  return { modals, startWithItem, openPicker }
}
