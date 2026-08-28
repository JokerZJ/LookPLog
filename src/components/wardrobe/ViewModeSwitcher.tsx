import type { ClothingViewMode } from './ClothingCard'
import { Grid2x2, Grid3x3, List, ListTree } from 'lucide-react'

const MODES: Array<{ mode: ClothingViewMode; icon: typeof Grid2x2; label: string }> = [
  { mode: 'grid-full', icon: Grid2x2, label: '宫格完整' },
  { mode: 'grid-compact', icon: Grid3x3, label: '宫格简约' },
  { mode: 'list-full', icon: List, label: '列表详细' },
  { mode: 'list-compact', icon: ListTree, label: '列表简约' },
]

interface ViewModeSwitcherProps {
  value: ClothingViewMode
  onChange: (mode: ClothingViewMode) => void
}

export function ViewModeSwitcher({ value, onChange }: ViewModeSwitcherProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      {MODES.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          aria-label={label}
          title={label}
          className={[
            'flex h-7 w-7 items-center justify-center rounded-md transition',
            value === mode
              ? 'bg-neutral-900 text-white'
              : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700',
          ].join(' ')}
        >
          <Icon size={15} strokeWidth={value === mode ? 2.2 : 1.8} />
        </button>
      ))}
    </div>
  )
}

export function getViewContainerClass(mode: ClothingViewMode): string {
  switch (mode) {
    case 'grid-compact':
      return 'grid grid-cols-3 gap-1'
    case 'list-full':
    case 'list-compact':
      return 'flex flex-col gap-2'
    default:
      return 'grid grid-cols-2 gap-3'
  }
}

const STORAGE_KEY = 'lookplog-wardrobe-view'
const MODE_VALUES = MODES.map((m) => m.mode)

export function loadViewMode(): ClothingViewMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && MODE_VALUES.includes(saved as ClothingViewMode)) {
      return saved as ClothingViewMode
    }
  } catch {
    /* ignore */
  }
  return 'list-full'
}

export function saveViewMode(mode: ClothingViewMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}
