import { useState } from 'react'
import { Sparkles, Trash2 } from 'lucide-react'
import { AddEventModal } from '../../components/settings/AddEventModal'
import { FabButton } from '../../components/settings/FabButton'
import { SettingsBackHeader } from '../../components/settings/SettingsBackHeader'
import { useSettings } from '../../contexts/SettingsContext'

export function ActivityManagementPage() {
  const { events, loading, addEvent, removeEvent } = useSettings()
  const [modalOpen, setModalOpen] = useState(false)

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-400">加载中…</div>
  }

  return (
    <div className="relative px-4 pt-4 pb-24">
      <SettingsBackHeader title="活动管理" subtitle="EVENTS" />

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
          <Sparkles size={32} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-sm text-neutral-500">还没有特殊活动</p>
          <p className="mt-1 text-xs text-neutral-400">点击右下角添加</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <Sparkles size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900">{ev.title}</p>
                <p className="text-xs text-neutral-500">
                  {ev.month} 月 {ev.day} 日 · {ev.isLunar ? '农历' : '阳历'}
                  {ev.note ? ` · ${ev.note}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeEvent(ev.id)}
                className="shrink-0 text-neutral-400 hover:text-red-500"
                aria-label="删除"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FabButton onClick={() => setModalOpen(true)} label="新增活动" />

      <AddEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addEvent}
      />
    </div>
  )
}
