import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface SettingsBackHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
}

export function SettingsBackHeader({
  title,
  subtitle,
  backTo = '/settings',
}: SettingsBackHeaderProps) {
  return (
    <header className="mb-5 flex items-center gap-3">
      <Link
        to={backTo}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-600"
      >
        <ArrowLeft size={16} />
      </Link>
      <div>
        {subtitle && <p className="text-xs tracking-widest text-neutral-400">{subtitle}</p>}
        <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
      </div>
    </header>
  )
}
