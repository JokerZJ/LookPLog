import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { CALENDAR_TYPE_LABELS } from '../../types/settings'

interface AddBirthdayModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    name: string
    month: number
    day: number
    isLunar: boolean
    isSelf: boolean
  }) => Promise<void>
  hasSelfBirthday: boolean
}

export function AddBirthdayModal({
  open,
  onClose,
  onSubmit,
  hasSelfBirthday,
}: AddBirthdayModalProps) {
  const [name, setName] = useState('')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [isLunar, setIsLunar] = useState(false)
  const [isSelf, setIsSelf] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setName('')
    setMonth('1')
    setDay('1')
    setIsLunar(false)
    setIsSelf(false)
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isSelf && !name.trim()) {
      setError('请填写姓名')
      return
    }
    if (isSelf && hasSelfBirthday) {
      setError('已设置本人生日，请先在列表中删除后重新添加')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        name: isSelf ? '我' : name.trim(),
        month: Number(month),
        day: Number(day),
        isLunar,
        isSelf,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="新增生日">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {!hasSelfBirthday && (
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={isSelf}
              onChange={(e) => setIsSelf(e.target.checked)}
              className="accent-neutral-900"
            />
            这是我的生日
          </label>
        )}

        {!isSelf && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="姓名"
            className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-neutral-500">月</span>
            <input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-neutral-500">日</span>
            <input
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <div className="flex gap-2">
          {(['solar', 'lunar'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setIsLunar(t === 'lunar')}
              className={[
                'rounded-full px-4 py-1.5 text-xs',
                isLunar === (t === 'lunar')
                  ? 'bg-neutral-900 text-white'
                  : 'border border-neutral-200 text-neutral-500',
              ].join(' ')}
            >
              {CALENDAR_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-neutral-900 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? '保存中…' : '保存'}
        </button>
      </form>
    </Modal>
  )
}
