import { Link } from 'react-router-dom'
import { Cake, ChevronRight, LogOut, Settings2, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSettings } from '../contexts/SettingsContext'

const entries = [
  {
    to: '/settings/birthdays',
    label: '生日管理',
    desc: '管理本人与好友生日',
    icon: Cake,
    countKey: 'birthdays' as const,
  },
  {
    to: '/settings/events',
    label: '活动管理',
    desc: '纪念日等特殊活动',
    icon: Sparkles,
    countKey: 'events' as const,
  },
  {
    to: '/settings/config',
    label: '配置管理',
    desc: '生日提前提醒等设置',
    icon: Settings2,
    countKey: null,
  },
]

export function SettingsPage() {
  const { signOut } = useAuth()
  const { profile, friends, events, loading, error } = useSettings()

  const counts = {
    birthdays:
      (profile.birthdayMonth != null ? 1 : 0) + friends.length,
    events: events.length,
  }

  if (loading) {
    return <div className="px-4 py-16 text-center text-sm text-neutral-400">加载中…</div>
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <header className="mb-5">
        <p className="text-xs tracking-widest text-neutral-400">SETTINGS</p>
        <h1 className="text-xl font-semibold text-neutral-900">设置</h1>
      </header>

      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {entries.map(({ to, label, desc, icon: Icon, countKey }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-4 shadow-sm transition hover:border-neutral-300"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
              <Icon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-900">{label}</p>
              <p className="text-xs text-neutral-500">{desc}</p>
            </div>
            {countKey && (
              <span className="text-xs text-neutral-400">{counts[countKey]} 项</span>
            )}
            <ChevronRight size={18} className="shrink-0 text-neutral-300" />
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-sm text-neutral-600 hover:bg-neutral-50"
      >
        <LogOut size={16} />
        退出登录
      </button>
    </div>
  )
}
