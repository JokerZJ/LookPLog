import { useMemo, useState } from 'react'
import { Cake, Trash2, User } from 'lucide-react'
import { AddBirthdayModal } from '../../components/settings/AddBirthdayModal'
import { FabButton } from '../../components/settings/FabButton'
import { SettingsBackHeader } from '../../components/settings/SettingsBackHeader'
import { useSettings } from '../../contexts/SettingsContext'
import type { BirthdayListItem } from '../../types/settings'

export function BirthdayManagementPage() {
  const { profile, friends, loading, updateProfile, addFriend, removeFriend } = useSettings()
  const [modalOpen, setModalOpen] = useState(false)

  const list = useMemo(() => {
    const items: BirthdayListItem[] = []
    if (profile.birthdayMonth != null && profile.birthdayDay != null) {
      items.push({
        id: 'self',
        name: '我',
        month: profile.birthdayMonth,
        day: profile.birthdayDay,
        isLunar: profile.birthdayIsLunar,
        isSelf: true,
      })
    }
    for (const f of friends) {
      items.push({
        id: f.id,
        name: f.name,
        month: f.month,
        day: f.day,
        isLunar: f.isLunar,
        isSelf: false,
      })
    }
    return items
  }, [profile, friends])

  const handleAdd = async (data: {
    name: string
    month: number
    day: number
    isLunar: boolean
    isSelf: boolean
  }) => {
    if (data.isSelf) {
      await updateProfile({
        birthdayMonth: data.month,
        birthdayDay: data.day,
        birthdayIsLunar: data.isLunar,
      })
    } else {
      await addFriend({
        name: data.name,
        month: data.month,
        day: data.day,
        isLunar: data.isLunar,
      })
    }
  }

  const handleDelete = async (item: BirthdayListItem) => {
    if (item.isSelf) {
      await updateProfile({
        birthdayMonth: null,
        birthdayDay: null,
        birthdayIsLunar: false,
      })
    } else {
      await removeFriend(item.id)
    }
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-400">加载中…</div>
  }

  return (
    <div className="relative px-4 pt-4 pb-24">
      <SettingsBackHeader title="生日管理" subtitle="BIRTHDAYS" />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-16 text-center">
          <Cake size={32} className="mx-auto mb-3 text-neutral-300" />
          <p className="text-sm text-neutral-500">还没有录入生日</p>
          <p className="mt-1 text-xs text-neutral-400">点击右下角添加</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
            >
              <span
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                  item.isSelf ? 'bg-neutral-900 text-white' : 'bg-amber-50 text-amber-600',
                ].join(' ')}
              >
                {item.isSelf ? <User size={18} /> : <Cake size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-900">{item.name}</p>
                <p className="text-xs text-neutral-500">
                  {item.month} 月 {item.day} 日 · {item.isLunar ? '农历' : '阳历'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="shrink-0 text-neutral-400 hover:text-red-500"
                aria-label="删除"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <FabButton onClick={() => setModalOpen(true)} label="新增生日" />

      <AddBirthdayModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
        hasSelfBirthday={profile.birthdayMonth != null && profile.birthdayDay != null}
      />
    </div>
  )
}
