import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus } from 'lucide-react'
import { Stepper } from '../components/ui/Stepper'
import { useAuth } from '../contexts/AuthContext'
import { useClothing } from '../contexts/ClothingContext'
import { uploadClothingImage } from '../services/clothing'
import type { ClothingCategory, Season } from '../types'
import { ALL_CATEGORIES, CATEGORY_LABELS, SEASON_LABELS } from '../types'
import { formatCostPerWear } from '../utils/calc'

const allSeasons: Season[] = ['spring', 'summer', 'autumn', 'winter']

export function AddClothingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addItem } = useClothing()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [wearCount, setWearCount] = useState(0)
  const [category, setCategory] = useState<ClothingCategory>('top')
  const [seasons, setSeasons] = useState<Season[]>(['spring'])
  const [tempMin, setTempMin] = useState('')
  const [tempMax, setTempMax] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tip, setTip] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const toggleSeason = (s: Season) => {
    setSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )
  }

  const handleFile = (file?: File) => {
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setTip('请填写单品名称')
      return
    }
    if (!price || Number(price) < 0) {
      setTip('请填写有效购买金额')
      return
    }
    if (!imageFile) {
      setTip('请上传服装图片')
      return
    }
    if (seasons.length === 0) {
      setTip('请至少选择一个季节')
      return
    }
    if (tempMin && tempMax && Number(tempMin) > Number(tempMax)) {
      setTip('最低温不能高于最高温')
      return
    }
    if (!user) {
      setTip('请先登录')
      return
    }

    setSubmitting(true)
    setTip('')
    try {
      const imageUrl = await uploadClothingImage(imageFile, user.id)
      await addItem({
        name: name.trim(),
        imageUrl,
        price: Number(price),
        wearCount,
        category,
        seasons,
        tempMin: tempMin !== '' ? Number(tempMin) : null,
        tempMax: tempMax !== '' ? Number(tempMax) : null,
      })
      navigate('/wardrobe')
    } catch (err) {
      setTip(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <header className="mb-5 flex items-center gap-3">
        <Link
          to="/wardrobe"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-600"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-xs tracking-widest text-neutral-400">NEW ITEM</p>
          <h1 className="text-lg font-semibold text-neutral-900">添加单品</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs text-neutral-500">服装图片</span>
          <div className="relative flex aspect-[4/5] max-w-xs items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neutral-300 bg-neutral-50">
            {preview ? (
              <img src={preview} alt="预览" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-neutral-400">
                <ImagePlus size={28} />
                <span className="text-xs">点击上传图片</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs text-neutral-500">名称</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：黑色基础 T 恤"
            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-xs text-neutral-500">购买金额（元）</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
            />
          </label>
          <div className="space-y-1.5">
            <span className="text-xs text-neutral-500">已穿次数</span>
            <Stepper value={wearCount} onChange={setWearCount} />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs text-neutral-500">品类</span>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={[
                  'rounded-full px-4 py-1.5 text-xs transition',
                  category === c
                    ? 'bg-neutral-900 text-white'
                    : 'border border-neutral-200 text-neutral-500',
                ].join(' ')}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs text-neutral-500">适用季节</span>
          <div className="flex flex-wrap gap-2">
            {allSeasons.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSeason(s)}
                className={[
                  'rounded-full px-3 py-1.5 text-xs transition',
                  seasons.includes(s)
                    ? 'bg-neutral-100 text-neutral-900 ring-1 ring-neutral-300'
                    : 'border border-neutral-200 text-neutral-500',
                ].join(' ')}
              >
                {SEASON_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs text-neutral-500">推荐穿着温度（°C）</span>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-[10px] text-neutral-400">最低温</span>
              <input
                type="number"
                value={tempMin}
                onChange={(e) => setTempMin(e.target.value)}
                placeholder="如 10"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[10px] text-neutral-400">最高温</span>
              <input
                type="number"
                value={tempMax}
                onChange={(e) => setTempMax(e.target.value)}
                placeholder="如 25"
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-400"
              />
            </label>
          </div>
          <p className="mt-1.5 text-[10px] text-neutral-400">
            用于首页根据今日气温推荐穿搭，可不填
          </p>
        </div>

        {price && wearCount >= 0 && (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
            预计均价：
            <span className="ml-1 text-neutral-900">
              {formatCostPerWear(Number(price), wearCount)}
            </span>
            {wearCount === 0 && (
              <span className="ml-1 text-neutral-400">（未穿时按总价计）</span>
            )}
          </p>
        )}

        {tip && <p className="text-xs text-neutral-600">{tip}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? '上传保存中…' : '保存到衣橱'}
        </button>
      </form>
    </div>
  )
}
