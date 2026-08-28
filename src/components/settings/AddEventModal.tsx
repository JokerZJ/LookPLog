import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { CALENDAR_TYPE_LABELS } from '../../types/settings'

interface AddEventModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    month: number
    day: number
    isLunar: boolean
    note?: string
  }) => Promise<void>
}

export function AddEventModal({ open, onClose, onSubmit }: AddEventModalProps) {
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState('1')
  const [day, setDay] = useState('1')
  const [isLunar, setIsLunar] = useState(false)
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setTitle('')
    setMonth('1')
    setDay('1')
    setIsLunar(false)
    setNote('')
    setError('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('请填写活动名称')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        month: Number(month),
        day: Number(day),
        isLunar,
        note: note.trim() || undefined,
      })
      handleClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="新增活动">
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="活动名称，如：结婚纪念日"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
        />

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

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="备注（可选）"
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
        />

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
