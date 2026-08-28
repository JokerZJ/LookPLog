import { NavLink } from 'react-router-dom'
import { CalendarDays, Layers, Settings, Shirt } from 'lucide-react'

const tabs = [
  { to: '/', label: '首页', icon: CalendarDays, end: true },
  { to: '/wardrobe', label: '衣橱', icon: Shirt, end: false },
  { to: '/outfits', label: '穿搭', icon: Layers, end: false },
  { to: '/settings', label: '设置', icon: Settings, end: false },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] transition-colors',
                isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? 'text-neutral-900' : 'text-neutral-400'}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
