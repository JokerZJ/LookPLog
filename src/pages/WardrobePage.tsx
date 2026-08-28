import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import {
  CategoryGroupList,
  createDefaultCollapsed,
} from '../components/wardrobe/CategoryGroupList'
import { ClothingImagePreview } from '../components/wardrobe/ClothingImagePreview'
import type { ClothingViewMode } from '../components/wardrobe/ClothingCard'
import {
  loadViewMode,
  saveViewMode,
  ViewModeSwitcher,
} from '../components/wardrobe/ViewModeSwitcher'
import {
  matchesWardrobeFilters,
  WardrobeFilterBar,
} from '../components/wardrobe/WardrobeFilterBar'
import { useClothing } from '../contexts/ClothingContext'
import { useOutfitEditor } from '../hooks/useOutfitEditor'
import type { ClothingCategory, ClothingItem, Season } from '../types'
import type { ValueTierKey } from '../types/savings'
import { formatPrice } from '../utils/calc'
import { calcTotalSavings, formatSavings } from '../utils/savings'

export function WardrobePage() {
  const navigate = useNavigate()
  const { items, savingsConfig, loading, error, wearOnce, removeItem } = useClothing()
  const { modals, startWithItem } = useOutfitEditor({ items })
  const [selectedCategories, setSelectedCategories] = useState<ClothingCategory[]>([])
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>([])
  const [selectedValueTiers, setSelectedValueTiers] = useState<ValueTierKey[]>([])
  const [keyword, setKeyword] = useState('')
  const [viewMode, setViewMode] = useState<ClothingViewMode>(loadViewMode)
  const [wearingId, setWearingId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(createDefaultCollapsed)
  const [previewItem, setPreviewItem] = useState<ClothingItem | null>(null)

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items],
  )

  const totalSavings = useMemo(
    () => calcTotalSavings(items, savingsConfig),
    [items, savingsConfig],
  )

  const filtered = useMemo(() => {
    return items.filter((item) =>
      matchesWardrobeFilters(
        item,
        selectedCategories,
        selectedSeasons,
        selectedValueTiers,
        keyword,
        savingsConfig,
      ),
    )
  }, [items, selectedCategories, selectedSeasons, selectedValueTiers, keyword, savingsConfig])

  const toggleCategory = (c: ClothingCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    )
  }

  const toggleSeason = (s: Season) => {
    setSelectedSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const toggleValueTier = (t: ValueTierKey) => {
    setSelectedValueTiers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  const toggleGroup = (category: ClothingCategory) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const handleViewModeChange = (mode: ClothingViewMode) => {
    setViewMode(mode)
    saveViewMode(mode)
  }

  const handleWearOnce = async (id: string) => {
    setWearingId(id)
    try {
      await wearOnce(id)
    } finally {
      setWearingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeItem(id)
      if (previewItem?.id === id) setPreviewItem(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleStartOutfit = () => {
    if (!previewItem) return
    const id = previewItem.id
    setPreviewItem(null)
    startWithItem(id)
  }

  return (
    <div className="px-4 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs tracking-widest text-neutral-400">WARDROBE</p>
          <h1 className="text-xl font-semibold text-neutral-900">我的衣橱</h1>
        </div>
        <Link
          to="/add"
          className="flex h-9 items-center gap-1 rounded-full bg-neutral-900 px-3 text-xs font-medium text-white"
        >
          <Plus size={14} />
          添加
        </Link>
      </header>

      {!loading && items.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-500">衣橱总价值</p>
            <p className="text-lg font-semibold text-neutral-900">{formatPrice(totalPrice)}</p>
            <p className="text-[10px] text-neutral-400">共 {items.length} 件单品</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs text-emerald-700">累计省钱</p>
            <p className="text-lg font-semibold text-emerald-800">{formatSavings(totalSavings)}</p>
            <p className="text-[10px] text-emerald-600/70">血赚后每次省 ¥{savingsConfig.extraWearSavings}</p>
          </div>
        </div>
      )}

      <div className="relative mb-3">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索单品名称"
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400"
        />
      </div>

      <WardrobeFilterBar
        categories={selectedCategories}
        seasons={selectedSeasons}
        valueTiers={selectedValueTiers}
        onToggleCategory={toggleCategory}
        onToggleSeason={toggleSeason}
        onToggleValueTier={toggleValueTier}
      />

      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-neutral-400">加载中…</div>
      ) : (
        <>
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs text-neutral-400">筛选结果 {filtered.length} 件</p>
            <ViewModeSwitcher value={viewMode} onChange={handleViewModeChange} />
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-sm text-neutral-400">
              {items.length === 0 ? '还没有单品，点击右上角添加' : '暂无匹配单品'}
            </div>
          ) : (
            <CategoryGroupList
              items={filtered}
              viewMode={viewMode}
              savingsConfig={savingsConfig}
              collapsed={collapsed}
              onToggleGroup={toggleGroup}
              onWearOnce={handleWearOnce}
              wearingId={wearingId}
              onEdit={(id) => navigate(`/wardrobe/edit/${id}`)}
              onPreview={setPreviewItem}
              onDelete={handleDelete}
            />
          )}
        </>
      )}

      <ClothingImagePreview
        item={previewItem}
        savingsConfig={savingsConfig}
        onClose={() => setPreviewItem(null)}
        onEdit={() => {
          if (previewItem) {
            setPreviewItem(null)
            navigate(`/wardrobe/edit/${previewItem.id}`)
          }
        }}
        onStartOutfit={handleStartOutfit}
      />

      {modals}
    </div>
  )
}
